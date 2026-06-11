"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FileText, Save, Send, Lock } from "lucide-react";

export default function HeadRefereeReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Editor Input Elements Properties Map Tracking State Variables Configuration Context
  const [summary, setSummary] = useState("");
  const [disciplinary, setDisciplinary] = useState("");
  const [incidents, setIncidents] = useState("");
  const [recommendation, setRecommendation] = useState("");

  const loadReportsPanel = async () => {
    try {
      const { data: matches } = await supabase.from("matches").select("id, pitch, pool, round, home_team_id, away_team_id, teams!home_team_id(name), away_team:teams!away_team_id(name)").eq("status", "completed");
      const { data: storedReports } = await supabase.from("reports").select("*");
      const { data: assignments } = await supabase.from("match_assignments").select("match_id, role, referees(full_name)");

      const completedMatches = matches || [];
      const reportsList = storedReports || [];
      const assigns = assignments || [];

      // Unify sheets records alignment context settings maps securely
      const compiled = completedMatches.map(m => {
        const reportMatch = reportsList.find(r => r.match_id === m.id);
        const cr = assigns.find(a => a.match_id === m.id && a.role === "CR")?.referees || null;
        const ar1 = assigns.find(a => a.match_id === m.id && a.role === "AR1")?.referees || null;
        const ar2 = assigns.find(a => a.match_id === m.id && a.role === "AR2")?.referees || null;

        return {
          id: reportMatch?.id || `new-${m.id}`,
          match_id: m.id,
          matchDetails: m,
          cr_name: reportMatch?.cr_name || (cr as any)?.full_name || "Unassigned",
          ar1_name: reportMatch?.ar1_name || (ar1 as any)?.full_name || "Unassigned",
          ar2_name: reportMatch?.ar2_name || (ar2 as any)?.full_name || "Unassigned",
          summary: reportMatch?.summary || "",
          disciplinary: reportMatch?.disciplinary || "",
          incidents: reportMatch?.incidents || "",
          recommendation: reportMatch?.recommendation || "",
          status: reportMatch?.status || "draft"
        };
      });

      setReports(compiled);
      
      // Update selected reference safely
      if (selectedReport) {
        const refreshedSelected = compiled.find(r => r.match_id === selectedReport.match_id);
        if (refreshedSelected) handleSelectReport(refreshedSelected);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReportsPanel(); }, []);

  const handleSelectReport = (rep: any) => {
    setSelectedReport(rep);
    setSummary(rep.summary);
    setDisciplinary(rep.disciplinary);
    setIncidents(rep.incidents);
    setRecommendation(rep.recommendation);
  };

  const handlePersistenceSubmit = async (finalStatus: "draft" | "submitted") => {
    if (!selectedReport) return;
    try {
      const isNew = selectedReport.id.startsWith("new-");
      const payload = {
        match_id: selectedReport.match_id,
        cr_name: selectedReport.cr_name,
        ar1_name: selectedReport.ar1_name,
        ar2_name: selectedReport.ar2_name,
        summary,
        disciplinary,
        incidents,
        recommendation,
        status: finalStatus,
        submitted_at: finalStatus === "submitted" ? new Date().toISOString() : null
      };

      if (isNew) {
        const { error } = await supabase.from("reports").insert([payload]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("reports").update(payload).eq("id", selectedReport.id);
        if (error) throw error;
      }

      toast.success(finalStatus === "submitted" ? "Match report finalized and locked for organizer view." : "Draft data sheet updates cached successfully.");
      loadReportsPanel();
    } catch (err: any) {
      toast.error(err.message || "An exception occurred persisting information properties mapping updates.");
    }
  };

  if (loading) return <div className="text-xs text-slate-400 text-center py-24 animate-pulse">Syncing reports records ledger...</div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-base font-semibold text-slate-900">Tournament Match Reports</h1>
        <p className="text-slate-500 text-xs mt-0.5">Finalize performance logs and summary files for organizer analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
        {/* Left Side: Ledger Selection Column Index List View Component */}
        <Card className="shadow-none border-slate-200 lg:col-span-2">
          <CardHeader className="p-4 border-b border-slate-100">
            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-500" /> Completed Fixtures Logs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            {reports.length === 0 ? (
              <p className="p-4 text-xs text-slate-400 text-center">No completed matches are tracking needing report documentation files.</p>
            ) : (
              reports.map((r) => {
                const isSelected = selectedReport?.match_id === r.match_id;
                return (
                  <div key={r.match_id} onClick={() => handleSelectReport(r)} className={`p-3 cursor-pointer transition-colors ${isSelected ? 'bg-amber-50/60 border-l-2 border-amber-800' : 'hover:bg-slate-50/50'}`}>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{r.matchDetails?.teams?.name} vs {r.matchDetails?.away_team?.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Pool {r.matchDetails?.pool || "General"} · Round {r.matchDetails?.round}</p>
                      </div>
                      <Badge className={`text-[9px] font-bold uppercase ${r.status === 'submitted' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                        {r.status}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Right Side: Active Workspace Interactive Document Editor Screen Control Framework */}
        <Card className="shadow-none border-slate-200 lg:col-span-3">
          {!selectedReport ? (
            <div className="text-center py-24 text-xs text-slate-400">Select a fixture logging row item from the workspace ledger view to adjust properties.</div>
          ) : (
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">{selectedReport.matchDetails?.teams?.name} vs {selectedReport.matchDetails?.away_team?.name}</h2>
                  <p className="text-[10px] text-slate-400 mt-0.5">Crew: CR: {selectedReport.cr_name} · AR1: {selectedReport.ar1_name} · AR2: {selectedReport.ar2_name}</p>
                </div>
                {selectedReport.status === "submitted" && (
                  <Badge className="bg-red-50 text-red-700 border-red-200 font-bold gap-1 text-[10px]">
                    <Lock className="w-3 h-3" /> Locked Sheet
                  </Badge>
                )}
              </div>

              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Match Summary Analysis</label>
                  <Textarea value={summary} onChange={e => setSummary(e.target.value)} disabled={selectedReport.status === 'submitted'} placeholder="Log overall workflow sequence details, play progression characteristics..." className="text-xs min-h-[70px] border-slate-200" />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Disciplinary Action Log</label>
                  <Textarea value={disciplinary} onChange={e => setDisciplinary(e.target.value)} disabled={selectedReport.status === 'submitted'} placeholder="List formal warnings, player context records details..." className="text-xs min-h-[50px] border-slate-200" />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Incidents & Boundary Observations</label>
                  <Textarea value={incidents} onChange={e => setIncidents(e.target.value)} disabled={selectedReport.status === 'submitted'} placeholder="Detail security metrics flags, structure failures parameters, crowd metrics mapping details..." className="text-xs min-h-[50px] border-slate-200" />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Head Referee Final Recommendation</label>
                  <Textarea value={recommendation} onChange={e => setRecommendation(e.target.value)} disabled={selectedReport.status === 'submitted'} placeholder="Enter structural directions, tournament adjustments suggestions data..." className="text-xs min-h-[50px] border-slate-200" />
                </div>
              </div>

              {selectedReport.status === "draft" && (
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button size="sm" variant="outline" onClick={() => handlePersistenceSubmit("draft")} className="h-8 text-xs gap-1 border-slate-200 text-slate-700">
                    <Save className="w-3.5 h-3.5" /> Save Draft
                  </Button>
                  <Button size="sm" onClick={() => handlePersistenceSubmit("submitted")} className="bg-amber-800 hover:bg-amber-900 text-amber-50 h-8 text-xs gap-1">
                    <Send className="w-3.5 h-3.5" /> Submit to Organizer
                  </Button>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}