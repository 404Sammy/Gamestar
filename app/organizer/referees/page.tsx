"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  UserCheck, 
  Plus, 
  Trash2, 
  Radio, 
  Mail, 
  Award, 
  RefreshCw, 
  HelpCircle,
  ShieldAlert
} from "lucide-react";

interface Referee {
  id: number;
  name: string;
  email: string | null;
  level: string;
  created_at: string;
}

export default function RefereeRosterPage() {
  const [referees, setReferees] = useState<Referee[]>([]);
  const [activeTournamentId, setActiveTournamentId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form Fields State (Fixed missing closing quotes here)
  const [nameInput, setNameInput] = useState<string>("");
  const [emailInput, setEmailInput] = useState<string>("");
  const [levelInput, setLevelInput] = useState<string>("Regional");

  // Synchronize runtime context and load referee directory data safely
  async function fetchRefereesData() {
    try {
      setLoading(true);

      // 1. Check active operational workspace context
      const { data: contextData, error: contextError } = await supabase
        .from("admin_context")
        .select("active_tournament_id")
        .eq("id", 1)
        .maybeSingle();

      if (contextError) throw contextError;
      setActiveTournamentId(contextData?.active_tournament_id || null);

      // 2. Fetch all system registered officials
      const { data, error } = await supabase
        .from("referees")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setReferees(data || []);

    } catch (err: any) {
      console.error("Referee registry fetch failure details:", err?.message || err);
      toast.error(`Sync error: ${err?.message || "Verify your connection or table layout rules."}`);
    } finally {
      setLoading(false);
    }
  }

  // Handle referee generation insertions
  async function handleRegisterReferee(e: React.FormEvent) {
    e.preventDefault();
    const cleanName = nameInput.trim();
    const cleanEmail = emailInput.trim();

    if (!cleanName) {
      toast.error("Official identity name label is required.");
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from("referees")
        .insert([{
          name: cleanName,
          email: cleanEmail || null,
          level: levelInput
        }]);

      if (error) throw error;

      toast.success(`Official "${cleanName}" successfully credentialed.`);
      
      // Fixed missing closing quotes on form resets here
      setNameInput("");
      setEmailInput("");
      setLevelInput("Regional");
      await fetchRefereesData();

    } catch (err: any) {
      console.error("Referee registry creation fault context:", err?.message || err);
      toast.error(`Registration failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  // Handle personnel removal deletions safely
  async function handleDeregisterReferee(id: number, name: string) {
    if (!confirm(`Are you certain you want to revoke credentials and remove official "${name}" from system logs?`)) return;

    try {
      const { error } = await supabase
        .from("referees")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success(`Official "${name}" safely unlinked.`);
      await fetchRefereesData();
    } catch (err: any) {
      console.error("Referee elimination runtime transaction exception:", err?.message || err);
      toast.error(`Deregistration faulted: ${err.message}`);
    }
  }

  useEffect(() => {
    fetchRefereesData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
          <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#534AB7]" />
          <span>Synchronizing referee panel authentication rosters...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Structural Title Module Header */}
      <div>
        <h1 className="text-lg font-bold tracking-tight text-slate-900">Official Registries</h1>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          Manage system match officials, credential classifications, and contact channels.
        </p>
      </div>

      {!activeTournamentId ? (
        <Card className="bg-amber-50/40 border-amber-200/60 shadow-sm">
          <CardContent className="p-6 text-center text-xs font-medium text-amber-800 flex items-center justify-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            <span>No operational context target assigned. Connect to an active system node via the main Dashboard deck first.</span>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          
          {/* Left Side: Adding New Personnel Module Form */}
          <Card className="bg-white border-slate-200 shadow-sm lg:col-span-1">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xs font-bold text-slate-700 tracking-wide uppercase flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5 text-[#534AB7]" />
                <span>Credential Official</span>
              </h2>
            </div>
            <CardContent className="p-4">
              <form onSubmit={handleRegisterReferee} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                  <Input 
                    placeholder="e.g., John Doe" 
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="h-8 text-xs bg-slate-50/50 border-slate-200 focus-visible:ring-[#534AB7]/20 placeholder:text-slate-400 font-medium"
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address (Optional)</label>
                  <Input 
                    type="email"
                    placeholder="e.g., official@gamestar.com" 
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="h-8 text-xs bg-slate-50/50 border-slate-200 focus-visible:ring-[#534AB7]/20 placeholder:text-slate-400 font-medium"
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Certification Grade</label>
                  <select
                    value={levelInput}
                    onChange={(e) => setLevelInput(e.target.value)}
                    className="w-full h-8 px-2 text-xs rounded-md border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#534AB7]/20 font-medium"
                    disabled={submitting}
                  >
                    <option value="Junior">Junior Match Official</option>
                    <option value="Regional">Regional Tier Referee</option>
                    <option value="National">National Class Elite</option>
                    <option value="International">FIFA / International Grade</option>
                  </select>
                </div>

                <Button 
                  type="submit"
                  disabled={submitting || !nameInput.trim()}
                  className="w-full h-8 text-xs font-bold bg-[#534AB7] hover:bg-[#3C3489] text-white shadow-sm flex items-center justify-center gap-1.5 rounded-md mt-2"
                >
                  {submitting ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <UserCheck className="h-3.5 w-3.5" />
                  )}
                  <span>Authorize Official</span>
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Right Side: Active Personnel Grid Map View List */}
          <Card className="bg-white border-slate-200 shadow-sm lg:col-span-2">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-700 tracking-wide uppercase flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-[#534AB7]" />
                <span>Authorized System Referee Roster</span>
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                {referees.length} Certified Officials
              </span>
            </div>

            <CardContent className="p-0 divide-y divide-slate-100">
              {referees.length === 0 ? (
                <div className="p-12 text-center text-xs font-medium text-slate-400 flex flex-col items-center justify-center gap-1.5">
                  <HelpCircle className="h-6 w-6 text-slate-300" />
                  <span>No match officials found in the roster matrix.</span>
                </div>
              ) : (
                referees.map((ref) => (
                  <div key={ref.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/40 transition-colors group">
                    <div className="space-y-1 min-w-0 flex-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 truncate">{ref.name}</span>
                        <span className={`text-[9px] font-bold tracking-wide uppercase px-1.5 py-0.2 rounded border shadow-none shrink-0 ${
                          ref.level === "International" ? "bg-amber-50 text-amber-700 border-amber-200/50" :
                          ref.level === "National" ? "bg-purple-50 text-purple-700 border-purple-200/50" :
                          ref.level === "Regional" ? "bg-blue-50 text-blue-700 border-blue-200/50" :
                          "bg-slate-100 text-slate-500 border-slate-200"
                        }`}>
                          {ref.level}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-slate-400 font-semibold">
                        <div className="flex items-center gap-1 truncate max-w-[180px]">
                          <Mail className="h-3 w-3 text-slate-300 shrink-0" />
                          <span className="truncate">{ref.email || "No Email Bound"}</span>
                        </div>
                        <div className="text-slate-200 hidden sm:block">|</div>
                        <div className="font-mono text-slate-400 text-[9px]">ID_REF_00{ref.id}</div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleDeregisterReferee(ref.id, ref.name)}
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}