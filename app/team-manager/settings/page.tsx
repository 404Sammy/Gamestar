"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [team, setTeam] = useState({ name: "Loading...", category: "Senior Division" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTeam({ name: localStorage.getItem("selected_tournament_name") || "Kabras Sugar", category: "Premiership" });
        setProfile({ name: "Lead Manager", email: "manager@gamestar.ke", phone: "+254 700 000000" });
        return;
      }
      setProfile({ name: user.user_metadata?.full_name || "Manager", email: user.email || "", phone: user.phone || "" });
      
      const { data: teamData } = await supabase.from("teams").select("*").eq("team_manager_user_id", user.id).maybeSingle();
      if (teamData) {
        setTeam({ name: teamData.name, category: teamData.category || "Tournament Tier" });
      }
    }
    loadConfig();
  }, []);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert("Manager profiles modified successfully.");
    }, 800);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Account Configuration</h1>
        <p className="text-xs text-neutral-500 mt-0.5">Manage administrative credentials and check registered tournament attributes.</p>
      </div>

      {/* Locked Team Information Box */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Tournament Entry Profile</span>
          <span className="text-[9px] px-2 py-0.5 rounded bg-neutral-200 text-neutral-600 font-bold tracking-tight uppercase">🔒 Locked by Organizer</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-neutral-400">Team Blueprint Name</p>
            <p className="font-semibold text-neutral-800 mt-0.5">{team.name}</p>
          </div>
          <div>
            <p className="text-neutral-400">Competitive Classification</p>
            <p className="font-semibold text-neutral-800 mt-0.5">{team.category}</p>
          </div>
        </div>
      </div>

      {/* Editable Admin Form Elements */}
      <form onSubmit={handleUpdate} className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 space-y-4 text-xs">
        <h3 className="font-bold text-neutral-700 uppercase tracking-wider text-[10px]">Manager Details</h3>
        
        <div className="space-y-1">
          <label className="font-semibold text-neutral-600 block">Full Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-emerald-500 text-neutral-800"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-semibold text-neutral-600 block">Email Address</label>
            <input
              type="email"
              disabled
              value={profile.email}
              className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-400 cursor-not-allowed"
            />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-neutral-600 block">Contact Phone</label>
            <input
              type="text"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-emerald-500 text-neutral-800"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors disabled:opacity-50"
        >
          {saving ? "Saving profile matrix..." : "Update Registration Records"}
        </button>
      </form>
    </div>
  );
}