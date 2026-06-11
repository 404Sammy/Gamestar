"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, UserCheck, FileWarning, AlertTriangle, 
  ArrowRight, Radio, Clock, CheckCircle, Plus 
} from "lucide-react";

export default function HeadRefereeDashboard() {
  const [metrics, setMetrics] = useState({ totalFixtures: 0, unassignedMatches: 0, pendingReports: 0, activeIncidents: 0 });
  const [todayMatches, setTodayMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [mRes, aRes, rRes, iRes] = await Promise.all([
          supabase.from("matches").select("id, status, kickoff_time, home_team_id, away_team_id, pitch, pool, teams!home_team_id(name), away_team:teams!away_team_id(name)"),
          supabase.from("match_assignments").select("match_id, role, referees(full_name)"),
          supabase.from("reports").select("id").eq("status", "draft"),
          supabase.from("incidents").select("id").eq("status", "open")
        ]);

        const matches = mRes.data || [];
        const assignments = aRes.data || [];

        // Build CR tracking set map
        const crAssigned = new Set(assignments.filter(a => a.role === "CR").map(a => a.match_id));
        const unassignedCount = matches.filter(m => !crAssigned.has(m.id)).length;

        setMetrics({
          totalFixtures: matches.length,
          unassignedMatches: unassignedCount,
          pendingReports: rRes.data?.length || 0,
          activeIncidents: iRes.data?.length || 0
        });

        // Formulate complete details mapping list for current day's card loop
        const compiledToday = matches.map(m => {
          const crMatch = assignments.find(a => a.match_id === m.id && a.role === "CR");
          return {
            ...m,
            crName: crMatch ? (crMatch.referees as any)?.full_name : null
          };
        });

        setTodayMatches(compiledToday);
      } catch (err) {
        console.error("Context evaluation error", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) return <div className="text-xs text-slate-400 text-center py-24 animate-pulse">Syncing dashboard parameters...</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-base font-semibold text-slate-900">Welcome, David</h1>
          <p className="text-slate-500 text-xs mt-0.5">Head referee · Tournament Overview Interface</p>
        </div>
        <Button asChild size="sm" className="bg-amber-800 hover:bg-amber-900 text-amber-50 h-8 text-xs gap-1">
          <Link href="/head-referee/reports"><Plus className="w-3.5 h-3.5" /> New report</Link>
        </Button>
      </div>

      {/* Numerical Stat Card Row Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="shadow-none border-slate-200">
          <CardContent className="p-3.5 flex flex-col justify-between h-20">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Fixtures</p>
            <div className="flex justify-between items-baseline">
              <span className="text-xl font-bold tracking-tight text-slate-800">{metrics.totalFixtures}</span>
              <span className="text-[10px] text-slate-400">across event</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-slate-200">
          <CardContent className="p-3.5 flex flex-col justify-between h-20">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unassigned Matches</p>
            <div className="flex justify-between items-baseline">
              <span className={`text-xl font-bold tracking-tight ${metrics.unassignedMatches > 0 ? "text-red-700" : "text-slate-800"}`}>{metrics.unassignedMatches}</span>
              <span className="text-[10px] text-slate-400">need officials</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-slate-200">
          <CardContent className="p-3.5 flex flex-col justify-between h-20">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reports Pending</p>
            <div className="flex justify-between items-baseline">
              <span className={`text-xl font-bold tracking-tight ${metrics.pendingReports > 0 ? "text-amber-800" : "text-slate-800"}`}>{metrics.pendingReports}</span>
              <span className="text-[10px] text-slate-400">awaiting send</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-slate-200">
          <CardContent className="p-3.5 flex flex-col justify-between h-20">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Incidents</p>
            <div className="flex justify-between items-baseline">
              <span className={`text-xl font-bold tracking-tight ${metrics.activeIncidents > 0 ? "text-red-700" : "text-slate-800"}`}>{metrics.activeIncidents}</span>
              <span className="text-[10px] text-slate-400">flagged today</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Multi split workspace panel splits layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="shadow-none border-slate-200 lg:col-span-2">
          <CardHeader className="p-4 border-b border-slate-100">
            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-amber-800" /> Live & Upcoming Today
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            {todayMatches.length === 0 ? (
              <p className="p-4 text-xs text-slate-400 text-center">No matches tracked in active database.</p>
            ) : (
              todayMatches.map((m) => (
                <div key={m.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-semibold text-slate-900">
                      {m.teams?.name || "TBD"} <span className="text-slate-400 font-normal">vs</span> {m.away_team?.name || "TBD"}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Pitch {m.pitch || "A"} · Pool {m.pool || "General"} · {m.crName ? `CR: ${m.crName}` : <span className="text-red-700 font-medium">No CR Assigned</span>}
                    </p>
                  </div>
                  <div>
                    {m.status === "live" && <Badge className="bg-green-50 text-green-800 border-green-200 font-medium text-[10px]">Live</Badge>}
                    {m.status === "upcoming" && <Badge className="bg-amber-50 text-amber-800 border-amber-200 font-medium text-[10px]">{new Date(m.kickoff_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Badge>}
                    {m.status === "completed" && <Badge className="bg-slate-100 text-slate-600 border-transparent font-medium text-[10px]">Done</Badge>}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Action routing checklist control board panel shortcut cards */}
        <div className="space-y-3">
          <Card className="shadow-none border-slate-200">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                Action Required
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-2">
              {metrics.unassignedMatches > 0 && (
                <div className="p-2.5 border border-amber-200 bg-amber-50/50 rounded-md">
                  <p className="text-xs font-semibold text-amber-900">{metrics.unassignedMatches} matches need referee assignment</p>
                  <Button asChild size="sm" variant="link" className="text-amber-900 p-0 h-auto font-bold text-[11px] mt-1.5 gap-1">
                    <Link href="/head-referee/assignments">Assign now <ArrowRight className="w-3 h-3" /></Link>
                  </Button>
                </div>
              )}
              
              {metrics.activeIncidents > 0 && (
                <div className="p-2.5 border border-red-200 bg-red-50/40 rounded-md">
                  <p className="text-xs font-semibold text-red-900">{metrics.activeIncidents} serious incidents open</p>
                  <Button asChild size="sm" variant="link" className="text-red-900 p-0 h-auto font-bold text-[11px] mt-1.5 gap-1">
                    <Link href="/head-referee/incidents">Review log <ArrowRight className="w-3 h-3" /></Link>
                  </Button>
                </div>
              )}

              {metrics.pendingReports > 0 && (
                <div className="p-2.5 border border-slate-200 bg-slate-50/50 rounded-md">
                  <p className="text-xs font-semibold text-slate-800">{metrics.pendingReports} reports pending submission</p>
                  <Button asChild size="sm" variant="link" className="text-slate-700 p-0 h-auto font-bold text-[11px] mt-1.5 gap-1">
                    <Link href="/head-referee/reports">Compile sheets <ArrowRight className="w-3 h-3" /></Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}