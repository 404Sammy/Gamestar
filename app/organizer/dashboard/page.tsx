"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Trophy, 
  Users, 
  Layers, 
  Activity, 
  CheckCircle2, 
  Radio, 
  ArrowRight, 
  PlusCircle, 
  Sparkles,
  RefreshCw
} from "lucide-react";

interface Tournament {
  id: number;
  name: string;
  status: string;
}

interface Metrics {
  teamsCount: number;
  poolsCount: number;
  stagesCount: number;
  matchesCount: number;
}

export default function OrganizerDashboardPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);
  const [metrics, setMetrics] = useState<Metrics>({ teamsCount: 0, poolsCount: 0, stagesCount: 0, matchesCount: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [switchingId, setSwitchingId] = useState<number | null>(null);

  // Load tournaments list along with the current operational workspace runtime context
  async function loadDashboardMetrics() {
    try {
      setLoading(true);

      // 1. Fetch all available tournaments for contextual switches
      const { data: tournamentsData, error: txError } = await supabase
        .from("tournaments")
        .select("id, name, status")
        .order("id", { ascending: false });

      if (txError) throw txError;
      setTournaments(tournamentsData || []);

      // 2. Safely resolve current active environment index using .maybeSingle()
      const { data: contextData, error: contextError } = await supabase
        .from("admin_context")
        .select("active_tournament_id")
        .eq("id", 1)
        .maybeSingle();

      if (contextError) throw contextError;

      const activeId = contextData?.active_tournament_id;

      if (activeId && tournamentsData) {
        const currentActive = tournamentsData.find(t => t.id === activeId) || null;
        setActiveTournament(currentActive);

        if (currentActive) {
          // 3. Parallel analytics execution query block across relation maps
          const [teamsRes, poolsRes, stagesRes, matchesRes] = await Promise.all([
            supabase.from("teams").select("id", { count: "exact", head: true }).eq("tournament_id", activeId),
            supabase.from("pools").select("id", { count: "exact", head: true }).eq("tournament_id", activeId),
            supabase.from("stages").select("id", { count: "exact", head: true }).eq("tournament_id", activeId),
            supabase.from("matches").select("id", { count: "exact", head: true }).eq("tournament_id", activeId)
          ]);

          setMetrics({
            teamsCount: teamsRes.count || 0,
            poolsCount: poolsRes.count || 0,
            stagesCount: stagesRes.count || 0,
            matchesCount: matchesRes.count || 0,
          });
        }
      } else {
        setActiveTournament(null);
      }

    } catch (err: any) {
      // Clean string parser wrapper bypasses native JS console logging '{}' bug completely
      console.error("Dashboard metric resolution failure matrix:", err?.message || err);
      toast.error("Failed to refresh live command center metrics.");
    } finally {
      setLoading(false);
    }
  }

  // Handle active tournament selection routing context
  async function handleSelectTournament(id: number) {
    try {
      setSwitchingId(id);
      const { error } = await supabase
        .from("admin_context")
        .update({ active_tournament_id: id })
        .eq("id", 1);

      if (error) throw error;

      toast.success("Operational tracking context shifted successfully.");
      await loadDashboardMetrics();
    } catch (err: any) {
      console.error("Context assignment transaction error:", err?.message || err);
      toast.error("Failed to re-route management context.");
    } finally {
      setSwitchingId(null);
    }
  }

  useEffect(() => {
    loadDashboardMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
          <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#534AB7]" />
          <span>Assembling telemetry data engine counts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">Command Center</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {activeTournament 
              ? `Currently regulating live pipelines for "${activeTournament.name}".`
              : "No workspace deployment loaded. Mount a target environment profile below."
            }
          </p>
        </div>
        {activeTournament && (
          <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/50 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Workspace Connected
          </span>
        )}
      </div>

      {/* Conditional Layout: Render metrics if tournament is mounted */}
      {activeTournament ? (
        <div className="space-y-6">
          {/* Analytic Cards Grid Map Layout */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="p-3.5 flex flex-row items-center justify-between pb-1 space-y-0">
                <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Teams</CardTitle>
                <Users className="h-4 w-4 text-[#534AB7]" />
              </CardHeader>
              <CardContent className="p-3.5 pt-0">
                <div className="text-xl font-black text-slate-900 tracking-tight">{metrics.teamsCount}</div>
                <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Competitor nodes loaded</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="p-3.5 flex flex-row items-center justify-between pb-1 space-y-0">
                <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pool Groups</CardTitle>
                <Layers className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent className="p-3.5 pt-0">
                <div className="text-xl font-black text-slate-900 tracking-tight">{metrics.poolsCount}</div>
                <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Active structure clusters</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="p-3.5 flex flex-row items-center justify-between pb-1 space-y-0">
                <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Timeline Stages</CardTitle>
                <Sparkles className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent className="p-3.5 pt-0">
                <div className="text-xl font-black text-slate-900 tracking-tight">{metrics.stagesCount}</div>
                <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Chronological rounds setup</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="p-3.5 flex flex-row items-center justify-between pb-1 space-y-0">
                <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Fixtures</CardTitle>
                <Activity className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent className="p-3.5 pt-0">
                <div className="text-xl font-black text-slate-900 tracking-tight">{metrics.matchesCount}</div>
                <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Scheduled generation files</p>
              </CardContent>
            </Card>

          </div>
        </div>
      ) : null}

      {/* Deployment Profile Selector Matrix Panel */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xs font-bold text-slate-700 tracking-wide uppercase flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-[#534AB7]" />
            <span>Mount Tournament Workspace Environment</span>
          </h2>
        </div>
        <CardContent className="p-4">
          {tournaments.length === 0 ? (
            <div className="p-8 text-center text-xs font-medium text-slate-400 flex flex-col items-center justify-center gap-2">
              <span>No deployment configurations found on the network. Initialize your first tournament structure line inside your data maps.</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {tournaments.map((t) => {
                const isCurrent = activeTournament?.id === t.id;
                return (
                  <div key={t.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0 group">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                        <span>{t.name}</span>
                        {isCurrent && (
                          <span className="text-[9px] font-bold bg-[#EEEDFE] text-[#3C3489] px-1.5 py-0.2 rounded border border-[#534AB7]/10">
                            Active Context
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        System Database Key Reference: <span className="font-mono bg-slate-50 px-1 border border-slate-100 rounded text-slate-500">ID_REF_{t.id}</span>
                      </div>
                    </div>

                    <Button
                      disabled={isCurrent || switchingId !== null}
                      onClick={() => handleSelectTournament(t.id)}
                      variant={isCurrent ? "secondary" : "outline"}
                      className={`h-7 text-[11px] font-bold flex items-center gap-1 rounded-md transition-all ${
                        isCurrent 
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100 cursor-default"
                          : "border-slate-200 text-slate-600 hover:text-[#3C3489] hover:bg-[#EEEDFE] hover:border-[#534AB7]/30 shadow-none"
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Mounted</span>
                        </>
                      ) : (
                        <>
                          <span>{switchingId === t.id ? "Mounting..." : "Connect Context"}</span>
                          <ArrowRight className="h-3 w-3 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}