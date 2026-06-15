"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Layers, 
  Plus, 
  Trash2, 
  Radio, 
  Users, 
  FolderPlus,
  HelpCircle,
  RefreshCw
} from "lucide-react";

interface Pool {
  id: number;
  name: string;
  tournament_id: number | null;
}

interface TeamAggregate {
  pool_name: string | null;
}

export default function PoolSetupPage() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [teamCounts, setTeamCounts] = useState<Record<string, number>>({});
  const [activeTournamentId, setActiveTournamentId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Creation States
  const [newPoolName, setNewPoolName] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Sync context and data architectures
  async function fetchPoolsAndMetrics() {
    try {
      setLoading(true);

      // 1. Resolve runtime tournament focus using defensive parsing
      const { data: contextData, error: contextError } = await supabase
        .from("admin_context")
        .select("active_tournament_id")
        .eq("id", 1)
        .maybeSingle();

      if (contextError) throw contextError;
      
      const tournamentId = contextData?.active_tournament_id || null;
      setActiveTournamentId(tournamentId);

      if (!tournamentId) {
        setPools([]);
        setTeamCounts({});
        return;
      }

      // 2. Query pools assigned to this active tournament target
      const { data: poolData, error: poolError } = await supabase
        .from("pools")
        .select("id, name, tournament_id")
        .eq("tournament_id", tournamentId)
        .order("name", { ascending: true });

      if (poolError) throw poolError;
      const currentPools = poolData || [];
      setPools(currentPools);

      // 3. Fetch team distribution metrics explicitly scoped to this tournament
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .select("pool_name")
        .eq("tournament_id", tournamentId);

      if (teamError) throw teamError;

      // Calculate aggregate distribution matrix mapping
      const counts: Record<string, number> = {};
      (teamData as TeamAggregate[] | null)?.forEach((team) => {
        if (team.pool_name) {
          counts[team.pool_name] = (counts[team.pool_name] || 0) + 1;
        }
      });
      setTeamCounts(counts);

    } catch (err: any) {
      // Bypasses native object logging bug completely
      console.error("Pool pipeline initialization failure details:", err?.message || err);
      toast.error(`Sync failure: ${err?.message || "Check network layer"}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPoolsAndMetrics();
  }, []);

  // Handle pool generation inserts
  async function handleCreatePool(e: React.FormEvent) {
    e.preventDefault();
    const cleanName = newPoolName.trim();
    
    if (!cleanName) {
      toast.error("Pool name parameter cannot be empty.");
      return;
    }

    if (!activeTournamentId) {
      toast.error("Cannot provision pool without an active tournament context loaded.");
      return;
    }

    // Duplicate assertion checking logic
    const exists = pools.some(p => p.name.toLowerCase() === cleanName.toLowerCase());
    if (exists) {
      toast.error(`A pool named "${cleanName}" already exists inside this workspace context.`);
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from("pools")
        .insert([{ 
          name: cleanName,
          tournament_id: activeTournamentId 
        }]);

      if (error) throw error;

      toast.success(`Pool "${cleanName}" successfully provisioned.`);
      setNewPoolName("");
      await fetchPoolsAndMetrics();
    } catch (err: any) {
      console.error("Pool insertion runtime failure details:", err?.message || err);
      toast.error(`Could not append pool architecture: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  // Handle deletion safely removing pools
  async function handleDeletePool(poolId: number, poolName: string) {
    // Assert if teams are locked down inside this group target
    if ((teamCounts[poolName] || 0) > 0) {
      toast.error(`Cannot drop "${poolName}". Move or unassign its ${teamCounts[poolName]} teams first.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete "${poolName}"?`)) return;

    try {
      const { error } = await supabase
        .from("pools")
        .delete()
        .eq("id", poolId);

      if (error) throw error;

      toast.success(`"${poolName}" successfully removed.`);
      await fetchPoolsAndMetrics();
    } catch (err: any) {
      console.error("Pool elimination query failure details:", err?.message || err);
      toast.error(`Failed to delete target: ${err.message}`);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
          <Radio className="h-3.5 w-3.5 animate-pulse text-[#534AB7]" />
          <span>Synchronizing dynamic tournament pools configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Module Title Header area */}
      <div>
        <h1 className="text-lg font-bold tracking-tight text-slate-900">Pools Setup</h1>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          Configure tournament groupings, structural clusters, and stage generation anchors.
        </p>
      </div>

      {!activeTournamentId ? (
        <Card className="bg-amber-50/40 border-amber-200/60 shadow-sm">
          <CardContent className="p-6 text-center text-xs font-medium text-amber-800 flex items-center justify-center gap-2">
            <HelpCircle className="h-4 w-4 text-amber-600" />
            <span>No operational context assigned. Mount a tournament via the Dashboard to begin configuring layout pools.</span>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* Left column: Pool creation insertion mechanism */}
          <Card className="bg-white border border-slate-200 shadow-sm lg:col-span-1">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <FolderPlus className="h-4 w-4 text-[#534AB7]" />
              <h2 className="text-xs font-bold text-slate-700 tracking-wide uppercase">Add New Pool</h2>
            </div>
            <CardContent className="p-4">
              <form onSubmit={handleCreatePool} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Pool Identifier Name
                  </label>
                  <Input 
                    placeholder="e.g., Pool A, Group Stage Alpha" 
                    value={newPoolName} 
                    onChange={(e) => setNewPoolName(e.target.value)}
                    disabled={submitting}
                    className="h-8 text-xs border-slate-200 focus-visible:ring-[#534AB7]/20 font-medium"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting || !newPoolName.trim()}
                  className="w-full bg-[#534AB7] hover:bg-[#433a96] text-[#EEEDFE] text-xs font-semibold h-8 rounded gap-1.5 shadow-sm"
                >
                  {submitting ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                  <span>{submitting ? "Provisioning..." : "Create Pool Block"}</span>
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Right column: Dynamic listings workspace metrics panel */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-white border border-slate-200 shadow-sm">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#534AB7]" />
                  <h2 className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                    Active Pools Framework ({pools.length})
                  </h2>
                </div>
              </div>
              
              <CardContent className="p-0 divide-y divide-slate-100">
                {pools.length === 0 ? (
                  <div className="p-8 text-center text-xs font-medium text-slate-400 flex flex-col items-center justify-center gap-2">
                    <HelpCircle className="h-6 w-6 text-slate-300" />
                    <span>No operational pool clusters defined for this workspace.</span>
                  </div>
                ) : (
                  pools.map((pool) => {
                    const currentCount = teamCounts[pool.name] || 0;
                    return (
                      <div key={pool.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-7 w-7 bg-[#EEEDFE] border border-[#534AB7]/10 rounded flex items-center justify-center">
                            <span className="text-[11px] font-bold text-[#3C3489] uppercase">
                              {pool.name.substring(0, 2)}
                            </span>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800">{pool.name}</div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium mt-0.5">
                              <Users className="h-2.5 w-2.5 text-slate-400" />
                              <span>{currentCount} {currentCount === 1 ? "team locked" : "teams locked"}</span>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleDeletePool(pool.id, pool.name)}
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Eliminate pool structure"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}