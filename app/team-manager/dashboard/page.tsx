"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Dashboard() {
  const [stats, setStats] = useState<any>({
    playersCount: 0,
    verifiedCount: 0,
    poolName: "Pending flag",
    isValidated: false,
  });
  const [nextFixture, setNextFixture] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getDashboardData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          console.warn("Using development mock data for dashboard visuals.");
          const savedTournament = localStorage.getItem("selected_tournament_name") || "Kabras Sugar";
          const mockPlayers = [
            { id: "1", name: "James Kariuki", jersey_number: "14", id_front_url: "present", id_back_url: null },
            { id: "2", name: "Brian Onyango", jersey_number: "4", id_front_url: "present", id_back_url: "present" },
            { id: "3", name: "Kevin Omondi", jersey_number: "10", id_front_url: null, id_back_url: "present" },
          ];
          
          setPlayers(mockPlayers);
          setStats({
            playersCount: mockPlayers.length,
            verifiedCount: mockPlayers.filter(p => p.id_front_url && p.id_back_url).length,
            poolName: savedTournament,
            isValidated: false,
          });
          setNextFixture({
            home_team_name: "Kabras Sugar",
            away_team_name: "Gor Mahia FC",
            kickoff_time: "Sat, 4:00 PM"
          });
          return;
        }

        // --- Production Supabase Data Pipeline ---
        const { data: team, error: teamError } = await supabase
          .from("teams")
          .select("*")
          .eq("team_manager_user_id", user.id)
          .maybeSingle();

        if (teamError || !team) throw teamError || new Error("Team context missing.");

        const { data: playersData, error: playersError } = await supabase
          .from("players")
          .select("*")
          .eq("team_id", team.id);

        if (playersError) throw playersError;

        // Using standard join format for Supabase multi-relation matching
        const { data: fixture, error: fixtureError } = await supabase
          .from("matches")
          .select(`
            id,
            kickoff_time,
            status,
            home_team_id,
            away_team_id
          `)
          .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`)
          .order("kickoff_time", { ascending: true })
          .limit(1)
          .maybeSingle();

        const safePlayers = playersData || [];
        const verified = safePlayers.filter(p => p.id_front_url && p.id_back_url).length;

        setPlayers(safePlayers);
        setStats({
          playersCount: safePlayers.length,
          verifiedCount: verified,
          poolName: team.pool || "Unassigned",
          isValidated: !!team.validated,
        });

        if (fixture) {
          // Dynamic query for the specific names to avoid the internal array-type mapping error
          const { data: homeTeam } = await supabase.from("teams").select("name").eq("id", fixture.home_team_id).single();
          const { data: awayTeam } = await supabase.from("teams").select("name").eq("id", fixture.away_team_id).single();

          setNextFixture({
            home_team_name: homeTeam?.name || "Home Team",
            away_team_name: awayTeam?.name || "Away Team",
            kickoff_time: new Date(fixture.kickoff_time).toLocaleDateString("en-KE", {
              weekday: "short",
              hour: "2-digit",
              minute: "2-digit"
            }),
          });
        }
      } catch (err) {
        console.error("Dashboard engine runtime failure:", err);
      } finally {
        setLoading(false);
      }
    }

    getDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"></div>
      </div>
    );
  }

  const flaggedPlayers = players.filter(p => !p.id_front_url || !p.id_back_url).map(p => {
    const missing = [];
    if (!p.id_front_url) missing.push("ID front photo");
    if (!p.id_back_url) missing.push("ID back photo");
    return `${p.name} (#${p.jersey_number || "N/A"}) missing ${missing.join(" and ")}`;
  });

  const maxPlayers = 25;
  const registrationProgress = Math.min((stats.playersCount / maxPlayers) * 100, 100);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Dashboard</h1>
        <p className="text-xs text-neutral-500 mt-0.5">Welcome to your team management console. Your registration is complete.</p>
      </div>

      {/* 4 Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Registered Counter */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">Players Registered</span>
            <span className="text-2xl font-bold text-neutral-800 block mt-1">{stats.playersCount} <span className="text-xs font-normal text-neutral-400">/ {maxPlayers} max</span></span>
          </div>
          <div className="w-full bg-neutral-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-600 h-full transition-all duration-300" style={{ width: `${registrationProgress}%` }}></div>
          </div>
        </div>

        {/* Card 2: ID Verified counter */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
          <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">ID Verified</span>
          <span className="text-2xl font-bold text-emerald-700 block mt-1">{stats.verifiedCount}</span>
          <span className="text-[10px] text-neutral-400 block mt-2">
            {flaggedPlayers.length > 0 ? `${flaggedPlayers.length} squad actions pending` : "All players cleared"}
          </span>
        </div>

        {/* Card 3: Pool Status Badge */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col justify-between items-start">
          <div>
            <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">Pool Status</span>
            <div className="mt-2">
              {stats.isValidated ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  🛡️ {stats.poolName}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  ⚠️ Pending flag
                </span>
              )}
            </div>
          </div>
          <span className="text-[10px] text-neutral-400 block mt-2">Requires verification clearing</span>
        </div>

        {/* Card 4: Closest Fixture Tracker */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
          <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">Next Fixture</span>
          {nextFixture ? (
            <div className="mt-1">
              <span className="text-xs font-bold text-neutral-800 line-clamp-1">vs {nextFixture.home_team_name === stats.poolName ? nextFixture.away_team_name : nextFixture.home_team_name}</span>
              <span className="text-[10px] font-medium text-emerald-600 block mt-1">🗓️ {nextFixture.kickoff_time}</span>
            </div>
          ) : (
            <span className="text-xs font-medium text-neutral-400 block mt-2">No fixtures yet</span>
          )}
        </div>
      </div>

      {/* Warning Banner block for pending elements */}
      {flaggedPlayers.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 text-amber-900 rounded-xl p-4 flex gap-2.5 items-start">
          <span className="text-base mt-0.5">⚠️</span>
          <div className="text-xs space-y-1">
            <p className="font-bold">{flaggedPlayers.length} players flagged on validation check:</p>
            <ul className="list-disc pl-4 space-y-0.5 opacity-90">
              {flaggedPlayers.map((alert, i) => (
                <li key={i}>{alert}</li>
              ))}
            </ul>
            <p className="pt-1 text-[11px] text-amber-700 font-medium">Fix these issues to clear the squad baseline and unlock the tournament credentials.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Quick Actions Action Block Router */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 lg:col-span-1">
          <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Quick Actions</h2>
          <nav className="divide-y divide-neutral-100 text-xs">
            <Link href="/team-manager/register" className="flex items-center justify-between py-2.5 group hover:text-emerald-700 transition-colors">
              <div className="flex items-center gap-2"><span>➕</span> <div><p className="font-medium text-neutral-700 group-hover:text-emerald-700">Register a player</p><p className="text-[10px] text-neutral-400">Add roster capacity</p></div></div>
              <span className="text-neutral-300 group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
            {flaggedPlayers.length > 0 && (
              <Link href="/team-manager/roster" className="flex items-center justify-between py-2.5 group hover:text-amber-700 transition-colors">
                <div className="flex items-center gap-2"><span>🔧</span> <div><p className="font-medium text-neutral-700 group-hover:text-amber-700">Fix flagged players</p><p className="text-[10px] text-neutral-400">Resolve photo issues</p></div></div>
                <span className="text-neutral-300 group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            )}
            <Link href="/team-manager/fixtures" className="flex items-center justify-between py-2.5 group hover:text-emerald-700 transition-colors">
              <div className="flex items-center gap-2"><span>🗓️</span> <div><p className="font-medium text-neutral-700 group-hover:text-emerald-700">View fixtures</p><p className="text-[10px] text-neutral-400">Check match calendars</p></div></div>
              <span className="text-neutral-300 group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
            <Link href="/team-manager/stats" className="flex items-center justify-between py-2.5 group hover:text-emerald-700 transition-colors">
              <div className="flex items-center gap-2"><span>📈</span> <div><p className="font-medium text-neutral-700 group-hover:text-emerald-700">View stats</p><p className="text-[10px] text-neutral-400">Performance logs</p></div></div>
              <span className="text-neutral-300 group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </nav>
        </div>

        {/* Validation Status Table Matrix view */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 lg:col-span-2">
          <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Validation Status</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 text-neutral-400 font-medium">
                  <th className="pb-2 font-semibold">Player Details</th>
                  <th className="pb-2 font-semibold text-center">Jersey</th>
                  <th className="pb-2 font-semibold text-right">Verification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {players.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-neutral-400 italic">No players registered on this roster matrix yet.</td>
                  </tr>
                ) : (
                  players.map((p) => {
                    const isPassed = p.id_front_url && p.id_back_url;
                    return (
                      <tr key={p.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="py-2.5 font-medium text-neutral-800">{p.name}</td>
                        <td className="py-2.5 text-center font-mono text-neutral-500">#{p.jersey_number || "—"}</td>
                        <td className="py-2.5 text-right">
                          {isPassed ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                              ✓ Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-red-50 text-red-600 border border-red-100">
                              𐄂 Missing ID documents
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}