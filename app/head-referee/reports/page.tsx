"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, FileText, Edit3, Send, Clock, Save } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Match Reports
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Write and submit reports to the tournament organizer
          </p>
        </div>
        <Button size="sm" className="bg-amber-800 hover:bg-amber-900 text-white text-xs flex items-center gap-1.5 shadow-sm">
          New report
        </Button>
      </div>

      {/* Info Banner */}
      <Alert className="bg-sky-50/60 border-sky-200 text-sky-900 dark:bg-sky-950/20 dark:border-sky-900/50 dark:text-sky-400">
        <Info className="h-4 w-4 text-sky-600 dark:text-sky-500" />
        <AlertDescription className="text-xs leading-relaxed">
          Reports are submitted directly to the tournament organizer. Once submitted they cannot be edited. Draft reports are only visible to you.
        </AlertDescription>
      </Alert>

      {/* Two-Column Workspace Split */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        
        {/* Left Column: All Reports Selector Sidecard */}
        <Card className="lg:col-span-2">
          <CardHeader className="py-4 border-b">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <FileText className="h-4 w-4 text-amber-700" />
              All Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y">
            <div className="p-3.5 bg-amber-50/40 dark:bg-amber-950/10 border-l-2 border-amber-700 flex justify-between items-start cursor-pointer">
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-50">Murang'a vs Nakuru</div>
                <div className="text-[10px] text-muted-foreground mt-1">28 Jun · Pool MA · In progress</div>
              </div>
              <Badge variant="secondary" className="bg-amber-50 text-amber-800 border-amber-200 text-[10px]">Draft</Badge>
            </div>
            
            <div className="p-3.5 hover:bg-muted/20 transition-colors flex justify-between items-start cursor-pointer">
              <div>
                <div className="text-xs font-medium text-slate-900 dark:text-slate-50">Thika W vs Nakuru W</div>
                <div className="text-[10px] text-muted-foreground mt-1">28 Jun · Pool WA · In progress</div>
              </div>
              <Badge variant="secondary" className="bg-amber-50 text-amber-800 border-amber-200 text-[10px]">Draft</Badge>
            </div>

            <div className="p-3.5 hover:bg-muted/20 transition-colors flex justify-between items-start cursor-pointer">
              <div>
                <div className="text-xs font-medium text-slate-900 dark:text-slate-50">Kabete vs Kucune</div>
                <div className="text-[10px] text-muted-foreground mt-1">28 Jun · Pool MB · Draft</div>
              </div>
              <Badge variant="secondary" className="bg-amber-50 text-amber-800 border-amber-200 text-[10px]">Draft</Badge>
            </div>

            <div className="p-3.5 hover:bg-muted/20 transition-colors flex justify-between items-start cursor-pointer opacity-50">
              <div>
                <div className="text-xs font-medium text-slate-900 dark:text-slate-50">Murang'a vs Kabete</div>
                <div className="text-[10px] text-muted-foreground mt-1">27 Jun · Final · Submitted</div>
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Sent</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Active Auditor Form */}
        <Card className="lg:col-span-3">
          <CardHeader className="py-4 border-b flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <Edit3 className="h-4 w-4 text-amber-700" />
              Murang'a RFC vs Nakuru RFC
            </CardTitle>
            <div className="flex gap-1.5 items-center">
              <Badge variant="secondary" className="bg-amber-50 text-amber-800 border-amber-200 text-[10px]">Draft</Badge>
              <Badge variant="outline" className="text-[10px] text-muted-foreground bg-slate-50">28 Jun · Pool MA</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            
            {/* Upper Metagrid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-muted-foreground">Match result</label>
                <div className="w-full h-8 px-2.5 rounded-lg border text-xs flex items-center font-medium bg-white dark:bg-slate-950">
                  Murang'a RFC 14 – 7 Nakuru RFC
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-muted-foreground">Centre referee</label>
                <div className="w-full h-8 px-2.5 rounded-lg border text-xs flex items-center font-medium bg-white dark:bg-slate-950">
                  John Maina
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-muted-foreground">AR1</label>
                <div className="w-full h-8 px-2.5 rounded-lg border text-xs flex items-center bg-white dark:bg-slate-950">
                  Anne Otieno
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-muted-foreground">AR2</label>
                <div className="w-full h-8 px-2.5 rounded-lg border text-xs flex items-center bg-white dark:bg-slate-950">
                  Paul Kamau
                </div>
              </div>
            </div>

            {/* Custom Review Panels */}
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-muted-foreground">Match summary</label>
                <div className="p-2.5 border rounded-lg bg-slate-50/50 dark:bg-slate-900/30 text-xs text-slate-700 dark:text-slate-300 min-h-[50px] leading-relaxed">
                  Murang'a dominated the first half with two quick tries from #7 B. Mwangi. Nakuru responded in the second half but could not close the gap...
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-muted-foreground">Disciplinary actions</label>
                <div className="p-2.5 border rounded-lg bg-slate-50/50 dark:bg-slate-900/30 text-xs text-slate-700 dark:text-slate-300 min-h-[44px] leading-relaxed">
                  Yellow card: #14 J. Kariuki (Murang'a) · 23 min · Dangerous tackle. No red cards issued.
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-muted-foreground">Incidents & observations</label>
                <div className="p-2.5 border rounded-lg bg-slate-50/50 dark:bg-slate-900/30 text-xs text-slate-700 dark:text-slate-300 min-h-[44px] leading-relaxed">
                  Brief altercation between players at 38 min. Diffused quickly. No further action required. Crowd behaviour acceptable throughout.
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-muted-foreground">Head referee recommendation</label>
                <div className="p-2.5 border rounded-lg bg-slate-50/50 dark:bg-slate-900/30 text-xs text-slate-700 dark:text-slate-300 min-h-[44px] leading-relaxed">
                  Match conducted fairly. No further investigation required. Recommend reviewing Pitch A lighting for evening fixtures.
                </div>
              </div>
            </div>

            {/* Panel Save Actions */}
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> Last saved 2 min ago
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs h-8 gap-1">
                  <Save className="h-3.5 w-3.5 opacity-70" /> Save draft
                </Button>
                <Button size="sm" className="bg-amber-800 hover:bg-amber-900 text-amber-50 text-xs h-8 gap-1 shadow-sm font-medium">
                  <Send className="h-3 w-3" /> Submit to organizer
                </Button>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}