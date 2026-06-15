"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Settings, 
  Save, 
  Radio, 
  ShieldAlert, 
  Sliders, 
  Database,
  RefreshCw,
  AlertTriangle
} from "lucide-react";

interface Tournament {
  id: number;
  name: string;
  status: string;
}

export default function OrganizerSettingsPage() {
  const [activeTournamentId, setActiveTournamentId] = useState<number | null>(null);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Form Field States
  const [nameInput, setNameInput] = useState<string>("");
  const [statusInput, setStatusInput] = useState<string>("Upcoming");

  // Fetch current administrative context and configuration variables
  async function fetchSettingsContext() {
    try {
      setLoading(true);

      // 1. Safely resolve active tournament reference ID using .maybeSingle()
      const { data: contextData, error: contextError } = await supabase
        .from("admin_context")
        .select("active_tournament_id")
        .eq("id", 1)
        .maybeSingle();

      if (contextError) {
        console.error("Context parsing error:", contextError.message);
        toast.error("Failed to parse runtime system context configuration.");
        return;
      }

      const tournamentId = contextData?.active_tournament_id || null;
      setActiveTournamentId(tournamentId);

      if (!tournamentId) {
        setTournament(null);
        return;
      }

      // 2. Query target tournament details to populate form matrix
      const { data: tournamentData, error: tournamentError } = await supabase
        .from("tournaments")
        .select("id, name, status")
        .eq("id", tournamentId)
        .maybeSingle();

      if (tournamentError) throw tournamentError;

      if (tournamentData) {
        setTournament(tournamentData);
        setNameInput(tournamentData.name);
        setStatusInput(tournamentData.status || "Upcoming");
      }

    } catch (err: any) {
      console.error("Settings context structural failure:", err?.message || err);
      toast.error("Failed to load global workspace settings.");
    } finally {
      setLoading(false);
    }
  }

  // Handle configuration metadata updates
  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!activeTournamentId) return;
    if (!nameInput.trim()) {
      toast.error("Tournament identity title cannot be left blank.");
      return;
    }

    try {
      setSaving(true);

      // Mutate tournament record metadata inside Supabase
      const { error } = await supabase
        .from("tournaments")
        .update({
          name: nameInput.trim(),
          status: statusInput
        })
        .eq("id", activeTournamentId);

      if (error) throw error;

      toast.success("Global tournament profile matrix saved successfully.");
      
      // Refresh the local layout context references
      fetchSettingsContext();
      
      // Force an application header refresh by simulating a slight route state push
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("visibilitychange"));
      }
    } catch (err: any) {
      console.error("Configuration submission mutation fault:", err?.message || err);
      toast.error(`Mutation failure: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  // Clear current active console context lock without deleting underlying records
  async function handleDeselectTournament() {
    if (!confirm("Are you sure you want to release the active tournament connection? This sets the workspace back to standby mode.")) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from("admin_context")
        .update({ active_tournament_id: null })
        .eq("id", 1);

      if (error) throw error;

      toast.success("Active tournament reference context unlinked.");
      fetchSettingsContext();
    } catch (err: any) {
      console.error("Context detachment processing failure:", err?.message || err);
      toast.error("Failed to unlink execution profile target context.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    fetchSettingsContext();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
          <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#534AB7]" />
          <span>Synchronizing environment profile parameters...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Structural Module Header Section */}
      <div>
        <h1 className="text-lg font-bold tracking-tight text-slate-900">Console Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          Manage system variables, database contextual maps, and deployment metadata parameters.
        </p>
      </div>

      {!activeTournamentId ? (
        <Card className="bg-amber-50/40 border-amber-200/60 shadow-sm">
          <CardContent className="p-6 text-center text-xs font-medium text-amber-800 flex items-center justify-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            <span>No operational context target assigned. Select an active project from the main Dashboard panel to configure settings.</span>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          
          {/* Form Matrix: Tournament Profile Adjustments */}
          <Card className="bg-white border-slate-200 shadow-sm lg:col-span-2">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xs font-bold text-slate-700 tracking-wide uppercase flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-[#534AB7]" />
                <span>Tournament Profile Identity</span>
              </h2>
            </div>
            
            <CardContent className="p-4">
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tournament Identifier Label</label>
                  <Input 
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g., Champions Winter League"
                    className="h-8.5 text-xs bg-slate-50/50 border-slate-200 focus-visible:ring-[#534AB7]/20 font-medium"
                    disabled={saving}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Deployment Status</label>
                  <select
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value)}
                    className="w-full h-8.5 px-2 text-xs rounded-md border border-slate-200 bg-slate-50/50 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#534AB7]/20"
                    disabled={saving}
                  >
                    <option value="Upcoming">Upcoming (Awaiting Generation / Seeding)</option>
                    <option value="Active">Active (Matches Running Live Telemetry)</option>
                    <option value="Completed">Completed (Finalized Leaderboards Archived)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="h-8 text-xs font-bold bg-[#534AB7] hover:bg-[#3C3489] text-white shadow-sm flex items-center gap-1.5 rounded-md px-4"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{saving ? "Updating Variables..." : "Save Changes"}</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Right Panel: Infrastructure Context Oversight */}
          <div className="space-y-4 lg:col-span-1">
            <Card className="bg-white border-slate-200 shadow-sm">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-xs font-bold text-slate-700 tracking-wide uppercase flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-[#534AB7]" />
                  <span>Pipeline Context Mapping</span>
                </h2>
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="text-xs space-y-1 font-medium text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active System Row ID</div>
                  <div className="font-mono text-slate-800">Context Node Index #1</div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider pt-2">Bound Relation ID</div>
                  <div className="font-mono text-[#3C3489]">SQL_REF_ID: {activeTournamentId}</div>
                </div>

                <div className="pt-1">
                  <Button
                    onClick={handleDeselectTournament}
                    disabled={saving}
                    variant="outline"
                    className="w-full h-8 text-xs font-bold text-amber-700 bg-amber-50/30 hover:bg-amber-50 border-amber-200/50 flex items-center justify-center gap-1.5 rounded-md"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Disconnect Target Context</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm p-4">
              <div className="flex items-start gap-2.5 text-xs font-medium text-slate-500">
                <Settings className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 block">Workspace Architecture Note</span>
                  Changing the deployment status updates the rendering priority for the public telemetry scoreboard layers instantly. Ensure scores are finalized before archiving.
                </div>
              </div>
            </Card>
          </div>

        </div>
      )}
    </div>
  );
}