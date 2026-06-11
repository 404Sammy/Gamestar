"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { AlertTriangle, Link2, ShieldAlert } from "lucide-react";

export default function HeadRefereeIncidents() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadIncidentsContext = async () => {
    setLoading(true);
    const [incRes, repRes] = await Promise.all([
      supabase.from("incidents").select("*, matches(home_team_id, away_team_id, teams!home_team_id(name), away_team:teams!away_team_id(name))").order("created_at", { ascending: false }),
      supabase.from("reports").select("id, match_id, matches(home_team_id, away_team_id, teams!home_team_id(name), away_team:teams!away_team_id(name))")
    ]);

    setIncidents(incRes.data || []);
    setReports(repRes.data || []);
    setLoading(false);
  };

  useEffect(() => { loadIncidentsContext(); }, []);

  const handleEscalateIncident = async (id: string) => {
    try {
      const { error } = await supabase.from("incidents").update({ status: "escalated" }).eq("id", id);
      if (error) throw error;
      toast.success("Incident escalated directly to the organizer dashboard entry queue.");
      loadIncidentsContext();
    } catch (err: any) {
      toast.error(err.message || "An exception occurred scaling threat tracking flag settings parameters.");
    }
  };

  const handleAttachReport = async (incidentId: string, reportId: string) => {
    if (reportId === "none") return;
    try {
      const { error } = await supabase.from("incidents").update({ report_id: reportId, status: "resolved" }).eq("id", incidentId);
      if (error) throw error;
      toast.success("Incident resolved and attached to the target match report sheet.");
      loadIncidentsContext();
    } catch (err: any) {
      toast.error(err.message || "Failed to attach incident reference mapping context parameters.");
    }
  };

  if (loading) return <div className="text-xs text-slate-400 text-center py-24 animate-pulse">Syncing incident metrics framework logs...</div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-base font-semibold text-slate-900">Incident Tracking Log</h1>
        <p className="text-slate-500 text-xs mt-0.5">Review disciplinary actions and safety incidents</p>
      </div>

      <div className="space-y-3">
        {incidents.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-12 border border-dashed rounded-md bg-white">No incidents currently recorded.</p>
        ) : (
          incidents.map((inc) => {
            const isResolved = inc.status === "resolved";
            return (
              <Card key={inc.id} className={`shadow-none border transition-opacity border-slate-200 ${isResolved ? "opacity-60 bg-slate-50/50" : "bg-white"}`}>
                <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-slate-900">{inc.title}</h3>
                      <Badge className={`text-[9px] uppercase tracking-wider font-bold ${inc.status === 'escalated' ? 'bg-red-100 text-red-800' : inc.status === 'open' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                        {inc.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] font-medium text-amber-900/80">
                      Context: {inc.matches?.teams?.name || "TBD"} vs {inc.matches?.away_team?.name || "TBD"}
                    </p>
                    <p className="text-xs text-slate-500 pt-0.5">{inc.description}</p>
                  </div>

                  {!isResolved && (
                    <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 pt-2 md:pt-0 w-full md:w-auto justify-end">
                      <div className="flex items-center gap-1">
                        <Select onValueChange={(val) => handleAttachReport(inc.id, val)} defaultValue="none">
                          <SelectTrigger className="h-7 text-[11px] w-44 border-slate-200">
                            <Link2 className="w-3 h-3 text-slate-400 mr-1" />
                            <SelectValue placeholder="Attach to Report" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none" className="text-xs">-- Select Report --</SelectItem>
                            {reports.map(r => (
                              <SelectItem key={r.id} value={r.id} className="text-xs">
                                {r.matches?.teams?.name} vs {r.matches?.away_team?.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {inc.status !== "escalated" && (
                        <Button size="sm" onClick={() => handleEscalateIncident(inc.id)} className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold h-7 text-[10px] gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" /> Escalate
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}