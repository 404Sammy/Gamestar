"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Users, ShieldAlert, CheckCircle } from "lucide-react";

export default function HeadRefereeAssignments() {
  const [officials, setOfficials] = useState<any[]>([]);
  const [unassignedMatches, setUnassignedMatches] = useState<any[]>([]);
  const [selections, setSelections] = useState<Record<string, { CR: string; AR1: string; AR2: string }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssignmentMatrix() {
      try {
        const [refRes, matRes, assRes] = await Promise.all([
          supabase.from("referees").select("*"),
          supabase.from("matches").select("id, kickoff_time, pitch, round, home_team_id, away_team_id, teams!home_team_id(name), away_team:teams!away_team_id(name)").neq("status", "completed"),
          supabase.from("match_assignments").select("*")
        ]);

        const refs = refRes.data || [];
        const matches = matRes.data || [];
        const currentAss = assRes.data || [];

        // Dynamic structural mapping load configuration settings indicators calculation setup
        const refLoads = refs.map(r => {
          const matchCount = currentAss.filter(a => a.referee_id === r.id).length;
          return {
            ...r,
            matchCount,
            status: matchCount > 1 ? "Busy" : "Free"
          };
        });
        setOfficials(refLoads);
        setUnassignedMatches(matches);

        // Map selections structure parameters
        const initialSelections: Record<string, { CR: string; AR1: string; AR2: string }> = {};
        matches.forEach(m => {
          const matchAss = currentAss.filter(a => a.match_id === m.id);
          initialSelections[m.id] = {
            CR: matchAss.find(a => a.role === "CR")?.referee_id || "none",
            AR1: matchAss.find(a => a.role === "AR1")?.referee_id || "none",
            AR2: matchAss.find(a => a.role === "AR2")?.referee_id || "none"
          };
        });
        setSelections(initialSelections);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAssignmentMatrix();
  }, []);

  const handleRoleSelect = (matchId: string, role: "CR" | "AR1" | "AR2", value: string) => {
    setSelections(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [role]: value
      }
    }));
  };

  const handleSaveAll = async () => {
    try {
      const payload: any[] = [];
      
      for (const [matchId, roles] of Object.entries(selections)) {
        // Core structural logic validation constraint gate rule enforcement checkpoint
        if (roles.CR === "none" && (roles.AR1 !== "none" || roles.AR2 !== "none")) {
          toast.error("Constraint Violation: Cannot assign Assistant Referees without a designated Centre Referee (CR).");
          return;
        }

        if (roles.CR !== "none") payload.push({ match_id: matchId, referee_id: roles.CR, role: "CR" });
        if (roles.AR1 !== "none") payload.push({ match_id: matchId, referee_id: roles.AR1, role: "AR1" });
        if (roles.AR2 !== "none") payload.push({ match_id: matchId, referee_id: roles.AR2, role: "AR2" });
      }

      // Drop current operational match maps list configuration parameters within window boundaries safely
      const matchIdsToClear = unassignedMatches.map(m => m.id);
      await supabase.from("match_assignments").delete().in("match_id", matchIdsToClear);

      if (payload.length > 0) {
        const { error } = await supabase.from("match_assignments").insert(payload);
        if (error) throw error;
      }

      toast.success("Tournament official assignment map compiled successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to finalize assignment matrix updates.");
    }
  };

  if (loading) return <div className="text-xs text-slate-400 text-center py-24 animate-pulse">Syncing assignment matrix...</div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-base font-semibold text-slate-900">Official Assignments</h1>
        <p className="text-slate-500 text-xs mt-0.5">Designate match management crews across active fixtures</p>
      </div>

      <Alert className="bg-amber-50/50 border-amber-200 text-amber-900 shadow-none rounded-md p-3">
        <ShieldAlert className="w-4 h-4 text-amber-800" />
        <AlertDescription className="text-xs ml-2">
          <strong>System Rule Enforcement:</strong> Every active match requires a designated Centre Referee (CR) before it can transition live.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
        {/* Left Side: Pool Metrics Status Board Grid Component */}
        <Card className="shadow-none border-slate-200 lg:col-span-2">
          <CardHeader className="p-4 border-b border-slate-100">
            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-500" /> Available Officials Pool
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            {officials.map((o) => (
              <div key={o.id} className="p-3 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-900">{o.full_name}</p>
                  <p className="text-[10px] text-slate-500">{o.certification_level} · Eligibility: {o.role_eligibility}</p>
                </div>
                <Badge className={`text-[9px] font-bold uppercase tracking-wide ${o.status === 'Free' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-slate-100 text-slate-600 border-transparent'}`}>
                  {o.matchCount} Match{o.matchCount !== 1 && 's'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right Side: Deployment Interface Panel Configuration Selection Lists */}
        <Card className="shadow-none border-slate-200 lg:col-span-3">
          <CardHeader className="p-4 border-b border-slate-100">
            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Match Assignment Sheets
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {unassignedMatches.map((m) => {
              const currentMatchSel = selections[m.id] || { CR: "none", AR1: "none", AR2: "none" };
              const isMissingCr = currentMatchSel.CR === "none";

              return (
                <div key={m.id} className={`p-3 border rounded-md transition-colors ${isMissingCr ? "border-red-200 bg-red-50/5" : "border-slate-200 bg-slate-50/30"}`}>
                  <h3 className="text-xs font-bold text-slate-900 mb-2">
                    {m.teams?.name || "TBD"} vs {m.away_team?.name || "TBD"}
                    <span className="text-[10px] font-normal text-slate-400 block mt-0.5">
                      Pitch {m.pitch || "A"} · Round {m.round || "1"} · Kickoff: {new Date(m.kickoff_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </h3>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-slate-500">Centre Ref (CR)</label>
                      <Select value={currentMatchSel.CR} onValueChange={(v) => handleRoleSelect(m.id, "CR", v)}>
                        <SelectTrigger className={`h-8 text-xs ${isMissingCr ? "border-red-300" : "border-slate-200"}`}>
                          <SelectValue placeholder="Select CR" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none" className="text-xs text-red-600">-- None --</SelectItem>
                          {officials.filter(o => o.role_eligibility.includes("CR")).map(o => (
                            <SelectItem key={o.id} value={o.id} className="text-xs">{o.full_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-slate-500">Assistant 1 (AR1)</label>
                      <Select value={currentMatchSel.AR1} onValueChange={(v) => handleRoleSelect(m.id, "AR1", v)}>
                        <SelectTrigger className="h-8 text-xs border-slate-200">
                          <SelectValue placeholder="Select AR1" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">-- None --</SelectItem>
                          {officials.map(o => (
                            <SelectItem key={o.id} value={o.id} className="text-xs">{o.full_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-slate-500">Assistant 2 (AR2)</label>
                      <Select value={currentMatchSel.AR2} onValueChange={(v) => handleRoleSelect(m.id, "AR2", v)}>
                        <SelectTrigger className="h-8 text-xs border-slate-200">
                          <SelectValue placeholder="Select AR2" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">-- None --</SelectItem>
                          {officials.map(o => (
                            <SelectItem key={o.id} value={o.id} className="text-xs">{o.full_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button onClick={handleSaveAll} size="sm" className="bg-amber-800 hover:bg-amber-900 text-amber-50 text-xs h-8 gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Save all assignments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}