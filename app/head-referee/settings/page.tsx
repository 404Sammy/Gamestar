"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, User, Bell, Lock } from "lucide-react";

export default function HeadRefereeSettings() {
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);

  // Profile Entry Fields Properties Trackers
  const [fullName, setFullName] = useState("David Kimani");
  const [email, setEmail] = useState("david@kru.co.ke");
  const [phone, setPhone] = useState("+254 733 456 789");
  const [certLevel, setCertLevel] = useState("Level 3 · KRU Certified");
  const [licensedSince, setLicensedSince] = useState("2018");

  useEffect(() => {
    async function loadProfileSettingsSheet() {
      setLoading(true);
      // Fetch default active context sheet configuration mapping entries
      const { data } = await supabase.from("profiles").select("*").limit(1).single();
      if (data) {
        setProfileId(data.id);
        setFullName(data.full_name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        if (data.certification_level) setCertLevel(data.certification_level);
        if (data.licensed_since) setLicensedSince(data.licensed_since);
      }
      setLoading(false);
    }
    loadProfileSettingsSheet();
  }, []);

  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!profileId) {
        toast.error("No active operational profile record loaded inside scope context markers.");
        return;
      }

      const { error } = await supabase.from("profiles").update({
        full_name: fullName,
        phone: phone,
        email: email
      }).eq("id", profileId);

      if (error) throw error;
      toast.success("Account preferences profiles data sheet metrics updated safely.");
    } catch (err: any) {
      toast.error(err.message || "An error occurred executing database updates mapping configurations.");
    }
  };

  if (loading) return <div className="text-xs text-slate-400 text-center py-24 animate-pulse">Syncing user account preferences controls...</div>;

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div>
        <h1 className="text-base font-semibold text-slate-900">Account Settings</h1>
        <p className="text-slate-500 text-xs mt-0.5">Adjust operational data specifications and notification tracking parameters</p>
      </div>

      <form onSubmit={handleUpdatePreferences} className="space-y-4">
        <Card className="shadow-none border-slate-200">
          <CardHeader className="p-4 border-b border-slate-100">
            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-500" /> Identity Credentials Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-slate-500">Full Name</Label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} required className="h-8 text-xs border-slate-200" />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-slate-500">Email Reference</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="h-8 text-xs border-slate-200" />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-slate-500">Phone Contact</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} className="h-8 text-xs border-slate-200" />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-slate-500 flex items-center gap-1">Role Designation <Lock className="w-2.5 h-2.5 text-slate-400" /></Label>
              <Input value="Head Referee" disabled className="h-8 text-xs bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed" />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-slate-500 flex items-center gap-1">Certification Rank <Lock className="w-2.5 h-2.5 text-slate-400" /></Label>
              <Input value={certLevel} disabled className="h-8 text-xs bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed" />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-slate-500 flex items-center gap-1">Licensed Event Year <Lock className="w-2.5 h-2.5 text-slate-400" /></Label>
              <Input value={licensedSince} disabled className="h-8 text-xs bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed" />
            </div>
          </CardContent>
        </Card>

        {/* Static Alert Preference Panel Layer Layout Configuration mappings */}
        <Card className="shadow-none border-slate-200">
          <CardHeader className="p-4 border-b border-slate-100">
            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-slate-500" /> Notification Controls System Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5 divide-y divide-slate-100 pt-1">
            <div className="flex justify-between items-center text-xs text-slate-700 py-2">
              <span>Match assignment alert dispatches</span>
              <Badge className="bg-green-50 text-green-800 border-green-200 text-[10px] px-2 rounded-sm">Active</Badge>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-700 py-2">
              <span>Performance submission reminders alerts</span>
              <Badge className="bg-green-50 text-green-800 border-green-200 text-[10px] px-2 rounded-sm">Active</Badge>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-700 py-2">
              <span>High priority incident escalation signals tracking</span>
              <Badge className="bg-green-50 text-green-800 border-green-200 text-[10px] px-2 rounded-sm">Active</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="sm" className="bg-amber-800 hover:bg-amber-900 text-amber-50 text-xs h-8 gap-1 px-4">
            <Save className="w-3.5 h-3.5" /> Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}