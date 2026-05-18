"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Timer, Flag, Activity, User, AlertTriangle, RefreshCw, List, Clock, Play, Pause, Square } from "lucide-react"

type Player = { id: string, full_name: string, jersey_number: number }
type MatchEvent = { id: string, event_type: string, points: number, match_time: string, player_name: string, player_jersey: number, players: { full_name: string, jersey_number: number }, teams: { name: string } }
type MatchData = {
  id: string, status: string, home_score: number, away_score: number,
  home_team_id: string, away_team_id: string,
  home_team: { name: string }, away_team: { name: string },
  period_started_at: string | null, paused_seconds: number  // NEW: Clock sync fields
}

export default function RefereeTerminal() {
  const params = useParams()
  const matchId = params.matchId as string
  const [match, setMatch] = useState<MatchData | null>(null)
  const [loading, setLoading] = useState(true)
  
  const [homeRoster, setHomeRoster] = useState<Player[]>([])
  const [awayRoster, setAwayRoster] = useState<Player[]>([])
  const [eventLog, setEventLog] = useState<MatchEvent[]>([])
  
  const [secondsElapsed, setSecondsElapsed] = useState(0)
  const [activeEvent, setActiveEvent] = useState<{ team: 'home'|'away', points: number, type: string, matchTime: string } | null>(null)
  const [subStep, setSubStep] = useState<'off' | 'on'>('off')
  const [subPlayerOff, setSubPlayerOff] = useState<string | null>(null)

  useEffect(() => {
    if (matchId) {
      fetchMatchData()
      fetchEventLog()
    }
  }, [matchId])

  // NEW: Bulletproof Timer Logic
  // Recalculates the exact time difference every second based on the server timestamp
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (match?.status === 'live' && match.period_started_at) {
      interval = setInterval(() => {
        const startTimestamp = new Date(match.period_started_at!).getTime()
        const now = new Date().getTime()
        const diffInSeconds = Math.floor((now - startTimestamp) / 1000)
        setSecondsElapsed((match.paused_seconds || 0) + diffInSeconds)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [match?.status, match?.period_started_at, match?.paused_seconds])

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
    const s = (totalSeconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const fetchMatchData = async () => {
    const { data: matchData, error } = await supabase
      .from('matches')
      .select('id, status, home_score, away_score, home_team_id, away_team_id, period_started_at, paused_seconds, home_team:teams!home_team_id(name), away_team:teams!away_team_id(name)')
      .eq('id', matchId)
      .single()

    if (error || !matchData) {
      toast.error("Match not found")
      setLoading(false)
      return
    }
    
    // Set the initial clock state the moment data loads
    if (matchData.status === 'live' && matchData.period_started_at) {
      const start = new Date(matchData.period_started_at).getTime()
      const diff = Math.floor((new Date().getTime() - start) / 1000)
      setSecondsElapsed((matchData.paused_seconds || 0) + diff)
    } else {
      setSecondsElapsed(matchData.paused_seconds || 0)
    }

    setMatch(matchData as any)

    const { data: players } = await supabase.from('players').select('id, full_name, jersey_number, team_id')
    if (players) {
      setHomeRoster(players.filter(p => p.team_id === matchData.home_team_id).sort((a,b) => a.jersey_number - b.jersey_number))
      setAwayRoster(players.filter(p => p.team_id === matchData.away_team_id).sort((a,b) => a.jersey_number - b.jersey_number))
    }
    setLoading(false)
  }

  const fetchEventLog = async () => {
    const { data } = await supabase
      .from('match_events')
      .select('id, event_type, points, match_time, player_name, player_jersey, players(full_name, jersey_number), teams(name)')
      .eq('match_id', matchId)
      .order('created_at', { ascending: false })
      .limit(15)
    if (data) setEventLog(data as any)
  }

  const initiateEvent = (team: 'home' | 'away', points: number, type: string) => {
    setActiveEvent({ team, points, type, matchTime: formatTime(secondsElapsed) })
    setSubStep('off') 
    setSubPlayerOff(null)
  }

  const confirmEvent = async (playerId: string | null = null) => {
    if (!match || !activeEvent) return
    const { team, points, type, matchTime } = activeEvent
    const teamId = team === 'home' ? match.home_team_id : match.away_team_id
    const currentRoster = team === 'home' ? homeRoster : awayRoster

    if (type === 'Substitution') {
      if (subStep === 'off') {
        setSubPlayerOff(playerId); setSubStep('on'); return 
      } else {
        const playerOff = currentRoster.find(p => p.id === subPlayerOff)
        const playerOn = currentRoster.find(p => p.id === playerId)

        await supabase.from('match_events').insert([
          { 
            match_id: match.id, team_id: teamId, player_id: subPlayerOff, 
            player_name: playerOff?.full_name || null, player_jersey: playerOff?.jersey_number || null,
            event_type: 'Sub Off (🔴)', points: 0, match_time: matchTime 
          },
          { 
            match_id: match.id, team_id: teamId, player_id: playerId, 
            player_name: playerOn?.full_name || null, player_jersey: playerOn?.jersey_number || null,
            event_type: 'Sub On (🟢)', points: 0, match_time: matchTime 
          }
        ])
        toast.success("Substitution recorded!"); setActiveEvent(null); fetchEventLog(); return
      }
    }

    if (points > 0) {
      const isHome = team === 'home'
      const newScore = isHome ? match.home_score + points : match.away_score + points
      const columnToUpdate = isHome ? 'home_score' : 'away_score'
      setMatch({ ...match, [columnToUpdate]: newScore }) 
      await supabase.from('matches').update({ [columnToUpdate]: newScore }).eq('id', match.id)
    }

    const selectedPlayer = currentRoster.find(p => p.id === playerId)
    setActiveEvent(null) 
    
    try {
      await supabase.from('match_events').insert([{
        match_id: match.id, team_id: teamId, player_id: playerId, 
        player_name: selectedPlayer?.full_name || null, player_jersey: selectedPlayer?.jersey_number || null,
        event_type: type, points: points, match_time: matchTime
      }])
      toast.success(`${type} recorded!`)
      fetchEventLog() 
    } catch (error) { toast.error("Failed to sync event") }
  }

  // UPDATED: Now saves the exact clock time to the database when changing periods
  const handleStatusTransition = async () => {
    if (!match) return
    let nextStatus = ""
    let eventLabel = ""
    const nowIso = new Date().toISOString()
    let newPeriodStart: string | null = null
    let newPausedSeconds = match.paused_seconds || 0

    switch (match.status) {
      case 'scheduled':
        nextStatus = 'live'; eventLabel = '1ST HALF START'
        newPeriodStart = nowIso
        break
      case 'live':
        const isFirstHalf = !eventLog.some(e => e.event_type === 'HALF TIME')
        nextStatus = isFirstHalf ? 'halftime' : 'completed'
        eventLabel = isFirstHalf ? 'HALF TIME' : 'FULL TIME'
        // Pause the clock: Wipe the start time and save the accumulated seconds
        newPeriodStart = null
        newPausedSeconds = secondsElapsed
        break
      case 'halftime':
        nextStatus = 'live'; eventLabel = '2ND HALF START'
        // Restart the clock
        newPeriodStart = nowIso
        break
      default:
        return
    }

    // Update Local UI State
    setMatch({ ...match, status: nextStatus, period_started_at: newPeriodStart, paused_seconds: newPausedSeconds })
    
    // Sync to Database immediately
    await supabase.from('matches')
      .update({ status: nextStatus, period_started_at: newPeriodStart, paused_seconds: newPausedSeconds })
      .eq('id', matchId)
    
    await supabase.from('match_events').insert([{
      match_id: match.id, event_type: eventLabel, points: 0, match_time: formatTime(secondsElapsed)
    }])
    
    toast.info(eventLabel)
    fetchEventLog()
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">Loading Terminal...</div>
  if (!match) return <div className="flex items-center justify-center min-h-screen text-red-500">Error loading match.</div>

  const currentRoster = activeEvent?.team === 'home' ? homeRoster : awayRoster

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white">
      {/* Top Status Bar */}
      <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Activity className={`w-5 h-5 ${match.status === 'live' ? 'text-green-500 animate-pulse' : 'text-slate-600'}`} />
          <span className="font-bold tracking-wider uppercase">{match.status} Terminal</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {match.status === 'scheduled' && (
            <Button onClick={handleStatusTransition} className="bg-green-600 hover:bg-green-700">
              <Play className="w-4 h-4 mr-2" /> Start Match
            </Button>
          )}
          {match.status === 'live' && (
            <Button onClick={handleStatusTransition} variant="secondary" className="bg-orange-600 hover:bg-orange-700 text-white border-none">
              <Pause className="w-4 h-4 mr-2" /> {eventLog.some(e => e.event_type === 'HALF TIME') ? 'Full Time' : 'End 1st Half'}
            </Button>
          )}
          {match.status === 'halftime' && (
            <Button onClick={handleStatusTransition} className="bg-blue-600 hover:bg-blue-700">
              <Play className="w-4 h-4 mr-2" /> Start 2nd Half
            </Button>
          )}
          {match.status === 'completed' && (
            <Badge className="bg-slate-800 text-slate-400 py-2 px-4 border-slate-700">MATCH FINISHED</Badge>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center justify-start p-4 md:p-8 space-y-6 flex-grow">
        
        {/* Main Scoreboard */}
        <div className="flex items-center justify-center w-full max-w-2xl space-x-2 md:space-x-12">
          <div className="flex flex-col items-center w-1/3 text-center">
            <h2 className="text-lg md:text-xl font-bold text-slate-300 h-14 line-clamp-2">{match.home_team?.name}</h2>
            <div className="flex items-center justify-center w-24 h-24 md:w-32 md:h-32 text-5xl md:text-6xl font-black bg-slate-900 rounded-2xl border-2 border-slate-700 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              {match.home_score}
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center w-32">
            <div className={`px-4 py-2 rounded-lg font-mono text-3xl font-bold tracking-wider ${match.status === 'live' ? 'text-green-400 bg-green-400/10' : 'text-slate-500 bg-slate-800'}`}>
              {formatTime(secondsElapsed)}
            </div>
            <div className="mt-2 flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${match.status === 'live' ? 'bg-green-500 animate-pulse' : 'bg-slate-700'}`} />
              <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">{match.status}</span>
            </div>
          </div>

          <div className="flex flex-col items-center w-1/3 text-center">
            <h2 className="text-lg md:text-xl font-bold text-slate-300 h-14 line-clamp-2">{match.away_team?.name}</h2>
            <div className="flex items-center justify-center w-24 h-24 md:w-32 md:h-32 text-5xl md:text-6xl font-black bg-slate-900 rounded-2xl border-2 border-slate-700 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              {match.away_score}
            </div>
          </div>
        </div>

        {/* Scoring & Discipline Controls */}
        {match.status === 'live' ? (
          <div className="grid w-full max-w-2xl grid-cols-2 gap-2 md:gap-4">
            {/* Home Team Controls */}
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="flex flex-col p-3 space-y-2">
                <Button className="h-12 text-lg bg-blue-600 hover:bg-blue-700" onClick={() => initiateEvent('home', 5, 'Try')}>Try (+5)</Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="h-10 bg-slate-800 border-slate-700 text-white hover:bg-slate-700" onClick={() => initiateEvent('home', 2, 'Conversion')}>Conv (+2)</Button>
                  <Button variant="outline" className="h-10 bg-slate-800 border-slate-700 text-white hover:bg-slate-700" onClick={() => initiateEvent('home', 3, 'Penalty')}>Pen (+3)</Button>
                </div>
                <div className="grid grid-cols-4 gap-1 pt-2 mt-2 border-t border-slate-800">
                  <Button variant="outline" className="h-10 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border-yellow-500/50 p-0" onClick={() => initiateEvent('home', 0, 'Yellow Card')}>🟨</Button>
                  <Button variant="outline" className="h-10 bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/50 p-0" onClick={() => initiateEvent('home', 0, 'Red Card')}>🟥</Button>
                  <Button variant="outline" className="h-10 bg-slate-800 border-slate-700 text-white hover:bg-slate-700 p-0" onClick={() => initiateEvent('home', 0, 'Injury')}>🤕</Button>
                  <Button variant="outline" className="h-10 bg-blue-500/10 border-blue-500/50 text-blue-400 hover:bg-blue-500/20 p-0" onClick={() => initiateEvent('home', 0, 'Substitution')}><RefreshCw className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>

            {/* Away Team Controls */}
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="flex flex-col p-3 space-y-2">
                <Button className="h-12 text-lg bg-blue-600 hover:bg-blue-700" onClick={() => initiateEvent('away', 5, 'Try')}>Try (+5)</Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="h-10 bg-slate-800 border-slate-700 text-white hover:bg-slate-700" onClick={() => initiateEvent('away', 2, 'Conversion')}>Conv (+2)</Button>
                  <Button variant="outline" className="h-10 bg-slate-800 border-slate-700 text-white hover:bg-slate-700" onClick={() => initiateEvent('away', 3, 'Penalty')}>Pen (+3)</Button>
                </div>
                <div className="grid grid-cols-4 gap-1 pt-2 mt-2 border-t border-slate-800">
                  <Button variant="outline" className="h-10 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border-yellow-500/50 p-0" onClick={() => initiateEvent('away', 0, 'Yellow Card')}>🟨</Button>
                  <Button variant="outline" className="h-10 bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/50 p-0" onClick={() => initiateEvent('away', 0, 'Red Card')}>🟥</Button>
                  <Button variant="outline" className="h-10 bg-slate-800 border-slate-700 text-white hover:bg-slate-700 p-0" onClick={() => initiateEvent('away', 0, 'Injury')}>🤕</Button>
                  <Button variant="outline" className="h-10 bg-blue-500/10 border-blue-500/50 text-blue-400 hover:bg-blue-500/20 p-0" onClick={() => initiateEvent('away', 0, 'Substitution')}><RefreshCw className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="mt-4 text-center px-8 py-12 bg-slate-900/50 rounded-xl border border-dashed border-slate-800 text-slate-500">
             <Clock className="w-8 h-8 mx-auto mb-3 opacity-20" />
             <p className="text-sm font-medium">Controls are disabled. Change match status above.</p>
          </div>
        )}

        {/* Live Match Feed */}
        <div className="w-full max-w-2xl mt-8">
          <div className="flex items-center mb-4 text-slate-400 px-1">
            <List className="w-4 h-4 mr-2" />
            <h3 className="text-[10px] font-black tracking-[0.2em] uppercase">Live Event Log</h3>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {eventLog.length === 0 ? (
              <p className="text-slate-600 text-xs italic ml-1">Waiting for first whistle...</p>
            ) : (
              eventLog.map(log => (
                <div key={log.id} className={`flex items-center justify-between p-3 border rounded-lg text-sm transition-all ${
                  log.event_type.includes('START') || log.event_type.includes('TIME') 
                    ? 'bg-blue-500/5 border-blue-500/20' 
                    : 'bg-slate-900 border-slate-800'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="px-2 py-1 text-[10px] font-mono font-bold text-blue-400 bg-blue-900/30 rounded">
                      {log.match_time || "00:00"}
                    </div>
                    <span className={`font-bold w-32 ${
                      log.event_type === 'HALF TIME' || log.event_type === 'FULL TIME' ? 'text-orange-400' : 'text-slate-300'
                    }`}>{log.event_type}</span>
                    <span className="text-slate-400 truncate max-w-[150px]">
                      {(log.player_name || log.players) ? `#${log.player_jersey || log.players?.jersey_number} ${log.player_name || log.players?.full_name}` : ""}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 hidden sm:block uppercase tracking-tighter">{log.teams?.name}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Dynamic Player Selection Modal */}
      <Dialog open={activeEvent !== null} onOpenChange={(open) => !open && setActiveEvent(null)}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl font-bold">
              {activeEvent?.points === 0 && activeEvent.type !== 'Substitution' && <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />}
              {activeEvent?.type === 'Substitution' 
                ? (subStep === 'off' ? "🔴 Player Coming OFF" : "🟢 Player Coming ON")
                : `Log ${activeEvent?.type}`
              }
            </DialogTitle>
            <div className="flex items-center text-xs text-slate-500 mt-1">
               <Clock className="w-4 h-4 mr-1" />
               Timestamp: <span className="font-mono font-bold text-blue-600 dark:text-blue-400 ml-1">{activeEvent?.matchTime}</span>
            </div>
          </DialogHeader>
          <div className="grid gap-2 py-4 max-h-[400px] overflow-y-auto pr-2">
            {currentRoster.length === 0 ? (
              <div className="text-center text-slate-500 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">No roster found.</div>
            ) : (
              currentRoster.map((player) => (
                <Button 
                  key={player.id} 
                  variant="outline" 
                  className={`justify-start h-14 text-lg border-2 transition-all hover:scale-[1.02] active:scale-95 ${
                    activeEvent?.type === 'Substitution' && subStep === 'off' ? 'hover:bg-red-50 hover:border-red-200' : 
                    activeEvent?.type === 'Substitution' && subStep === 'on' ? 'hover:bg-green-50 hover:border-green-200' :
                    activeEvent?.type.includes('Card') ? 'hover:bg-red-50 hover:border-red-200' : 'hover:bg-blue-50 hover:border-blue-200'
                  }`}
                  onClick={() => confirmEvent(player.id)}
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full mr-3 text-sm font-black text-slate-500">
                    #{player.jersey_number}
                  </div>
                  <span className="font-semibold">{player.full_name}</span>
                </Button>
              ))
            )}
          </div>
          <Button variant="ghost" className="w-full mt-2 text-slate-400 hover:text-slate-900" onClick={() => confirmEvent(null)}>
            <User className="w-4 h-4 mr-2" /> Skip Player Selection
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}