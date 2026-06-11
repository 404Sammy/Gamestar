"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Paperclip, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function IncidentsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Incident Log
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Flag and track serious incidents for organizer review
          </p>
        </div>
        <Button size="sm" className="bg-amber-800 hover:bg-amber-900 text-white text-xs shadow-sm">
          Log incident
        </Button>
      </div>

      {/* Critical Alert banner */}
      <Alert className="bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-400">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
        <AlertDescription className="text-xs leading-relaxed font-normal">
          <strong className="font-semibold">2 active incidents</strong> have been flagged today. Review and attach to the relevant match report before submitting to the organizer.
        </AlertDescription>
      </Alert>

      {/* Active Incidents Stack Card */}
      <Card>
        <CardHeader className="py-3 border-b bg-slate-50/40 dark:bg-slate-900/20">
          <CardTitle className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            Active Incidents (2)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y">
          
          {/* Incident 1 */}
          <div className="p-4 space-y-2.5">
            <div className="flex justify-between items-start gap-2">
              <div>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-50">Player dispute — post-match</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Murang'a vs Nakuru · 28 Jun · Pitch A · 38:00</p>
              </div>
              <Badge variant="destructive" className="text-[10px] px-2 py-0 h-5">Open</Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Players from both teams involved in a brief altercation near the touchline. Diffused by match officials. No injuries reported.
            </p>
            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="outline" className="text-[10px] h-7 gap-1">
                <Paperclip className="h-3 w-3" /> Attach to report
              </Button>
              <Button size="sm" variant="destructive" className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200 text-[10px] h-7">
                Escalate
              </Button>
            </div>
          </div>

          {/* Incident 2 */}
          <div className="p-4 space-y-2.5">
            <div className="flex justify-between items-start gap-2">
              <div>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-50">Pitch condition concern</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Pitch C · 28 Jun · Pre-match inspection</p>
              </div>
              <Badge variant="destructive" className="text-[10px] px-2 py-0 h-5">Open</Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Waterlogged corner near try line. Flagged to groundskeeper. Match allowed to proceed after inspection with caution advisory issued to teams.
            </p>
            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="outline" className="text-[10px] h-7 gap-1">
                <Paperclip className="h-3 w-3" /> Attach to report
              </Button>
              <Button size="sm" variant="destructive" className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200 text-[10px] h-7">
                Escalate
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Resolved Incidents Section */}
      <Card>
        <CardHeader className="py-3 border-b flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            Resolved Incidents (1)
          </CardTitle>
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] py-0 h-5">Closed</Badge>
        </CardHeader>
        <CardContent className="p-4 opacity-60 bg-slate-50/[0.02]">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-50">Late kickoff — Pitch B</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">27 Jun · Resolved by organizer</p>
            </div>
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] flex items-center gap-0.5"><CheckCircle2 className="h-2.5 w-2.5" /> Resolved</Badge>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2">
            10-min delay due to prior match overrun. Resolved by organizer rescheduling halftime break.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}