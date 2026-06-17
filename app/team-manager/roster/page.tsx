"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Player = {
  id: string;
  name: string;
  jersey_number: string;
  position: string;
  created_at: string;
  id_front_url: string | null;
  id_back_url: string | null;
};

export default function TeamRoster() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamName, setTeamName] = useState("Your Team");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "flagged" | "verified">("all");

  useEffect(() => {
    async function fetchRosterData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          console.warn("Using development mock data for squad roster.");
          const savedTournament = localStorage.getItem("selected_tournament_name") || "Kabras Sugar";
          setTeamName(savedTournament);
          setPlayers([
            { id: "1", name: "James Kariuki", jersey_number: "14", position: "Forward", created_at: new Date().toISOString(), id_front_url: "present", id_back_url: null },
            { id: "2", name: "Brian Onyango", jersey_number: "4", position: "Defender", created_at: new Date().toISOString(), id_front_url: "present", id_back_url: "present" },
            { id: "3", name: "Kevin Omondi", jersey_number: "10", position: "Midfielder", created_at: new Date().toISOString(), id_front_url: null, id_back_url: "present" },
          ]);
          return;
        }

        const { data: team } = await supabase
          .from("teams")
          .select("*")
          .eq("team_manager_user_id", user.id)
          .maybeSingle();

        if (team) {
          setTeamName(team.name || "Your Team");
          const { data: playersData } = await supabase
            .from("players")
            .select("*")
            .eq("team_id", team.id)
            .order("jersey_number", { ascending: true });

          if (playersData) {
            setPlayers(playersData as Player[]);
          }
        }
      } catch (err) {
        console.error("Roster query operational error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRosterData();
  }, []);

  // Filter pipeline based on both search parameter state and tab state selection
  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      player.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.jersey_number?.includes(searchTerm) ||
      player.position?.toLowerCase().includes(searchTerm.toLowerCase());

    const isVerified = player.id_front_url && player.id_back_url;

    if (activeTab === "verified") return matchesSearch && isVerified;
    if (activeTab === "flagged") return matchesSearch && !isVerified;
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-2">
      {/* Header and Add Player Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">{teamName}</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Official Tournament Roster Management</p>
        </div>
        <Link
          href="/team-manager/register"
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          ➕ Add Player
        </Link>
      </div>

      {/* Filtering Actions and Search Matrix controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-neutral-200 shadow-sm">
        {/* Filter Tabs */}
        <div className="flex bg-neutral-100 p-0.5 rounded-lg border border-neutral-200/50 self-start text-xs font-medium">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1 rounded-md transition-colors ${activeTab === "all" ? "bg-white text-neutral-900 shadow-xs font-semibold" : "text-neutral-500 hover:text-neutral-900"}`}
          >
            All ({players.length})
          </button>
          <button
            onClick={() => setActiveTab("flagged")}
            className={`px-3 py-1 rounded-md transition-colors ${activeTab === "flagged" ? "bg-white text-amber-700 shadow-xs font-semibold" : "text-neutral-500 hover:text-amber-600"}`}
          >
            Flagged ({players.filter((p) => !p.id_front_url || !p.id_back_url).length})
          </button>
          <button
            onClick={() => setActiveTab("verified")}
            className={`px-3 py-1 rounded-md transition-colors ${activeTab === "verified" ? "bg-white text-emerald-700 shadow-xs font-semibold" : "text-neutral-500 hover:text-emerald-600"}`}
          >
            Verified ({players.filter((p) => p.id_front_url && p.id_back_url).length})
          </button>
        </div>

        {/* Search Bar Input element */}
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Search name, jersey, position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-8 py-1.5 text-xs rounded-lg border border-neutral-300 bg-neutral-50/50 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-neutral-800"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Roster Grid Array Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold">
                <th className="p-3 w-20 text-center">Jersey</th>
                <th className="p-3">Player Name</th>
                <th className="p-3">Position</th>
                <th className="p-3">Date Added</th>
                <th className="p-3 text-center">ID Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-400 italic">
                    No matching squad assets found for this filter selection.
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player) => {
                  const hasFront = !!player.id_front_url;
                  const hasBack = !!player.id_back_url;
                  const isFullyVerified = hasFront && hasBack;

                  return (
                    <tr key={player.id} className="hover:bg-neutral-50/40 transition-colors">
                      <td className="p-3 text-center font-mono font-bold text-sm text-neutral-700">
                        #{player.jersey_number || "—"}
                      </td>
                      <td className="p-3 font-medium text-neutral-900">{player.name}</td>
                      <td className="p-3 text-neutral-600">
                        <span className="px-1.5 py-0.5 rounded-md bg-neutral-100 border border-neutral-200 text-neutral-700 text-[10px]">
                          {player.position || "Unassigned"}
                        </span>
                      </td>
                      <td className="p-3 text-neutral-400">
                        {new Date(player.created_at).toLocaleDateString("en-KE")}
                      </td>
                      <td className="p-3 text-center">
                        {isFullyVerified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                            ✓ Verified
                          </span>
                        ) : (
                          <span className="inline-flex flex-col gap-0.5 items-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-red-50 text-red-600 border border-red-100">
                              𐄂 Flagged
                            </span>
                            <span className="text-[9px] text-neutral-400">
                              {!hasFront && !hasBack ? "Missing Both IDs" : !hasFront ? "Missing Front ID" : "Missing Back ID"}
                            </span>
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {!isFullyVerified ? (
                          <Link
                            href="/team-manager/register"
                            className="inline-flex items-center px-2 py-1 text-[11px] font-medium rounded bg-amber-600 hover:bg-amber-700 text-white transition-colors"
                          >
                            Fix Uploads
                          </Link>
                        ) : (
                          <span className="text-[11px] text-neutral-400 italic">No actions needed</span>
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
  );
}