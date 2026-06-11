"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, AlertCircle } from "lucide-react";

export default function HeadRefereeFixtures() {
  const [filter, setFilter] = useState<"all" | "live" | "upcoming" | "completed">("all");
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFixtures() {
      setLoading(true);
      const [mRes, aRes] = await Promise.all([
        supabase.from("matches").select("id, status, kickoff_time, pitch, pool, round, home_team_id, away_team_id, teams!home_team_id(name), away_team:teams!away_team_id(name)").order("kickoff_time", { ascending: true }),
        supabase.from("match_assignments").select("match_id, role, referees(full_name)")
      ]);

      const allMatches = mRes.data || [];
      const assignments = aRes.data || [];

      const compiled = allMatches.map(m => {
        const matchRefs = assignments.filter(a => a.match_id === m.id);
        return {
          ...m,
          cr: matchRefs.find(r => r.role === "CR")?.referees || null,
          ar1: matchRefs.find(r => r.role === "AR1")?.referees || null,
          ar2: matchRefs.find(r => r.role === "AR2")?.referees || null,
        };
      });

      setMatches(compiled);
      setLoading(false);
    }
    loadFixtures();
  }, []);

  const filteredMatches = matches.filter(m => filter === "all" || m.status === filter);

  if (loading) return <div className="text-xs text-slate-400 text-center py-24 animate-pulse">Loading tournament fixtures...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-base font-semibold text-slate-900">Tournament Fixtures</h1>
          <p className="text-slate-500 text-xs mt-0.5">Global ledger across all locations and pools</p>
        </div>
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-md border border-slate-200/60">
          {(["all", "live", "upcoming", "completed"] as const).map((t) => (
            <button key={t} onClick={() => setFilter(t)} className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md transition-all ${filter === t ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredMatches.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-12 border border-dashed rounded-lg bg-white">No matches found matching this filter state.</p>
        ) : (
          filteredMatches.map((m) => {
            const isUnassigned = !m.cr;
            return (
              <Card key={m.id} className={`shadow-none border transition-colors ${isUnassigned ? "border-red-200 bg-red-50/10" : "border-slate-200 hover:border-slate-300"}`}>
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {new Date(m.kickoff_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900">
                        {m.teams?.name || "TBD"} <span className="text-slate-400 font-normal">vs</span> {m.away_team?.name || "TBD"}
                      </h3>
                    </div>
                    
                    <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
                      <span>Pitch: <strong className="text-slate-700">{m.pitch || "A"}</strong></span>
                      <span>Pool: <strong className="text-slate-700">{m.pool || "General"}</strong></span>
                      <span>Round: <strong className="text-slate-700">{m.round || "1"}</strong></span>
                    </div>

                    {/* Inline Officials Roster Chip Row mapping layout specs */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.cr ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          <User className="w-3 h-3" /> CR: {(m.cr as any).full_name}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 border-dashed">
                          <AlertCircle className="w-3 h-3" /> CR Missing
                        </span>
                      )}

                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${m.ar1 ? "text-slate-600 bg-slate-100 border-slate-200" : "text-slate-400 border-slate-200 border-dashed"}`}>
                        <User className="w-3 h-3" /> AR1: {m.ar1 ? (m.ar1 as any).full_name : "Open"}
                      </span>

                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${m.ar2 ? "text-slate-600 bg-slate-100 border-slate-200" : "text-slate-400 border-slate-200 border-dashed"}`}>
                        <User className="w-3 h-3" /> AR2: {m.ar2 ? (m.ar2 as any).full_name : "Open"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    {m.status === "live" && <Badge className="bg-green-50 text-green-800 border-green-200 text-[10px]">Live</Badge>}
                    {m.status === "upcoming" && <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px]">Scheduled</Badge>}
                    {m.status === "completed" && <Badge className="bg-slate-100 text-slate-600 border-transparent text-[10px]">Completed</Badge>}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}