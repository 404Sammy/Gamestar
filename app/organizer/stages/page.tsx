"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Milestone, 
  Plus, 
  Trash2, 
  Radio, 
  Calendar, 
  ChevronRight, 
  ShieldAlert,
  Layers,
  Sparkles
} from "lucide-react";

interface Stage {
  id: string; // Type-aligned to standard database UUID strings
  name: string;
  tournament_id: string;
  created_at?: string;
  status: "Pending" | "Active" | "Completed";
  type: string;
}

export default function TournamentStagesPage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [activeTournamentId, setActiveTournamentId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Form State parameters
  const [newStageName, setNewStageName] = useState<string>("");
  const [newStageType, setNewStageType] = useState<string>("Round Robin");

  // Fetch the execution context and stage structures safely
  async function fetchStagesContext() {
    try {
      setLoading(true);

      // 1. Resolve current active context parameters globally (id is integer 1)
      const { data: contextData, error: contextError } = await supabase
        .from("admin_context")
        .select("active_tournament_id")
        .eq("id", 1)
        .maybeSingle();

      if (contextError) {
        console.error("Supabase matrix reading error:", contextError.message);
        toast.error("Failed to parse runtime context parameters.");
        return;
      }

      const tournamentId = contextData?.active_tournament_id || null;
      setActiveTournamentId(tournamentId);

      if (!tournamentId) {
        setStages([]);
        return;
      }

      // 2. Validate UUID format cleanly before hitting the database
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!isValidUUID.test(tournamentId)) {
        console.warn("Retrieved active_tournament_id is not a valid UUID format:", tournamentId);
        setStages([]);
        return;
      }

      // 3. Query stages ordered safely by creation timeline sequence
      const { data: stagesData, error: stagesError } = await supabase
        .from("stages")
        .select("*")
        .eq("tournament_id", tournamentId)
        .order("created_at", { ascending: true }); // Safe operational fallback sorting

      if (stagesError) throw stagesError;
      setStages(stagesData || []);

    } catch (err: any) {
      console.error("Stages data resolution engine system crash:", err?.message || err);
      toast.error("Failed to sync system schedule timeline rounds.");
    } finally {
      setLoading(false);
    }
  }

  // Handle stage generation routine
  async function handleCreateStage(e: React.FormEvent) {
    e.preventDefault();
    if (!newStageName.trim() || !activeTournamentId) {
      toast.error("Please supply a valid stage identifier label.");
      return;
    }

    try {
      const { error } = await supabase
        .from("stages")
        .insert([
          {
            name: newStageName.trim(),
            tournament_id: activeTournamentId,
            status: "Pending",
            type: newStageType
          }
        ]);

      if (error) throw error;

      toast.success(`Stage "${newStageName}" successfully provisioned.`);
      setNewStageName("");
      fetchStagesContext();
    } catch (err: any) {
      console.error("Error creating system timeline stage:", err?.message || err);
      toast.error(`Provisioning failure: ${err.message}`);
    }
  }

  // Handle structural cleanup deletion routines
  async function handleDeleteStage(id: string, name: string) {
    if (!confirm(`Are you completely sure you want to permanently erase stage "${name}"?`)) return;

    try {
      const { error } = await supabase
        .from("stages")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success(`Erase routine completed for "${name}".`);
      fetchStagesContext();
    } catch (err: any) {
      console.error("Error running stage deletion routing matrix:", err?.message || err);
      toast.error(`Erase structural fault: ${err.message}`);
    }
  }

  useEffect(() => {
    fetchStagesContext();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
          <Radio className="h-3.5 w-3.5 animate-pulse text-[#534AB7]" />
          <span>Syncing structural configuration timelines...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div>
        <h1 className="text-lg font-bold tracking-tight text-slate-900">Tournament Stages</h1>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          Define chronological phases, configuration sets, and tier milestones for the current context.
        </p>
      </div>

      {!activeTournamentId ? (
        <Card className="bg-amber-50/40 border-amber-200/60 shadow-sm">
          <CardContent className="p-6 text-center text-xs font-medium text-amber-800 flex items-center justify-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            <span>No operational tournament selected inside console context layout parameters. Select an active deployment from the Dashboard first.</span>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          
          {/* Milestone Injection Entry Module Form */}
          <Card className="bg-white border-slate-200 shadow-sm lg:col-span-1">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xs font-bold text-slate-700 tracking-wide uppercase flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5 text-[#534AB7]" />
                <span>Append Timeline Stage</span>
              </h2>
            </div>
            <CardContent className="p-4">
              <form onSubmit={handleCreateStage} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Stage Label Name</label>
                  <Input 
                    placeholder="e.g., Group Play, Semi-Finals" 
                    value={newStageName}
                    onChange={(e) => setNewStageName(e.target.value)}
                    className="h-8 text-xs bg-slate-50/50 border-slate-200 focus-visible:ring-[#534AB7]/20 placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Execution Format Logic</label>
                  <select
                    value={newStageType}
                    onChange={(e) => setNewStageType(e.target.value)}
                    className="w-full h-8 px-2 text-xs rounded-md border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#534AB7]/20"
                  >
                    <option value="Round Robin">Round Robin / Pool Cluster</option>
                    <option value="Single Elimination">Single Elimination (Knockout)</option>
                    <option value="Double Elimination">Double Elimination Bracket</option>
                  </select>
                </div>

                <Button 
                  type="submit"
                  className="w-full h-8 text-xs font-bold bg-[#534AB7] hover:bg-[#3C3489] text-white shadow-sm flex items-center justify-center gap-1.5 rounded-md mt-2"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Provision Phase Block</span>
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Active Flow Sequential Render Map */}
          <Card className="bg-white border-slate-200 shadow-sm lg:col-span-2">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-700 tracking-wide uppercase flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-[#534AB7]" />
                <span>Active Chronological Milestones Matrix</span>
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                {stages.length} {stages.length === 1 ? "Phase Node" : "Phase Nodes"} Defined
              </span>
            </div>

            <CardContent className="p-4">
              {stages.length === 0 ? (
                <div className="p-12 text-center text-xs font-medium text-slate-400 flex flex-col items-center justify-center gap-1.5">
                  <Milestone className="h-6 w-6 text-slate-300 stroke-[1.5]" />
                  <span>No progressive milestones map defined on this timeline yet.</span>
                </div>
              ) : (
                <div className="relative border-l-2 border-slate-100 ml-3.5 pl-5 space-y-4 py-1">
                  {stages.map((stage, idx) => (
                    <div key={stage.id} className="relative group">
                      <span className="absolute -left-[29px] top-0.5 h-4 w-4 rounded-full bg-white border-2 border-[#534AB7] flex items-center justify-center text-[9px] font-bold text-[#3C3489] group-hover:bg-[#EEEDFE] transition-colors z-10">
                        {idx + 1}
                      </span>

                      <div className="p-3 bg-slate-50/50 hover:bg-slate-50 rounded-lg border border-slate-200/60 flex items-center justify-between transition-all shadow-none">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 tracking-tight">{stage.name}</span>
                            <span className="text-[9px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded bg-white text-slate-500 border border-slate-200/60 shadow-none">
                              {stage.type}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
                            <Calendar className="h-3 w-3" />
                            <span>Node Established</span>
                            <ChevronRight className="h-2.5 w-2.5" />
                            <span className={stage.status === "Active" ? "text-emerald-600" : "text-slate-400"}>
                              {stage.status}
                            </span>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleDeleteStage(stage.id, stage.name)}
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}