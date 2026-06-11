"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Lock, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Head referee account preferences
        </p>
      </div>

      <div className="grid gap-6">
        
        {/* Profile Card Section */}
        <Card>
          <CardHeader className="py-4 border-b">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <User className="h-4 w-4 text-amber-700" /> Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground">Full name</label>
                <div className="w-full h-8 px-2.5 rounded-lg border text-xs flex items-center font-medium bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                  David Kimani
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground">Email</label>
                <div className="w-full h-8 px-2.5 rounded-lg border text-xs flex items-center font-medium bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                  david@kru.co.ke
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground">Phone</label>
                <div className="w-full h-8 px-2.5 rounded-lg border text-xs flex items-center font-medium bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                  +254 733 456 789
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground">Role</label>
                <div className="w-full h-8 px-2.5 rounded-lg border text-xs flex items-center font-medium bg-slate-100 dark:bg-slate-950 text-muted-foreground justify-between">
                  <span>Head referee</span>
                  <Lock className="h-3 w-3 opacity-60" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground">Certification level</label>
                <div className="w-full h-8 px-2.5 rounded-lg border text-xs flex items-center font-medium bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                  Level 3 · KRU Certified
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground">Licensed since</label>
                <div className="w-full h-8 px-2.5 rounded-lg border text-xs flex items-center font-medium bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                  2018
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader className="py-4 border-b">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <Bell className="h-4 w-4 text-amber-700" /> Notification preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">Match assignment notifications</span>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold py-0.5 px-2">On</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">Report submission reminders</span>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold py-0.5 px-2">On</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">Incident escalation alerts</span>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold py-0.5 px-2">On</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lower Actions panel */}
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="outline" size="sm" className="text-xs h-8">
          Cancel
        </Button>
        <Button size="sm" className="bg-amber-800 hover:bg-amber-900 text-white text-xs h-8 gap-1.5 font-medium shadow-sm">
          <Save className="h-3.5 w-3.5" /> Save changes
        </Button>
      </div>
    </div>
  );
}