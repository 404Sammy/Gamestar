"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Timer, Activity, Trophy, Clock, Radio, Layers, MapPin, Megaphone, Video, ChevronLeft } from "lucide-react"

// UPDATED TYPE: Now includes media_url and media_type for the video player!
type Announcement = { id: string, type: string, title: string, content: string, media_url: string, media_type: string, created_at: string }

export default function MatchCenter() {
  // Directory States
  const [tournaments, setTournaments] = useState<any[]>([])
  const [activeTournament, setActiveTournament] = useState<any | null>(null)
  
  // Dashboard States
  const [matches, setMatches] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  
  // Timeline States
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null)
  const [eventLog, setEventLog] = useState<any[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [now, setNow] = useState(new Date().getTime())

  // 1. Initial Load: Get Tournaments List
  useEffect(() => {
    fetchTournaments()
    const clockInterval = setInterval(() => setNow(new Date().getTime()), 1000)
    return () => clearInterval(clockInterval)
  }, [])

  // 2. Tournament Selected: Start Polling Match Data
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout;
    if (activeTournament) {
      fetchTournamentData() // Fetch immediately on select
      pollingInterval = setInterval(() => fetchTournamentData(), 10000)
    }
    return () => clearInterval(pollingInterval)
  }, [activeTournament])

  const fetchTournaments = async () => {
    const { data } = await supabase.from('tournament_settings').select('*').order('id', { ascending: true })
    if (data) setTournaments(data)
  }

  const fetchTournamentData = async () => {
    setLoading(true)
    // Fetch Matches
    const { data: matchData } = await supabase.from('matches').select('id, status, home_score, away_score, period_started_at, paused_seconds, matchday, round_name, match_name, home_team:teams!home_team_id(name), away_team:teams!away_team_id(name)').order('status', { ascending: true })
    if (matchData) {
      const sortOrder = { 'live': 1, 'halftime': 2, 'scheduled': 3, 'completed': 4 }
      setMatches(matchData.sort((a, b) => sortOrder[a.status as keyof typeof sortOrder] - sortOrder[b.status as keyof typeof sortOrder]))
    }
    // Fetch Media Feed
    const { data: feedData } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
    if (feedData) setAnnouncements(feedData as any)
    
    setLoading(false)
  }

  const fetchEventLog = async (matchId: string) => {
    const { data } = await supabase.from('match_events').select('id, event_type, points, match_time, player_name, player_jersey, teams(name)').eq('match_id', matchId).order('created_at', { ascending: false })
    if (data) setEventLog(data)
    setLoadingEvents(false)
  }

  const openMatchDetails = (match: any) => {
    setSelectedMatch(match)
    setLoadingEvents(true)
    fetchEventLog(match.id)
  }

  const getMatchClock = (match: any) => {
    if (match.status === 'scheduled') return "00:00"
    if (match.status === 'completed') return "FT"
    if (match.status === 'halftime') return "HT"
    if (match.period_started_at) {
      const start = new Date(match.period_started_at).getTime()
      const diffInSeconds = Math.floor((now - start) / 1000)
      const totalSeconds = (match.paused_seconds || 0) + diffInSeconds
      return `${Math.floor(totalSeconds / 60).toString().padStart(2, '0')}:${(totalSeconds % 60).toString().padStart(2, '0')}`
    }
    return "00:00"
  }

  // ==========================================
  // VIEW 1: TOURNAMENT DIRECTORY (THE PORTAL)
  // ==========================================
  if (!activeTournament) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-blue-500/30">
        <header className="border-b border-slate-800 bg-slate-950">
          <div className="max-w-5xl px-4 py-6 mx-auto flex items-center justify-center">
            <Trophy className="w-8 h-8 text-blue-500 mr-3" />
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase">Gamestar <span className="text-slate-500">Portal</span></h1>
          </div>
        </header>

        <main className="max-w-5xl px-4 py-12 mx-auto space-y-8">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-3xl md:text-4xl font-black uppercase">Select an Event</h2>
            <p className="text-slate-400">Choose a tournament to view live scores, fixtures, and highlights.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              <Card 
                key={tournament.id} 
                onClick={() => setActiveTournament(tournament)}
                className="overflow-hidden cursor-pointer group bg-slate-900 border-slate-800 hover:border-blue-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] hover:-translate-y-1"
              >
                <div 
                  className="h-48 w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${tournament.thumbnail_url || 'https://images.unsplash.com/photo-1544298621-863a7589d819'})` }}
                />
                <CardContent className="p-6">
                  <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 mb-3 uppercase tracking-widest text-[10px]">Active</Badge>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">{tournament.title}</h3>
                  <div className="flex items-center text-slate-400 text-xs font-bold tracking-widest uppercase">
                    <MapPin className="w-3 h-3 mr-1 text-slate-500" /> {tournament.venue_name}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    )
  }

  // ==========================================
  // VIEW 2: ACTIVE TOURNAMENT DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-blue-500/30 pb-20">
      
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md shadow-2xl shadow-black/50">
        <div className="max-w-5xl px-4 py-4 mx-auto flex items-center justify-between">
          <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800 px-2" onClick={() => setActiveTournament(null)}>
            <ChevronLeft className="w-5 h-5 mr-1" /> Directory
          </Button>
          <div className="flex items-center space-x-2 text-xs font-bold tracking-widest text-slate-400 uppercase">
            <Radio className="w-4 h-4 text-green-500 animate-pulse" /> <span className="hidden sm:inline">Live Sync</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl px-4 py-6 mx-auto space-y-10">
        
        {/* Dynamic Hero Banner */}
        <section className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group">
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700" style={{ backgroundImage: `url(${activeTournament.thumbnail_url})` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
          
          <div className="absolute bottom-0 left-0 p-6 w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <Badge className="bg-yellow-500 text-black mb-3 font-black tracking-widest uppercase border-0">Official Tournament</Badge>
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white drop-shadow-md">
                {activeTournament.title}
              </h1>
              <div className="flex items-center text-slate-300 font-bold tracking-widest uppercase mt-2 text-xs md:text-sm">
                <MapPin className="w-4 h-4 mr-2 text-red-500" /> {activeTournament.venue_name}
              </div>
            </div>
          </div>
        </section>

        {/* SOCIAL MEDIA FEED (With Video Support) */}
        {announcements.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center space-x-2 text-slate-300">
              <Megaphone className="w-5 h-5 text-fuchsia-500" />
              <h2 className="text-xl font-bold uppercase tracking-wider">Tournament Feed</h2>
            </div>
            
            <div className="flex overflow-x-auto space-x-4 pb-4 snap-x snap-mandatory custom-scrollbar">
              {announcements.map(post => (
                <div key={post.id} className="snap-start flex-shrink-0 w-[300px] sm:w-[350px] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
                  
                  {/* Dynamic Media Renderer */}
                  {post.media_url ? (
                    post.media_type === 'video' ? (
                      <video 
                        src={post.media_url} 
                        autoPlay loop muted playsInline controls 
                        className="h-48 w-full object-cover border-b border-slate-800 bg-black" 
                      />
                    ) : (
                      <div className="h-48 w-full bg-cover bg-center border-b border-slate-800" style={{ backgroundImage: `url(${post.media_url})` }} />
                    )
                  ) : (
                    <div className="h-2 bg-gradient-to-r from-fuchsia-500 to-blue-500 w-full" />
                  )}

                  <div className="p-4 flex-grow flex flex-col">
                    <Badge variant="outline" className="w-fit mb-2 text-[10px] uppercase tracking-widest bg-slate-950 border-slate-800 text-slate-400">
                      {post.type === 'Highlight' ? <Video className="w-3 h-3 mr-1 text-fuchsia-400" /> : <Megaphone className="w-3 h-3 mr-1 text-blue-400" />}
                      {post.type}
                    </Badge>
                    <h3 className="font-bold text-lg leading-tight mb-2 text-white">{post.title}</h3>
                    <p className="text-sm text-slate-400 flex-grow whitespace-pre-wrap">{post.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* LIVE MATCHES */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2 text-slate-300">
            <Activity className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-bold uppercase tracking-wider">Live & Upcoming Fixtures</h2>
          </div>

          {loading ? <div className="py-12 text-center text-slate-500 animate-pulse">Loading live data...</div> : matches.length === 0 ? <div className="py-12 text-center text-slate-500">No fixtures scheduled.</div> : (
            <div className="grid gap-6 md:grid-cols-2">
              {matches.map((match) => {
                const isLive = match.status === 'live' || match.status === 'halftime'
                return (
                  <Card key={match.id} onClick={() => openMatchDetails(match)} className={`overflow-hidden cursor-pointer hover:scale-[1.01] transition-all duration-300 border-2 ${isLive ? 'bg-slate-900 border-blue-900/50 shadow-[0_0_30px_rgba(30,58,138,0.2)]' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}`}>
                    <CardContent className="p-0">
                      {(match.matchday || match.round_name || match.match_name) && (
                        <div className="px-4 py-2 border-b border-slate-800/50 bg-slate-950/80 flex justify-center items-center">
                          <Layers className="w-3 h-3 mr-2 text-indigo-500" />
                          <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">
                            {match.matchday} {match.matchday && match.round_name && <span className="text-slate-600 mx-1">•</span>} {match.round_name} {match.match_name && <span className="text-slate-600 mx-1">•</span>} {match.match_name}
                          </span>
                        </div>
                      )}
                      <div className={`px-4 py-2 flex justify-between items-center text-xs font-bold tracking-widest uppercase ${isLive ? 'bg-blue-900/30 text-blue-400' : 'bg-slate-900 text-slate-500 border-b border-slate-800'}`}>
                        <span className="flex items-center">{isLive && <span className="w-2 h-2 mr-2 bg-blue-500 rounded-full animate-pulse" />}{match.status}</span>
                        <span className="font-mono flex items-center"><Timer className="w-3 h-3 mr-1" />{getMatchClock(match)}</span>
                      </div>
                      <div className="flex items-center justify-between p-6">
                        <div className="flex flex-col items-center w-1/3 text-center"><span className="text-3xl font-black text-white">{match.home_score}</span><h3 className="mt-2 text-sm font-semibold text-slate-400">{match.home_team?.name}</h3></div>
                        <span className="text-2xl font-black text-slate-700">-</span>
                        <div className="flex flex-col items-center w-1/3 text-center"><span className="text-3xl font-black text-white">{match.away_score}</span><h3 className="mt-2 text-sm font-semibold text-slate-400">{match.away_team?.name}</h3></div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </section>
      </main>

      {/* MATCH TIMELINE MODAL */}
      <Dialog open={selectedMatch !== null} onOpenChange={(open) => !open && setSelectedMatch(null)}>
        <DialogContent className="sm:max-w-md bg-slate-900 text-white border-slate-800">
          <DialogHeader>
            <DialogTitle className="flex flex-col items-start space-y-2">
              <div className="flex w-full items-center justify-between">
                <span className="font-bold">Match Summary</span>
                {selectedMatch && (
                  <Badge variant={selectedMatch.status === 'live' ? 'destructive' : 'secondary'} className="uppercase">
                    {selectedMatch.status} • {getMatchClock(selectedMatch)}
                  </Badge>
                )}
              </div>
              {selectedMatch && (selectedMatch.matchday || selectedMatch.round_name || selectedMatch.match_name) && (
                <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase">
                  {selectedMatch.matchday} • {selectedMatch.round_name} {selectedMatch.match_name && `• ${selectedMatch.match_name}`}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedMatch && (
            <div className="py-4">
              <div className="flex items-center justify-center space-x-6 mb-6 pb-6 border-b border-slate-800">
                <div className="text-center w-1/3">
                  <span className="text-4xl font-black text-white">{selectedMatch.home_score}</span>
                  <h3 className="font-bold text-xs text-slate-400 mt-1 uppercase truncate">{selectedMatch.home_team?.name}</h3>
                </div>
                <div className="text-slate-600 font-black text-xl">-</div>
                <div className="text-center w-1/3">
                  <span className="text-4xl font-black text-white">{selectedMatch.away_score}</span>
                  <h3 className="font-bold text-xs text-slate-400 mt-1 uppercase truncate">{selectedMatch.away_team?.name}</h3>
                </div>
              </div>

              <div className="flex items-center mb-4 text-slate-400 px-1">
                <Activity className="w-4 h-4 mr-2" />
                <h4 className="text-xs font-black tracking-[0.2em] uppercase">Play-by-Play</h4>
              </div>

              {loadingEvents ? (
                <div className="text-center py-8 text-slate-500 animate-pulse">Loading timeline...</div>
              ) : eventLog.length === 0 ? (
                <div className="text-center py-8 text-slate-600 text-sm italic">Waiting for kickoff...</div>
              ) : (
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {eventLog.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg text-sm">
                      <div className="flex items-center space-x-3">
                        <div className="px-2 py-1 text-[10px] font-mono font-bold text-blue-400 bg-blue-900/30 rounded">{log.match_time || "00:00"}</div>
                        <div>
                          <p className={`font-bold text-sm flex items-center ${
                             log.event_type.includes('Card') ? 'text-red-400' :
                             log.event_type.includes('HALF') || log.event_type.includes('FULL') ? 'text-orange-400' : 'text-slate-200'
                          }`}>
                            {log.event_type}
                            {log.points > 0 && <span className="ml-2 text-[10px] font-black text-green-500">+{log.points}</span>}
                          </p>
                          {log.player_name && <p className="text-xs text-slate-400 mt-0.5">#{log.player_jersey} {log.player_name}</p>}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 hidden sm:block uppercase tracking-tighter text-right w-20 truncate">
                        {log.teams?.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}