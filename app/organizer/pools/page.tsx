"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Radio, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Layers, 
  Grid3X3, 
  Sparkles,
  RefreshCw 
} from "lucide-react";

interface Pool {
  id: string | number;
  name: string;
  tournament_id: string; // Type-aligned to standard database UUID strings
  created_at?: string;
}

export default function TournamentPoolsPage() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [activeTournamentId, setActiveTournamentId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Form parameters
  const [newPoolName, setNewPoolName] = useState<string>("");

  // Fetch contextual architecture safely
  async function fetchPoolsAndMetrics() {
    try {
      setLoading(true);

      // 1. Resolve current active context parameters (id is integer 1)
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
        setPools([]);
        return;
      }

      // 2. Validate UUID format cleanly before querying the pools table
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!isValidUUID.test(tournamentId)) {
        console.warn("Retrieved active_tournament_id is not a valid UUID format:", tournamentId);
        setPools([]);
        return;
      }

      // 3. Query pools utilizing the corrected column layout (tournament_id)
      const { data: poolsData, error: poolsError } = await supabase
        .from("pools")
        .select("*")
        .eq("tournament_id", tournamentId)
        .order("created_at", { ascending: true });

      if (poolsError) throw poolsError;
      setPools(poolsData || []);

    } catch (err: any) {
      console.error("Pool pipeline initialization failure details:", err?.message || err);
      toast.error(`Sync failure: ${err?.message || "Check network layer"}`);
    } finally {
      setLoading(false);
    }
  }

  // Provisioning new structural group nodes
  async function handleCreatePool(e: React.FormEvent) {
    e.preventDefault();
    if (!newPoolName.trim() || !activeTournamentId) {
      toast.error("Please supply a valid pool designation label.");
      return;
    }

    try {
      const { error } = await supabase
        .from("pools")
        .insert([
          {
            name: newPoolName.trim(),
            tournament_id: activeTournamentId // Map safely to foreign key
          }
        ]);

      if (error) throw error;

      toast.success(`Pool cluster "${newPoolName}" successfully provisioned.`);
      setNewPoolName("");
      fetchPoolsAndMetrics();
    } catch (err: any) {
      console.error("Error creating system pool matrix node:", err?.message || err);
      toast.error(`Provisioning failure: ${err.message}`);
    }
  }

  // Deprovisioning target pool structures cleanly
  async function handleDeletePool(id: string | number, name: string) {
    if (!confirm(`Are you completely sure you want to permanently erase pool cluster "${name}"?`)) return;

    try {
      const { error } = await supabase
        .from("pools")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success(`Erase routine completed for "${name}".`);
      fetchPoolsAndMetrics();
    } catch (err: any) {
      console.error("Error running pool deletion routing matrix:", err?.message || err);
      toast.error(`Erase structural fault: ${err.message}`);
    }
  }

  useEffect(() => {
    fetchPoolsAndMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
          <Radio className="h-3.5 w-3.5 animate-pulse text-[#534AB7]" />
          <span>Assembling data engine pipeline metrics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header Context panel layout */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">Tournament Pool Brackets</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Manage subgroup cluster matrices and allocation frameworks for the active deployment context.
          </p>
        </div>
        <Button 
          onClick={fetchPoolsAndMetrics}
          variant="outline" 
          className="h-8 text-xs gap-1.5 text-slate-600 border-slate-200"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Refresh Pipeline</span>
        </Button>
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
          
          {/* Subgroup Insertion Entry Form */}
          <Card className="bg-white border-slate-200 shadow-sm lg:col-span-1">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xs font-bold text-slate-700 tracking-wide uppercase flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5 text-[#534AB7]" />
                <span>Append Pool Cluster</span>
              </h2>
            </div>
            <CardContent className="p-4">
              <form onSubmit={handleCreatePool} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pool Designation Tag</label>
                  <Input 
                    placeholder="e.g., Pool A, Pool B, Group Alpha" 
                    value={newPoolName}
                    onChange={(e) => setNewPoolName(e.target.value)}
                    className="h-8 text-xs bg-slate-50/50 border-slate-200 focus-visible:ring-[#534AB7]/20 placeholder:text-slate-400"
                  />
                </div>

                <Button 
                  type="submit"
                  className="w-full h-8 text-xs font-bold bg-[#534AB7] hover:bg-[#3C3489] text-white shadow-sm flex items-center justify-center gap-1.5 rounded-md mt-2"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Provision Group Node</span>
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Active Flow Sequential Render Map */}
          <Card className="bg-white border-slate-200 shadow-sm lg:col-span-2">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-700 tracking-wide uppercase flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-[#534AB7]" />
                <span>Active Subgroup Cluster Matrix</span>
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                {pools.length} {pools.length === 1 ? "Group Block" : "Group Blocks"} Configured
              </span>
            </div>

            <CardContent className="p-4">
              {pools.length === 0 ? (
                <div className="p-12 text-center text-xs font-medium text-slate-400 flex flex-col items-center justify-center gap-1.5">
                  <Grid3X3 className="h-6 w-6 text-slate-300 stroke-[1.5]" />
                  <span>No clustered subgroup matrices established on this timeline context yet.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pools.map((pool) => (
                    <div 
                      key={pool.id} 
                      className="p-3 bg-slate-50/50 hover:bg-slate-50 rounded-lg border border-slate-200/60 flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-md bg-white border border-slate-200 shadow-sm flex items-center justify-center text-xs font-bold text-[#534AB7]">
                          {pool.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800 tracking-tight">{pool.name}</span>
                          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">Deployment Cluster</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleDeletePool(pool.id, pool.name)}
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
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