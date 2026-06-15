"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Radio, 
  Navigation, 
  Activity,
  HelpCircle,
  PlusCircle
} from "lucide-react";

interface Pitch {
  id: number;
  name: string;
  location_notes: string | null;
  tournament_id: number | null;
}

interface MatchAggregate {
  pitch_name: string | null;
}

export default function PitchesManagementPage() {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [matchCounts, setMatchCounts] = useState<Record<string, number>>({});
  const [activeTournamentId, setActiveTournamentId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Creation Form States
  const [newPitchName, setNewPitchName] = useState<string>( "");
  const [locationNotes, setLocationNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Core venue pipeline sync
  async function fetchPitchesAndMetrics() {
    try {
      setLoading(true);

      // 1. Resolve current runtime active tournament focus target
      const { data: contextData, error: contextError } = await supabase
        .from("admin_context")
        .select("active_tournament_id")
        .eq("id", 1)
        .single();

      if (contextError) throw contextError;
      const tournamentId = contextData?.active_tournament_id || null;
      setActiveTournamentId(tournamentId);

      // 2. Query pitches bound to this active workspace focus
      let pitchQuery = supabase.from("pitches").select("id, name, location_notes, tournament_id");
      if (tournamentId) {
        pitchQuery = pitchQuery.eq("tournament_id", tournamentId);
      }
      const { data: pitchData, error: pitchError } = await pitchQuery.order("name", { ascending: true });

      if (pitchError) throw pitchError;
      const currentPitches = pitchData || [];
      setPitches(currentPitches);

      // 3. Aggregate load indicators from matches table records
      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select("pitch_name");

      if (matchError) throw matchError;

      const counts: Record<string, number> = {};
      (matchData as MatchAggregate[] | null)?.forEach((m) => {
        if (m.pitch_name) {
          counts[m.pitch_name] = (counts[m.pitch_name] || 0) + 1;
        }
      });
      setMatchCounts(counts);

    } catch (err: any) {
      console.error("Venue infrastructure pipeline error:", err);
      toast.error("Failed to synchronize tournament pitch arrays.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPitchesAndMetrics();
  }, []);

  // Handle building new venue locations
  async function handleCreatePitch(e: React.FormEvent) {
    e.preventDefault();
    const cleanName = newPitchName.trim();

    if (!cleanName) {
      toast.error("Pitch identifier label cannot be blank.");
      return;
    }

    // Assert duplicate configurations do not exist
    const exists = pitches.some(p => p.name.toLowerCase() === cleanName.toLowerCase());
    if (exists) {
      toast.error(`A pitch named "${cleanName}" is already mapped in this tournament context.`);
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from("pitches")
        .insert([{
          name: cleanName,
          location_notes: locationNotes.trim() || null,
          tournament_id: activeTournamentId
        }]);

      if (error) throw error;

      toast.success(`Pitch "${cleanName}" allocated to tournament field layout.`);
      setNewPitchName("");
      setLocationNotes("");
      await fetchPitchesAndMetrics();
    } catch (err: any) {
      console.error("Pitch configuration insert crash:", err);
      toast.error("Could not append field infrastructure layout row.");
    } finally {
      setSubmitting(false);
    }
  }

  // Handle tearing down pitch locations safely
  async function handleDeletePitch(pitchId: number, pitchName: string) {
    // Assert if matches are locked down on this field asset
    if ((matchCounts[pitchName] || 0) > 0) {
      toast.error(`Cannot remove "${pitchName}". Reassign its ${matchCounts[pitchName]} scheduled fixtures first.`);
      return;
    }

    if (!confirm(`Are you certain you want to destroy venue target "${pitchName}"?`)) return;

    try {
      const { error } = await supabase
        .from("pitches")
        .delete()
        .eq("id", pitchId);

      if (error) throw error;

      toast.success(`"${pitchName}" successfully dropped from systems.`);
      await fetchPitchesAndMetrics();
    } catch (err: any) {
      console.error("Pitch erasure query database rejection:", err);
      toast.error("Failed to destroy the selected field vector.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
          <Radio className="h-3.5 w-3.5 animate-pulse text-[#534AB7]" />
          <span>Synchronizing spatial tournament court parameters...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Module Title Section */}
      <div>
        <h1 className="text-lg font-bold tracking-tight text-slate-900">Pitches & fields</h1>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          Manage operational venues, name distinct play areas, and track schedule constraints.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Left Column Entry Form Block */}
        <Card className="bg-white border border-slate-200 shadow-sm lg:col-span-1">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <PlusCircle className="h-4 w-4 text-[#534AB7]" />
            <h2 className="text-xs font-bold text-slate-700 tracking-wide uppercase">Add new venue location</h2>
          </div>
          <CardContent className="p-4">
            <form onSubmit={handleCreatePitch} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Field / Pitch Name
                </label>
                <Input 
                  placeholder="e.g., Pitch 1, Main Stadium Court" 
                  value={newPitchName} 
                  onChange={(e) => setNewPitchName(e.target.value)}
                  disabled={submitting}
                  className="h-8 text-xs border-slate-200 focus:border-[#534AB7] focus:ring-[#534AB7]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Spatial Context / Notes (Optional)
                </label>
                <Input 
                  placeholder="e.g., North Sector, Near Gate B" 
                  value={locationNotes} 
                  onChange={(e) => setLocationNotes(e.target.value)}
                  disabled={submitting}
                  className="h-8 text-xs border-slate-200 focus:border-[#534AB7] focus:ring-[#534AB7]"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting || !newPitchName.trim()}
                className="w-full bg-[#534AB7] hover:bg-[#433a96] text-[#EEEDFE] text-xs font-semibold h-8 rounded gap-1.5 shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{submitting ? "Provisioning..." : "Deploy Pitch Asset"}</span>
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Column Grid Stack Metrics Framework */}
        <div className="lg:col-span-2">
          <Card className="bg-white border border-slate-200 shadow-sm">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#534AB7]" />
              <h2 className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                Active Ground Infrastructure Matrix ({pitches.length})
              </h2>
            </div>
            
            <CardContent className="p-0 divide-y divide-slate-100">
              {pitches.length === 0 ? (
                <div className="p-8 text-center text-xs font-medium text-slate-400 flex flex-col items-center justify-center gap-2">
                  <HelpCircle className="h-6 w-6 text-slate-300" />
                  <span>No field parameters drafted for this workspace deployment structure.</span>
                </div>
              ) : (
                pitches.map((pitch) => {
                  const assignedGames = matchCounts[pitch.name] || 0;
                  return (
                    <div key={pitch.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 bg-[#EEEDFE] border border-[#534AB7]/10 rounded flex items-center justify-center">
                          <Navigation className="h-3.5 w-3.5 text-[#3C3489]" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800">{pitch.name}</div>
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium mt-0.5">
                            {pitch.location_notes && (
                              <span className="truncate max-w-[180px] block">
                                Context: {pitch.location_notes}
                              </span>
                            )}
                            <div className="flex items-center gap-1">
                              <Activity className="h-2.5 w-2.5 text-slate-400" />
                              <span>{assignedGames} {assignedGames === 1 ? "match hosted" : "matches hosted"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleDeletePitch(pitch.id, pitch.name)}
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Eradicate field node structure"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}