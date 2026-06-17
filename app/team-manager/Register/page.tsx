"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function TeamRegistration() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [teamId, setTeamId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: "",
    jerseyNumber: "",
    position: "Forward",
  });
  
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);

  // Retrieve team relationship identifier dynamically based on authentication layer state
  useEffect(() => {
    async function resolveTeamContext() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: team } = await supabase
          .from("teams")
          .select("id")
          .eq("team_manager_user_id", user.id)
          .maybeSingle();
        
        if (team) setTeamId(team.id);
      }
    }
    resolveTeamContext();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idFront || !idBack) {
      alert("Missing Documents: Please select both front and back identity photos.");
      return;
    }

    setLoading(true);

    try {
      // 1. Resolve storage buckets destinations
      const frontExt = idFront.name.split(".").pop();
      const backExt = idBack.name.split(".").pop();
      const timestamp = Date.now();
      
      const frontPath = `ids/${timestamp}_front.${frontExt}`;
      const backPath = `ids/${timestamp}_back.${backExt}`;

      // 2. Binary storage asset persistence delivery execution pipelines
      const { data: frontData, error: frontError } = await supabase.storage
        .from("player-ids")
        .upload(frontPath, idFront);
      if (frontError) throw frontError;

      const { data: backData, error: backError } = await supabase.storage
        .from("player-ids")
        .upload(backPath, idBack);
      if (backError) throw backError;

      // 3. Row database structural persistence entry payload block mapping 
      const targetTeamId = teamId || "00000000-0000-0000-0000-000000000000"; // Mock fallback safety constraint
      
      const { error: dbError } = await supabase.from("players").insert([
        {
          name: formData.fullName,
          jersey_number: formData.jerseyNumber,
          position: formData.position,
          id_front_url: frontData.path,
          id_back_url: backData.path,
          team_id: targetTeamId,
        },
      ]);

      if (dbError) throw dbError;

      alert(`${formData.fullName} has been successfully saved to the squad matrix.`);
      
      // Clear tracking variables structures
      setFormData({ fullName: "", jerseyNumber: "", position: "Forward" });
      setIdFront(null);
      setIdBack(null);
      
      const consentBox = document.getElementById("consent") as HTMLInputElement;
      if (consentBox) consentBox.checked = false;

      router.push("/team-manager/roster");
    } catch (error: any) {
      console.error("Player ingestion framework failure:", error);
      alert(`Registration Failed: ${error.message || "Unknown error parsing uploads."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-2 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Player Registration</h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Ingest new tournament athletes. All biometric processing aligns with DPA directives.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 space-y-4">
        {/* Full Name field */}
        <div className="space-y-1">
          <label htmlFor="name" className="text-xs font-semibold text-neutral-700 block">
            Full Name (As shown on Document)
          </label>
          <input
            id="name"
            type="text"
            placeholder="e.g. John Doe"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-emerald-500 transition-colors text-neutral-800"
          />
        </div>

        {/* Configuration Row for Position and Jersey attributes */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="jersey" className="text-xs font-semibold text-neutral-700 block">
              Jersey Number
            </label>
            <input
              id="jersey"
              type="number"
              placeholder="10"
              required
              value={formData.jerseyNumber}
              onChange={(e) => setFormData({ ...formData, jerseyNumber: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-emerald-500 transition-colors text-neutral-800"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="position" className="text-xs font-semibold text-neutral-700 block">
              Field Position
            </label>
            <select
              id="position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 bg-white focus:outline-none focus:border-emerald-500 transition-colors text-neutral-800"
            >
              <option value="Forward">Forward</option>
              <option value="Midfielder">Midfielder</option>
              <option value="Defender">Defender</option>
              <option value="Goalkeeper">Goalkeeper</option>
            </select>
          </div>
        </div>

        {/* Binary Document Multi-upload Zone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Front asset container */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-neutral-700 block">National ID (Front Image)</span>
            <div className="relative border-2 border-dashed border-neutral-200 hover:border-emerald-500 bg-neutral-50/50 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group min-h-[96px]">
              <span className="text-xs text-neutral-600 font-medium group-hover:text-emerald-700 truncate max-w-full block px-1">
                {idFront ? idFront.name : "📁 Upload Front Face"}
              </span>
              <span className="text-[10px] text-neutral-400 mt-0.5 block">JPEG, PNG accepted</span>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setIdFront(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Back asset container */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-neutral-700 block">National ID (Back Image)</span>
            <div className="relative border-2 border-dashed border-neutral-200 hover:border-emerald-500 bg-neutral-50/50 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group min-h-[96px]">
              <span className="text-xs text-neutral-600 font-medium group-hover:text-emerald-700 truncate max-w-full block px-1">
                {idBack ? idBack.name : "📁 Upload Back Face"}
              </span>
              <span className="text-[10px] text-neutral-400 mt-0.5 block">JPEG, PNG accepted</span>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setIdBack(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Consent check context validation wrapper */}
        <div className="flex items-start gap-2.5 pt-3 border-t border-neutral-100">
          <input
            type="checkbox"
            id="consent"
            required
            className="mt-0.5 h-3.5 w-3.5 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
          />
          <label htmlFor="consent" className="text-[11px] leading-tight text-neutral-500 select-none">
            I certify that explicit legal consent was collected from this processing subject to store and use their identity credentials for regional database verification routines.
          </label>
        </div>

        {/* Dispatch action triggering elements */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-2 px-4 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xs"
        >
          {loading ? (
            <>
              <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
              Processing Core Uploads...
            </>
          ) : (
            "Finalize Roster Registration"
          )}
        </button>
      </form>
    </div>
  );
}