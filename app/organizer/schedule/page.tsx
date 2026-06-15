"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Radio, 
  Clock, 
  MapPin, 
  Layers, 
  Users,
  HelpCircle,
  CalendarPlus
} from "lucide-react";

interface Match {
  id: number;
  home_team: string;
  away_team: string;
  pitch_name: string | null;
  round_name: string | null;
  scheduled_time: string | null;
  status: "Scheduled" | "Live" | "Completed";
}

interface Team {
  id: number;
  name: string;
}

interface Pitch {
  id: number;
  name: string;
}

interface Stage {
  id: number;
  round_name: string;
}

export default function SchedulingMatrixPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [activeTournamentId, setActiveTournamentId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Form Creation States
  const [homeTeam, setHomeTeam] = useState<string>("");
  const [awayTeam, setAwayTeam] = useState<string>("");
  const [selectedPitch, setSelectedPitch] = useState<string>("");
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [scheduledTime, setScheduledTime] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Sync relational scheduling matrices
  async function fetchSchedulingPipeline() {
    try {
      setLoading(true);

      // 1. Resolve current active workspace tournament parameter
      const { data: contextData, error: contextError } = await supabase
        .from("admin_context")
        .select("active_tournament_id")
        .eq("id", 1)
        .single();

      if (contextError) throw contextError;
      const tournamentId = contextData?.active_tournament_id || null;
      setActiveTournamentId(tournamentId);

      // 2. Query matches already mapped to this tournament layout
      let matchesQuery = supabase.from("matches").select("*");
      if (tournamentId) {
        matchesQuery = matchesQuery.eq("tournament_id", tournamentId);
      }
      const { data: matchData, error: matchError } = await matchesQuery.order("id", { ascending: false });
      if (matchError) throw matchError;
      setMatches(matchData || []);

      // 3. Fetch pitches bound to active context
      let pitchesQuery = supabase.from("pitches").select("id, name");
      if (tournamentId) pitchesQuery = pitchesQuery.eq("tournament_id", tournamentId);
      const { data: pitchData, error: pitchError } = await pitchesQuery.order("name", { ascending: true });
      if (pitchError) throw pitchError;
      setPitches(pitchData || []);

      // 4. Fetch timeline stages bound to active context
      let stagesQuery = supabase.from("stages").select("id, round_name");
      if (tournamentId) stagesQuery = stagesQuery.eq("tournament_id", tournamentId);
      const { data: stageData, error: stageError } = await stagesQuery.order("id", { ascending: true });
      if (stageError) throw stageError;
      setStages(stageData || []);

      // 5. Fetch teams list available for pairing matchups
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .select("id, name")
        .order("name", { ascending: true });
      if (teamError) throw teamError;
      setTeams(teamData || []);

    } catch (err: any) {
      console.error("Relational scheduling matrix failed initialization:", err);
      toast.error("Failed to build workspace scheduling variables.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSchedulingPipeline();
  }, []);

  // Handle building match fixture inserts
  async function handleCreateFixture(e: React.FormEvent) {
    e.preventDefault();

    if (!homeTeam || !awayTeam) {
      toast.error("Fixture pairs require both a Home and Away competitor target.");
      return;
    }

    if (homeTeam === awayTeam) {
      toast.error("An entry identity cannot compete against itself in a single fixture node.");
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from("matches")
        .insert([{
          tournament_id: activeTournamentId,
          home_team: homeTeam,
          away_team: awayTeam,
          pitch_name: selectedPitch || null,
          round_name: selectedStage || null,
          scheduled_time: scheduledTime || null,
          status: "Scheduled",
          home_score: null,
          away_score: null
        }]);

      if (error) throw error;

      toast.success("New match fixture cleanly appended to schedule layout.");
      
      // Reset entry criteria controls
      setHomeTeam("");
      setAwayTeam("");
      setSelectedPitch("");
      setSelectedStage("");
      setScheduledTime("");

      await fetchSchedulingPipeline();
    } catch (err: any) {
      console.error("Match record generation query failure:", err);
      toast.error("Could not write fixture node layout mapping.");
    } finally {
      setSubmitting(false);
    }
  }

  // Handle dropping a fixture row
  async function handleDeleteFixture(id: number) {
    const match = matches.find(m => m.id === id);
    if (!match) return;

    if (match.status !== "Scheduled") {
      toast.error("Cannot drop an active or completed fixture line from active history records.");
      return;
    }

    if (!confirm(`Are you certain you want to strike this fixture off the schedule matrix?`)) return;

    try {
      const { error } = await supabase
        .from("matches")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Fixture successfully purged from timeline.");
      await fetchSchedulingPipeline();
    } catch (err: any) {
      console.error("Fixture removal deletion query rejection:", err);
      toast.error("Failed to eliminate selected timeline node row.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
          <Radio className="h-3.5 w-3.5 animate-pulse text-[#534AB7]" />
          <span>Synchronizing absolute scheduling framework contexts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Module Title Section */}
      <div>
        <h1 className="text-lg font-bold tracking-tight text-slate-900">Match scheduler</h1>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          Pair up registered competitors, map them onto venue locations, and allocate schedule time slots.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Left Column Scheduling Input Form Panel */}
        <Card className="bg-white border border-slate-200 shadow-sm lg:col-span-1">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <CalendarPlus className="h-4 w-4 text-[#534AB7]" />
            <h2 className="text-xs font-bold text-slate-700 tracking-wide uppercase">Draft Match Fixture</h2>
          </div>
          <CardContent className="p-4">
            <form onSubmit={handleCreateFixture} className="space-y-4">
              
              {/* Home Team Choice Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Home Designation</label>
                <select
                  value={homeTeam}
                  onChange={(e) => setHomeTeam(e.target.value)}
                  className="w-full text-xs h-8 px-2 bg-white border border-slate-200 rounded-md text-slate-700 font-medium focus:border-[#534AB7] outline-none"
                >
                  <option value="">-- Select Home Competitor --</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Away Team Choice Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Away Designation</label>
                <select
                  value={awayTeam}
                  onChange={(e) => setAwayTeam(e.target.value)}
                  className="w-full text-xs h-8 px-2 bg-white border border-slate-200 rounded-md text-slate-700 font-medium focus:border-[#534AB7] outline-none"
                >
                  <option value="">-- Select Away Competitor --</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Pitch Context Selector Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Venue / Pitch Asset</label>
                <select
                  value={selectedPitch}
                  onChange={(e) => setSelectedPitch(e.target.value)}
                  className="w-full text-xs h-8 px-2 bg-white border border-slate-200 rounded-md text-slate-700 font-medium focus:border-[#534AB7] outline-none"
                >
                  <option value="">-- Unassigned (TBD Field) --</option>
                  {pitches.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Stage / Round Timeline Anchor drop down */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Timeline Phase Layer</label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="w-full text-xs h-8 px-2 bg-white border border-slate-200 rounded-md text-slate-700 font-medium focus:border-[#534AB7] outline-none"
                >
                  <option value="">-- General / Pool Match --</option>
                  {stages.map((s) => (
                    <option key={s.id} value={s.round_name}>{s.round_name}</option>
                  ))}
                </select>
              </div>

              {/* Structured Date Time selector field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Scheduled Time slot</label>
                <Input 
                  placeholder="e.g., Sat 10:00 AM, 14:30" 
                  value={scheduledTime} 
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="h-8 text-xs border-slate-200 focus:border-[#534AB7] focus:ring-[#534AB7]"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting || !homeTeam || !awayTeam}
                className="w-full bg-[#534AB7] hover:bg-[#433a96] text-[#EEEDFE] text-xs font-semibold h-8 rounded gap-1.5 shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{submitting ? "Writing fixture row..." : "Commit Fixture Link"}</span>
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Column Layout Registry List Block Display */}
        <div className="lg:col-span-2">
          <Card className="bg-white border border-slate-200 shadow-sm">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#534AB7]" />
              <h2 className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                Constructed Workspace Fixtures Matrix ({matches.length})
              </h2>
            </div>
            
            <CardContent className="p-0 divide-y divide-slate-100">
              {matches.length === 0 ? (
                <div className="p-8 text-center text-xs font-medium text-slate-400 flex flex-col items-center justify-center gap-2">
                  <HelpCircle className="h-6 w-6 text-slate-300" />
                  <span>No scheduled fixtures mapped down to this tournament grid workspace yet.</span>
                </div>
              ) : (
                matches.map((match) => (
                  <div key={match.id} className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/40 transition-colors">
                    
                    {/* Fixture Team identities flex stack */}
                    <div className="flex items-center gap-2 max-w-sm flex-1">
                      <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <div className="text-xs font-bold text-slate-800 line-clamp-1">
                        <span>{match.home_team}</span>
                        <span className="text-slate-400 font-medium px-1.5">vs</span>
                        <span>{match.away_team}</span>
                      </div>
                    </div>

                    {/* Meta parameter context indicator badges */}
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-medium">
                      <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
                        <Layers className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>{match.round_name || "Pool Match"}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>{match.pitch_name || "TBD Field"}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
                        <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>{match.scheduled_time || "TBD Time"}</span>
                      </div>
                    </div>

                    {/* Elimination cross drop action row trigger buttons */}
                    <div className="flex items-center justify-end">
                      {match.status === "Scheduled" ? (
                        <Button
                          onClick={() => handleDeleteFixture(match.id)}
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Purge scheduled match fixture"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded select-none cursor-not-allowed uppercase">
                          {match.status} Locked
                        </span>
                      )}
                    </div>

                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}