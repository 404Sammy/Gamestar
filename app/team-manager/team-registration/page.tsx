"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function TeamRegistrationPage() {
  const router = useRouter();
  const [tournamentName, setTournamentName] = useState<string>("Selected Tournament");
  const [submitting, setSubmitting] = useState(false);
  
  const [teamName, setTeamName] = useState("");
  const [category, setCategory] = useState("Men's");
  const [coachName, setCoachName] = useState("");
  const [coachPhone, setCoachPhone] = useState("");
  const [homeGround, setHomeGround] = useState("");

  useEffect(() => {
    const savedName = localStorage.getItem("selected_tournament_name");
    if (savedName) {
      setTournamentName(savedName);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!teamName.trim()) return;
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const savedTournamentId = localStorage.getItem("selected_tournament_id") || "mock-id";

      if (user) {
        const { error } = await supabase.from("teams").upsert({
          team_manager_user_id: user.id,
          tournament_id: savedTournamentId,
          name: teamName,
          division: category, 
          pool: tournamentName, 
          team_registration_complete: true,
          pool_status: "Pending review" 
        });

        if (error) throw error;
      } else {
        // Fallback for mock session workflow completion
        localStorage.setItem("mock_registration_complete", "true");
      }

      // Hard navigation reload causes Layout component to recalculate state conditions instantly
      window.location.href = "/team-manager/dashboard";
    } catch (err) {
      console.error("Critical error during team registration submission:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-neutral-900">Team registration</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Register <span className="font-medium text-neutral-800">{teamName || "your team"}</span> for <span className="font-medium text-emerald-700">{tournamentName}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/team-manager/select-tournament")}
          className="text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 px-2.5 py-1.5 rounded-md shadow-sm transition-colors"
        >
          🔄 Change tournament
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm space-y-4">
        <div className="text-xs font-semibold text-neutral-900 pb-2 border-b border-neutral-100">
          📝 Team Details
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-neutral-600 mb-1">Team Name *</label>
            <input
              type="text"
              required
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Nakuru RFC"
              className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-neutral-50/50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-600 mb-1">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs px-2 py-2 border border-neutral-200 rounded-md focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-neutral-50/50"
            >
              <option value="Men's">Men's Drop</option>
              <option value="Women's">Women's Drop</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-neutral-600 mb-1">Coach Name</label>
              <input
                type="text"
                value={coachName}
                onChange={(e) => setCoachName(e.target.value)}
                placeholder="Coach Full Name"
                className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:border-emerald-600 bg-neutral-50/50"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-neutral-600 mb-1">Coach Phone</label>
              <input
                type="tel"
                value={coachPhone}
                onChange={(e) => setCoachPhone(e.target.value)}
                placeholder="e.g. 0712345678"
                className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:border-emerald-600 bg-neutral-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-600 mb-1">Home Ground</label>
            <input
              type="text"
              value={homeGround}
              onChange={(e) => setHomeGround(e.target.value)}
              placeholder="e.g. Kasarani Stadium"
              className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:border-emerald-600 bg-neutral-50/50"
            />
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3 text-xs flex gap-2.5 items-start mt-2">
          <span>⚠️</span>
          <div>Once submitted, this registers your team into {tournamentName}. You can then immediately begin adding players to your squad roster.</div>
        </div>

        <div className="flex justify-end pt-2 border-t border-neutral-100">
          <button
            type="submit"
            disabled={!teamName.trim() || submitting}
            className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-medium text-xs py-2 px-5 rounded-md transition-all"
          >
            {submitting ? "Processing registration..." : "Submit team registration"}
          </button>
        </div>
      </form>
    </div>
  );
}