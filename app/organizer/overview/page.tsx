"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Activity, 
  Search, 
  Filter, 
  Radio, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  Calendar,
  AlertCircle
} from "lucide-react";

interface Match {
  id: number;
  tournament_id: number;
  home_team: any; // Can be string or nested object structure
  away_team: any;
  home_score: number | null;
  away_score: number | null;
  status: "Pending" | "Active" | "Completed";
  scheduled_at: string | null;
}

export default function MatchOverviewControlPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeTournamentId, setActiveTournamentId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Filtering & Search Control States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch telemetry context and associated tournament matches
  async function fetchOverviewTelemetry() {
    try {
      setLoading(true);

      const { data: contextData, error: contextError } = await supabase
        .from("admin_context")
        .select("active_tournament_id")
        .eq("id", 1)
        .maybeSingle();

      if (contextError) throw contextError;
      
      const tournamentId = contextData?.active_tournament_id || null;
      setActiveTournamentId(tournamentId);

      if (!tournamentId) return;

      // Pull matches from database
      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select("*")
        .eq("tournament_id", tournamentId)
        .order("id", { ascending: true });

      if (matchesError) throw matchesError;
      setMatches(matchesData || []);

    } catch (err: any) {
      console.error("Match overview telemetry fetch exception:", err?.message || err);
      toast.error("Failed to sync structural match overview state engine.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOverviewTelemetry();
  }, []);

  // Safe Extraction Logic: Extracts team name whether database row is flat string or relational object
  const getTeamNameString = (teamData: any): string => {
    if (!teamData) return "";
    if (typeof teamData === "object") {
      return teamData.name || teamData.label || "";
    }
    return String(teamData);
  };

  // Upgraded Bulletproof Filtering Algorithm
  const filteredMatches = matches.filter((match) => {
    const homeTeamText = getTeamNameString(match.home_team);
    const awayTeamText = getTeamNameString(match.away_team);
    const normalizedSearch = searchQuery.toLowerCase().trim();

    // Defensive lookup protection against undefined/null strings
    const matchesSearch = 
      homeTeamText.toLowerCase().includes(normalizedSearch) || 
      awayTeamText.toLowerCase().includes(normalizedSearch);
    
    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && String(match.status).toLowerCase() === statusFilter.toLowerCase();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
          <Radio className="h-3.5 w-3.5 animate-pulse text-[#534AB7]" />
          <span>Syncing active schedule configurations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div>
        <h1 className="text-lg font-bold tracking-tight text-slate-900">Match Overview</h1>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          Monitor real-time match progression timelines, verification states, and game performance.
        </p>
      </div>

      {!activeTournamentId ? (
        <Card className="bg-amber-50/40 border-amber-200/60 shadow-sm">
          <CardContent className="p-6 text-center text-xs font-medium text-amber-800 flex items-center justify-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            <span>No operational tournament selected inside console context. Select an active deployment via the Dashboard layout link first.</span>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          
          {/* Dynamic Filter Operations Bar Component */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search competitors by identifier title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8.5 text-xs bg-slate-50/50 border-slate-200 focus-visible:ring-[#534AB7]/20 placeholder:text-slate-400"
              />
            </div>
            
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0 hidden sm:block" />
              <div className="flex gap-1 bg-slate-100 p-1 rounded-md">
                {["all", "pending", "active", "completed"].map((statusOption) => (
                  <button
                    key={statusOption}
                    onClick={() => setStatusFilter(statusOption)}
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                      statusFilter === statusOption
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {statusOption}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Matches Output List Layout */}
          {filteredMatches.length === 0 ? (
            <Card className="border-dashed border-slate-200 bg-white">
              <CardContent className="p-12 text-center text-xs font-medium text-slate-400 flex flex-col items-center justify-center gap-1.5">
                <AlertCircle className="h-5 w-5 text-slate-300" />
                <span>No scheduled matches found matching your active filter constraints.</span>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMatches.map((match) => {
                const homeName = getTeamNameString(match.home_team) || "Unknown Entry";
                const awayName = getTeamNameString(match.away_team) || "Unknown Entry";
                
                return (
                  <Card key={match.id} className="bg-white border-slate-200 hover:border-slate-300 transition-all shadow-sm overflow-hidden">
                    <div className="p-3.5 space-y-3">
                      
                      {/* Top Header Row Metatag block */}
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide">
                        <span className="text-slate-400">Fixture Entry #{match.id}</span>
                        <div className="flex items-center gap-1.5">
                          {match.status === "Active" && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                              Live Now
                            </span>
                          )}
                          {match.status === "Completed" && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200">
                              <CheckCircle2 className="h-3 w-3" />
                              Concluded
                            </span>
                          )}
                          {match.status === "Pending" && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                              <Clock className="h-3 w-3" />
                              Scheduled
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Scoreboard Block */}
                      <div className="grid grid-cols-7 items-center bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                        <div className="col-span-3 text-right text-xs font-bold text-slate-800 truncate px-1" title={homeName}>
                          {homeName}
                        </div>
                        
                        <div className="col-span-1 text-center font-black text-xs text-slate-900 bg-white border border-slate-200 rounded py-1 tracking-tight shadow-none flex items-center justify-center max-w-[40px] mx-auto w-full">
                          {match.home_score !== null ? match.home_score : "-"}
                        </div>
                        
                        <div className="col-span-1 text-center font-black text-xs text-slate-900 bg-white border border-slate-200 rounded py-1 tracking-tight shadow-none flex items-center justify-center max-w-[40px] mx-auto w-full">
                          {match.away_score !== null ? match.away_score : "-"}
                        </div>

                        <div className="col-span-3 text-left text-xs font-bold text-slate-800 truncate px-1" title={awayName}>
                          {awayName}
                        </div>
                      </div>

                      {/* Bottom Context Time Tracker Block */}
                      <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5 pt-0.5">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span>
                          {match.scheduled_at 
                            ? new Date(match.scheduled_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                            : "Timing Configuration Standard Pend"
                          }
                        </span>
                      </div>

                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}