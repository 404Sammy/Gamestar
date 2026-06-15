"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  GitMerge, 
  Radio, 
  ShieldAlert, 
  Users, 
  Layers, 
  ArrowRight, 
  CheckCircle2,
  HelpCircle
} from "lucide-react";

interface Team {
  id: number;
  name: string;
  pool_id: number | null;
}

interface Pool {
  id: number;
  name: string;
}

export default function TeamAssignmentPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [pools, setPools] = useState<Pool[]>([]);
  const [activeTournamentId, setActiveTournamentId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  // Fetch contextual reference points and pool routing structures
  async function fetchAssignmentData() {
    try {
      setLoading(true);

      // 1. Resolve current active deployment parameter safely
      const { data: contextData, error: contextError } = await supabase
        .from("admin_context")
        .select("active_tournament_id")
        .eq("id", 1)
        .maybeSingle();

      if (contextError) throw contextError;

      const tournamentId = contextData?.active_tournament_id || null;
      setActiveTournamentId(tournamentId);

      if (!tournamentId) return;

      // 2. Parallel data fetching pipeline for pools and teams
      const [poolsResponse, teamsResponse] = await Promise.all([
        supabase.from("pools").select("id, name").eq("tournament_id", tournamentId),
        supabase.from("teams").select("id, name, pool_id").eq("tournament_id", tournamentId)
      ]);

      if (poolsResponse.error) throw poolsResponse.error;
      if (teamsResponse.error) throw teamsResponse.error;

      setPools(poolsResponse.data || []);
      setTeams(teamsResponse.data || []);

    } catch (err: any) {
      // Clean string logging mapping handles the native JavaScript {} log crash error
      console.error("Team assignment pipeline data sync fault:", err?.message || err);
      toast.error("Failed to sync pools or team registry matrices.");
    } finally {
      setLoading(false);
    }
  }

  // Assign a target team to an allocation pool cluster
  async function allocateTeamToPool(teamId: number, poolId: number | null) {
    try {
      setSubmittingId(teamId);
      
      const { error } = await supabase
        .from("teams")
        .update({ pool_id: poolId })
        .eq("id", teamId);

      if (error) throw error;

      toast.success("Team distribution matrix updated.");
      
      // Update local state smoothly without a hard loading flicker
      setTeams(prev => prev.map(t => t.id === teamId ? { ...t, pool_id: poolId } : t));
    } catch (err: any) {
      console.error("Critical team re-allocation error:", err?.message || err);
      toast.error(`Allocation fault: ${err.message}`);
    } finally {
      setSubmittingId(null);
    }
  }

  useEffect(() => {
    fetchAssignmentData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
          <Radio className="h-3.5 w-3.5 animate-pulse text-[#534AB7]" />
          <span>Synchronizing team distribution registry data maps...</span>
        </div>
      </div>
    );
  }

  const unassignedTeams = teams.filter(t => t.pool_id === null);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div>
        <h1 className="text-lg font-bold tracking-tight text-slate-900">Pool Allocations</h1>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          Route your registered tournament competitors into designated structure groups.
        </p>
      </div>

      {!activeTournamentId ? (
        <Card className="bg-amber-50/40 border-amber-200/60 shadow-sm">
          <CardContent className="p-6 text-center text-xs font-medium text-amber-800 flex items-center justify-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            <span>No active tournament selected in control parameters. Select a deployment via the Dashboard layout first.</span>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          
          {/* Left Panel: Standby Unassigned Teams Waiting Pool */}
          <Card className="bg-white border-slate-200 shadow-sm lg:col-span-1">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-700 tracking-wide uppercase flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-amber-500" />
                <span>Standby Competitors</span>
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/40">
                {unassignedTeams.length} Awaiting Slots
              </span>
            </div>
            
            <CardContent className="p-3 divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {unassignedTeams.length === 0 ? (
                <div className="p-8 text-center text-xs font-medium text-slate-400 flex flex-col items-center justify-center gap-1">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span>All teams distributed!</span>
                </div>
              ) : (
                unassignedTeams.map((team) => (
                  <div key={team.id} className="py-2 flex flex-col gap-2 first:pt-1 last:pb-1">
                    <div className="text-xs font-bold text-slate-800 tracking-tight">{team.name}</div>
                    
                    <div className="flex flex-wrap gap-1">
                      {pools.length === 0 ? (
                        <span className="text-[10px] text-slate-400 font-medium italic">No pools available</span>
                      ) : (
                        pools.map((pool) => (
                          <button
                            key={pool.id}
                            disabled={submittingId !== null}
                            onClick={() => allocateTeamToPool(team.id, pool.id)}
                            className="text-[10px] font-bold px-2 py-1 rounded bg-slate-50 hover:bg-[#EEEDFE] border border-slate-200 hover:border-[#534AB7]/30 text-slate-600 hover:text-[#3C3489] transition-all flex items-center gap-1"
                          >
                            <span>Join {pool.name}</span>
                            <ArrowRight className="h-2.5 w-2.5 opacity-60" />
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Right Panel: Distributed Matrix Map Layout */}
          <Card className="bg-white border-slate-200 shadow-sm lg:col-span-2">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xs font-bold text-slate-700 tracking-wide uppercase flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-[#534AB7]" />
                <span>Distributed Group Grid Allocation</span>
              </h2>
            </div>

            <CardContent className="p-4">
              {pools.length === 0 ? (
                <div className="p-12 text-center text-xs font-medium text-slate-400 flex flex-col items-center justify-center gap-1">
                  <HelpCircle className="h-6 w-6 text-slate-300" />
                  <span>No operational pool clusters initialized. Define pools under the Workspace setup layout first.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pools.map((pool) => {
                    const assignedTeams = teams.filter(t => t.pool_id === pool.id);
                    
                    return (
                      <div key={pool.id} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/30">
                        <div className="px-3 py-2 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">{pool.name}</span>
                          <span className="text-[10px] font-semibold text-slate-400">{assignedTeams.length} Registered</span>
                        </div>
                        
                        <div className="p-2 space-y-1 min-h-[100px]">
                          {assignedTeams.length === 0 ? (
                            <div className="text-[10px] text-slate-400 italic text-center p-6">Group slot empty</div>
                          ) : (
                            assignedTeams.map((team) => (
                              <div key={team.id} className="flex items-center justify-between p-1.5 bg-white border border-slate-100 rounded text-xs font-medium text-slate-700 shadow-none">
                                <span className="truncate max-w-[140px] font-semibold">{team.name}</span>
                                <button
                                  onClick={() => allocateTeamToPool(team.id, null)}
                                  className="text-[9px] font-bold text-rose-600 hover:bg-rose-50 px-1.5 py-0.5 rounded transition-colors"
                                >
                                  Eject
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}