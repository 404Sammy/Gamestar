"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Tournament {
  id: string;
  name: string;
  pool: string; 
  division: string; 
  pool_status: string;
  registration_open?: boolean;
}

export default function SelectTournamentPage() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchTournaments() {
      try {
        const { data, error } = await supabase
          .from("teams")
          .select("id, name, pool, division, pool_status")
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
          // Injection parameters corresponding perfectly to html UI blueprints
          setTournaments([
            { id: "mock-1", name: "Kabras Sugar", pool: "Venue TBD", division: "Men's", pool_status: "Open", registration_open: true },
            { id: "mock-2", name: "Mwamba RFC (W)", pool: "Venue TBD", division: "Women's", pool_status: "Open", registration_open: true },
            { id: "mock-3", name: "KCB Rugby", pool: "Venue TBD", division: "Men's", pool_status: "Open", registration_open: true },
            { id: "mock-4", name: "Impala Roans (W)", pool: "Venue TBD", division: "Women's", pool_status: "Open", registration_open: true },
            { id: "mock-5", name: "Kiambu Community (W)", pool: "Venue TBD", division: "Women's", pool_status: "Open", registration_open: true },
            { id: "mock-6", name: "Meru University (W)", pool: "Venue TBD", division: "Women's", pool_status: "Closed", registration_open: false },
          ]);
        } else {
          setTournaments(data.map(t => ({
            ...t,
            registration_open: t.pool_status !== "Closed"
          })));
        }
      } catch (err) {
        console.error("Error loading tournaments:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTournaments();
  } , []); 

  async function handleContinue() {
    if (!selectedId) return;
    setSubmitting(true);

    try {
      // 1. Instantly save selection details locally
      localStorage.setItem("selected_tournament_id", selectedId);
      const selectedTourney = tournaments.find(t => t.id === selectedId);
      if (selectedTourney) {
        localStorage.setItem("selected_tournament_name", selectedTourney.name);
      }

      // 2. Safely attempt background database sync
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      
      if (user && !selectedId.startsWith("mock-")) {
        await supabase.from("teams").upsert({
          team_manager_user_id: user.id,
          tournament_id: selectedId,
          team_registration_complete: false
        });
      } else {
        console.warn("No active authenticated user. Setting local storage mock progress step flag.");
        // Set both explicit fallback tracking state flags
        localStorage.setItem("mock_gate_progress", "needs_registration");
      }
      
    } catch (err) {
      console.warn("Background database sync skipped or failed:", err);
    } finally {
      setSubmitting(false);
      // 3. Force an immediate hard location change to clear router synchronization lags
      window.location.href = "/team-manager/team-registration";
    }
  }

  if (loading) {
    return <div className="p-4 text-xs text-neutral-500">Loading open tournaments...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-base font-semibold text-neutral-900">Select a tournament</h1>
        <p className="text-xs text-neutral-500 mt-0.5">Choose the tournament you want to register your team for</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-3 text-xs flex gap-2.5 items-start">
        <span>ℹ️</span>
        <div>You must select a tournament and complete team registration before accessing the roster, player registration, fixtures, or stats.</div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5 pb-2 border-b border-neutral-100">
          <span>🏆</span> Open tournaments accepting registration
        </div>

        <div className="space-y-2">
          {tournaments.map((tournament) => {
            const isClosed = tournament.registration_open === false;
            const isSelected = selectedId === tournament.id;

            return (
              <button
                key={tournament.id}
                disabled={isClosed}
                type="button"
                onClick={() => setSelectedId(tournament.id)}
                className={`w-full text-left p-3 border rounded-lg flex items-center gap-3 transition-all ${
                  isClosed 
                    ? "opacity-40 cursor-not-allowed bg-neutral-50 border-neutral-200" 
                    : isSelected
                    ? "border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-600"
                    : "border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                <div className={`w-9 h-9 rounded-md flex items-center justify-center font-medium ${isSelected ? "bg-emerald-100 text-emerald-800" : "bg-neutral-100 text-neutral-600"}`}>
                  🏆
                </div>
                
                <div className="flex-1">
                  <div className="text-xs font-semibold text-neutral-900">{tournament.name}</div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">📍 {tournament.pool || "Venue TBD"}</div>
                </div>

                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isClosed ? "bg-neutral-200 text-neutral-600" : "bg-emerald-50 text-emerald-700"}`}>
                  {isClosed ? "Closed" : "Open"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleContinue}
          disabled={!selectedId || submitting}
          className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-medium text-xs py-2 px-4 rounded-md transition-all flex items-center gap-1"
        >
          {submitting ? "Saving..." : "Continue to team registration →"}
        </button>
      </div>
    </div>
  );
}