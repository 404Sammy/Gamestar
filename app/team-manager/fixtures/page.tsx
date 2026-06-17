"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function FixturesPage() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFixtures() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          // Dev Fallback tracking matches
          setFixtures([
            { id: "m1", round: "Round 1", kickoff_time: new Date().toISOString(), status: "Scheduled", home_team: "Kabras Sugar", away_team: "Gor Mahia FC" },
            { id: "m2", round: "Round 2", kickoff_time: new Date(Date.now() + 86400000 * 3).toISOString(), status: "Scheduled", home_team: "AFC Leopards", away_team: "Kabras Sugar" }
          ]);
          return;
        }

        const { data: team } = await supabase.from("teams").select("id").eq("team_manager_user_id", user.id).maybeSingle();

        if (team) {
          const { data: matches } = await supabase
            .from("matches")
            .select("id, kickoff_time, status, round, home_team_id, away_team_id")
            .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`)
            .order("kickoff_time", { ascending: true });

          if (matches) {
            // Flatten relational naming arrays safely
            const resolvedMatches = await Promise.all(
              matches.map(async (m) => {
                const { data: home } = await supabase.from("teams").select("name").eq("id", m.home_team_id).single();
                const { data: away } = await supabase.from("teams").select("name").eq("id", m.away_team_id).single();
                return {
                  ...m,
                  home_team: home?.name || "Home Side",
                  away_team: away?.name || "Away Side",
                };
              })
            );
            setFixtures(resolvedMatches);
          }
        }
      } catch (err) {
        console.error("Calendar parsing routine failure:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFixtures();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Match Calendar</h1>
        <p className="text-xs text-neutral-500 mt-0.5">Official upcoming tournament fixtures, groupings, and schedule windows.</p>
      </div>

      <div className="space-y-4">
        {fixtures.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center text-neutral-400 italic text-xs">
            No fixtures scheduled for your squad context at this stage.
          </div>
        ) : (
          fixtures.map((match) => (
            <div key={match.id} className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <span className="px-2 py-0.5 font-bold rounded-md bg-neutral-100 border border-neutral-200 text-neutral-600 uppercase text-[9px] tracking-wider">
                  {match.round || "Tournament Tie"}
                </span>
                <div className="flex items-center gap-3 pt-1 text-sm text-neutral-800">
                  <span className="font-semibold">{match.home_team}</span>
                  <span className="text-neutral-400 font-normal">vs</span>
                  <span className="font-semibold">{match.away_team}</span>
                </div>
              </div>
              <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-100">
                <span className="font-mono text-neutral-600 font-medium">
                  ⏰ {new Date(match.kickoff_time).toLocaleDateString("en-KE", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  {match.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}