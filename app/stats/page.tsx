"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trophy, Medal, Swords, Activity, Layers } from "lucide-react"

type TeamStanding = { id: string, name: string, pool_name: string, played: number, won: number, drawn: number, lost: number, pf: number, pa: number, pd: number, pts: number }
type PlayerStat = { id: string, name: string, jersey: number, teamName: string, tries: number, totalPoints: number }

export default function TournamentStats() {
  // We changed standings from a flat array to an Object grouped by Pool Name
  const [groupedStandings, setGroupedStandings] = useState<Record<string, TeamStanding[]>>({})
  const [topTryScorers, setTopTryScorers] = useState<PlayerStat[]>([])
  const [topPointScorers, setTopPointScorers] = useState<PlayerStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    calculateStats()
  }, [])

  const calculateStats = async () => {
    // Fetch all required data
    const { data: teamsData } = await supabase.from('teams').select('*')
    const { data: matchesData } = await supabase.from('matches').select('*').eq('status', 'completed')
    const { data: eventsData } = await supabase.from('match_events').select('player_id, player_name, player_jersey, event_type, points, teams(name)').gt('points', 0)

    if (!teamsData) return

    // Calculate Raw Standings
    const table: TeamStanding[] = teamsData.map(team => {
      let played = 0, won = 0, drawn = 0, lost = 0, pf = 0, pa = 0, pts = 0;

      matchesData?.forEach(match => {
        if (match.home_team_id === team.id) {
          played++; pf += match.home_score; pa += match.away_score;
          if (match.home_score > match.away_score) { won++; pts += 4; } 
          else if (match.home_score === match.away_score) { drawn++; pts += 2; } 
          else { lost++; }
        } else if (match.away_team_id === team.id) {
          played++; pf += match.away_score; pa += match.home_score;
          if (match.away_score > match.home_score) { won++; pts += 4; }
          else if (match.away_score === match.home_score) { drawn++; pts += 2; }
          else { lost++; }
        }
      })

      return { 
        id: team.id, name: team.name, pool_name: team.pool_name || 'Unassigned', 
        played, won, drawn, lost, pf, pa, pd: pf - pa, pts 
      }
    })

    // Group the teams by their Pool
    const grouped: Record<string, TeamStanding[]> = {}
    table.forEach(team => {
      if (!grouped[team.pool_name]) grouped[team.pool_name] = []
      grouped[team.pool_name].push(team)
    })

    // Sort the teams INSIDE each pool by Points, then Point Difference
    Object.keys(grouped).forEach(pool => {
      grouped[pool].sort((a, b) => b.pts - a.pts || b.pd - a.pd)
    })

    setGroupedStandings(grouped)

    // Calculate Player Stats (remains the same)
    const playerMap: Record<string, PlayerStat> = {}
    eventsData?.forEach(event => {
      if (!event.player_id || !event.player_name) return 
      if (!playerMap[event.player_id]) {
        playerMap[event.player_id] = {
          id: event.player_id, name: event.player_name, jersey: event.player_jersey,
          teamName: event.teams?.name || "Unknown", tries: 0, totalPoints: 0
        }
      }
      playerMap[event.player_id].totalPoints += event.points
      if (event.event_type.toLowerCase().includes('try')) {
        playerMap[event.player_id].tries += 1
      }
    })

    const allPlayers = Object.values(playerMap)
    setTopTryScorers([...allPlayers].sort((a, b) => b.tries - a.tries).slice(0, 5))
    setTopPointScorers([...allPlayers].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 5))
    
    setLoading(false)
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-400">Calculating Pool Data...</div>

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex items-center space-x-3 mb-8">
          <Activity className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white uppercase">Tournament Center</h1>
            <p className="text-slate-400 font-medium">Official Pool Standings & Statistics</p>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Main Ranking Tables Area (Takes up 2 columns) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center space-x-2 text-slate-300">
              <Layers className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-bold uppercase tracking-wider">Pool Rankings</h2>
            </div>
            
            {/* Loop through every Pool and render a specific table for it */}
            {Object.entries(groupedStandings).sort().map(([poolName, teams]) => (
              <div key={poolName} className="space-y-3">
                <h3 className="text-lg font-bold text-blue-400 uppercase tracking-widest pl-1">{poolName}</h3>
                <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden text-white">
                  <CardContent className="p-0 overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-950/50 whitespace-nowrap">
                        <TableRow className="border-slate-800 hover:bg-transparent">
                          <TableHead className="w-12 text-center text-slate-400">#</TableHead>
                          <TableHead className="text-slate-400">Team Name</TableHead>
                          <TableHead className="text-center text-slate-400" title="Games Played">GP</TableHead>
                          <TableHead className="text-center text-slate-400" title="Won">W</TableHead>
                          <TableHead className="text-center text-slate-400" title="Drawn">D</TableHead>
                          <TableHead className="text-center text-slate-400" title="Lost">L</TableHead>
                          <TableHead className="text-center text-slate-400" title="Points For (GF)">GF</TableHead>
                          <TableHead className="text-center text-slate-400" title="Points Against (GA)">GA</TableHead>
                          <TableHead className="text-center text-slate-400" title="Points Difference (GD)">GD</TableHead>
                          <TableHead className="text-center font-black text-blue-400">PTS</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teams.map((team, index) => (
                          <TableRow key={team.id} className="border-slate-800 hover:bg-slate-800/50 transition-colors whitespace-nowrap">
                            <TableCell className="text-center font-bold text-slate-500">{index + 1}</TableCell>
                            <TableCell className="font-bold">{team.name}</TableCell>
                            <TableCell className="text-center">{team.played}</TableCell>
                            <TableCell className="text-center text-green-400">{team.won}</TableCell>
                            <TableCell className="text-center text-slate-400">{team.drawn}</TableCell>
                            <TableCell className="text-center text-red-400">{team.lost}</TableCell>
                            <TableCell className="text-center font-mono text-slate-300">{team.pf}</TableCell>
                            <TableCell className="text-center font-mono text-slate-300">{team.pa}</TableCell>
                            <TableCell className="text-center font-mono">{team.pd > 0 ? `+${team.pd}` : team.pd}</TableCell>
                            <TableCell className="text-center font-black text-lg text-white">{team.pts}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Player Leaderboards (Takes up 1 column) */}
          <div className="space-y-8">
            {/* Top Try Scorers */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-slate-300">
                <Swords className="w-5 h-5 text-red-500" />
                <h2 className="text-xl font-bold uppercase tracking-wider">Top Try Scorers</h2>
              </div>
              <Card className="bg-slate-900 border-slate-800 shadow-xl text-white">
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-800">
                    {topTryScorers.length === 0 ? <p className="p-6 text-center text-slate-500">No tries recorded yet.</p> : null}
                    {topTryScorers.map((player, index) => (
                      <div key={player.id} className="flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${
                            index === 0 ? 'bg-yellow-500/20 text-yellow-500' : 
                            index === 1 ? 'bg-slate-400/20 text-slate-400' : 
                            index === 2 ? 'bg-amber-700/20 text-amber-600' : 'bg-slate-800 text-slate-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-bold">{player.name}</p>
                            <p className="text-xs text-slate-400">{player.teamName} • #{player.jersey}</p>
                          </div>
                        </div>
                        <div className="text-xl font-black">{player.tries}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Point Scorers */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-slate-300">
                <Medal className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-bold uppercase tracking-wider">Top Points</h2>
              </div>
              <Card className="bg-slate-900 border-slate-800 shadow-xl text-white">
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-800">
                    {topPointScorers.length === 0 ? <p className="p-6 text-center text-slate-500">No points recorded yet.</p> : null}
                    {topPointScorers.map((player, index) => (
                      <div key={player.id} className="flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black bg-slate-800 text-slate-500`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-bold">{player.name}</p>
                            <p className="text-xs text-slate-400">{player.teamName}</p>
                          </div>
                        </div>
                        <div className="text-xl font-black text-blue-400">{player.totalPoints}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}