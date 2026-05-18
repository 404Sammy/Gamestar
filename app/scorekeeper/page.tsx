"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Activity, Clock, CalendarDays, Swords, ShieldCheck, FolderKanban, Layers } from "lucide-react"

type Team = { id: string; name: string; pool_name: string; category: string }
type Pool = { id: string; name: string; category: string }
type Stage = { id: string; matchday: string; round_name: string; match_date: string }
type Match = {
  id: string, status: string, home_score: number, away_score: number, 
  kickoff_time: string, matchday: string, round_name: string, match_name: string,
  home_team: { name: string, pool_name: string }, 
  away_team: { name: string, pool_name: string }
}

export default function ScorekeeperHub() {
  const [matches, setMatches] = useState<Match[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [pools, setPools] = useState<Pool[]>([])
  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(true)

  // Scheduling States
  const [selectedPoolName, setSelectedPoolName] = useState("")
  const [homeTeamId, setHomeTeamId] = useState("")
  const [awayTeamId, setAwayTeamId] = useState("")
  const [selectedStageId, setSelectedStageId] = useState("") 
  const [timeOnly, setTimeOnly] = useState("") 
  const [matchName, setMatchName] = useState("")

  useEffect(() => { fetchAllData() }, [])

  const fetchAllData = async () => {
    setLoading(true)
    const { data: matchesData } = await supabase.from('matches').select('id, status, home_score, away_score, kickoff_time, matchday, round_name, match_name, home_team:teams!home_team_id(name, pool_name), away_team:teams!away_team_id(name, pool_name)').neq('status', 'completed').order('kickoff_time', { ascending: true })
    if (matchesData) setMatches(matchesData as any)

    const { data: teamsData } = await supabase.from('teams').select('*').order('name')
    if (teamsData) setTeams(teamsData as any)

    const { data: poolsData } = await supabase.from('pools').select('*').order('name')
    if (poolsData) setPools(poolsData as any)

    const { data: stagesData } = await supabase.from('stages').select('*').order('match_date')
    if (stagesData) setStages(stagesData as any)

    setLoading(false)
  }

  const handleCreateMatch = async () => {
    if (!selectedPoolName || !homeTeamId || !awayTeamId || !selectedStageId || !timeOnly || !matchName) { 
      toast.error("Please fill out all scheduling fields"); return 
    }
    if (homeTeamId === awayTeamId) { toast.error("A team cannot play itself!"); return }

    const stage = stages.find(s => s.id === selectedStageId)
    if (!stage || !stage.match_date) {
      toast.error("Configuration Error", { description: "This stage is missing a valid date. Ask the Organizer to recreate it." }); 
      return;
    }

    setLoading(true)
    
    try {
      // Safely combine the Organizer's Date with the Scorekeeper's Time
      const combinedIsoTime = new Date(`${stage.match_date}T${timeOnly}`).toISOString()

      const { error } = await supabase.from('matches').insert([{ 
        home_team_id: homeTeamId, 
        away_team_id: awayTeamId,
        kickoff_time: combinedIsoTime,
        matchday: stage.matchday,
        round_name: stage.round_name,
        match_name: matchName
      }])

      if (error) { 
        console.error("Supabase Error:", error)
        toast.error("Database Error", { description: error.message }) 
      } else {
        toast.success("Fixture Scheduled!")
        setHomeTeamId(""); setAwayTeamId(""); setTimeOnly(""); setMatchName("") 
        fetchAllData()
      }
    } catch (err: any) {
      console.error("Time Parse Error:", err)
      toast.error("Time Error", { description: "The time format provided is invalid." })
    }
    
    setLoading(false)
  }

  const formatTime = (isoString: string) => isoString ? new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""

  const menPools = pools.filter(p => p.category === 'Men')
  const womenPools = pools.filter(p => p.category === 'Women')
  const availableTeamsInPool = teams.filter(team => team.pool_name === selectedPoolName)

  // Group stages by Matchday so the dropdown looks organized
  const groupedStages = stages.reduce((acc, stage) => {
    if (!acc[stage.matchday]) acc[stage.matchday] = [];
    acc[stage.matchday].push(stage);
    return acc;
  }, {} as Record<string, Stage[]>)

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-4xl space-y-6">
        
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-bold dark:text-white">Operations Desk</h1><p className="text-slate-500">Fixture scheduling and live match terminals.</p></div>
          <Badge variant="outline" className="px-4 py-1 bg-indigo-50 text-indigo-700 border-indigo-200">Scorekeeper Access</Badge>
        </div>

        <Tabs defaultValue="fixtures" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 bg-slate-200/50 dark:bg-slate-900">
            <TabsTrigger value="live"><Activity className="w-4 h-4 mr-2" /> Live Scoring</TabsTrigger>
            <TabsTrigger value="fixtures"><CalendarDays className="w-4 h-4 mr-2" /> Schedule Fixtures</TabsTrigger>
          </TabsList>

          {/* LIVE SCORING TAB */}
          <TabsContent value="live" className="mt-0">
             <Card className="border-2 shadow-sm border-slate-200 dark:border-slate-800">
               <CardHeader className="bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                 <CardTitle className="text-lg">Active & Scheduled Fixtures</CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                {loading ? <div className="py-12 text-center text-slate-500">Loading fixtures...</div> : matches.length === 0 ? <div className="py-12 text-center text-slate-500">No active matches require scoring.</div> : (
                  <div className="divide-y divide-slate-200 dark:divide-slate-800">
                    {matches.map(match => (
                      <div key={match.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                         <div className="flex flex-col space-y-2">
                           <div className="flex flex-wrap items-center gap-2">
                              {(match.matchday || match.round_name || match.match_name) && (
                                <Badge variant="outline" className="text-[10px] uppercase tracking-widest text-indigo-500 border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-800">
                                  <Layers className="w-3 h-3 mr-1" /> 
                                  {match.matchday} • {match.round_name} {match.match_name && `• ${match.match_name}`}
                                </Badge>
                              )}
                              {match.home_team?.pool_name && (
                                <Badge variant="outline" className="text-[10px] uppercase tracking-widest text-blue-500 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                                  <FolderKanban className="w-3 h-3 mr-1" /> {match.home_team.pool_name}
                                </Badge>
                              )}
                              {match.status === 'live' || match.status === 'halftime' ? (
                                <Badge variant="destructive" className="animate-pulse uppercase text-[10px]"><Activity className="w-3 h-3 mr-1"/> {match.status}</Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[10px]"><Clock className="w-3 h-3 mr-1"/>{formatTime(match.kickoff_time)}</Badge>
                              )}
                           </div>
                           <p className="text-lg font-semibold text-slate-900 dark:text-white">{match.home_team?.name} <span className="text-slate-400 font-normal mx-2">vs</span> {match.away_team?.name}</p>
                         </div>
                         <Link href={`/referee/${match.id}`}>
                           <Button className={match.status === 'live' || match.status === 'halftime' ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}>
                             {match.status === 'live' || match.status === 'halftime' ? "Resume Scoring" : "Open Terminal"}
                           </Button>
                         </Link>
                      </div>
                    ))}
                  </div>
                )}
               </CardContent>
             </Card>
          </TabsContent>

          {/* SCHEDULING TAB */}
          <TabsContent value="fixtures" className="mt-0">
            <Card className="border-2 shadow-sm border-slate-200 dark:border-slate-800">
              <CardHeader className="bg-slate-100/50 dark:bg-slate-900/50 border-b">
                <CardTitle className="text-lg flex items-center"><CalendarDays className="w-5 h-5 mr-2 text-blue-600" /> Match Creator</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                
                {/* Step 1 & 2 */}
                <div className="grid grid-cols-1 gap-6 mb-8">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Step 1: Target Pool</label>
                    <Select value={selectedPoolName} onValueChange={(val) => { setSelectedPoolName(val); setHomeTeamId(""); setAwayTeamId(""); }}>
                      <SelectTrigger className="bg-white dark:bg-slate-950"><SelectValue placeholder="Choose a pool..." /></SelectTrigger>
                      <SelectContent>
                        {menPools.length > 0 && <SelectGroup><SelectLabel className="text-blue-500 font-black">Men's</SelectLabel>{menPools.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectGroup>}
                        {womenPools.length > 0 && <SelectGroup><SelectLabel className="text-purple-500 font-black mt-2">Women's</SelectLabel>{womenPools.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectGroup>}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className={`transition-opacity ${!selectedPoolName ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Step 2: Assign Teams</label>
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                      <Select value={homeTeamId} onValueChange={setHomeTeamId}><SelectTrigger className="bg-white dark:bg-slate-950"><SelectValue placeholder="Home Team" /></SelectTrigger><SelectContent>{availableTeamsInPool.map(team => <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>)}</SelectContent></Select>
                      <Swords className="w-6 h-6 text-slate-300" />
                      <Select value={awayTeamId} onValueChange={setAwayTeamId}><SelectTrigger className="bg-white dark:bg-slate-950"><SelectValue placeholder="Away Team" /></SelectTrigger><SelectContent>{availableTeamsInPool.map(team => <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>)}</SelectContent></Select>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className={`transition-opacity ${(!homeTeamId || !awayTeamId) ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Step 3: Tournament Stage & Time</label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-500 uppercase">Stage (Date is fixed)</label>
                      <Select value={selectedStageId} onValueChange={setSelectedStageId}>
                        <SelectTrigger className="bg-white dark:bg-slate-950"><SelectValue placeholder="Select Stage..." /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(groupedStages).map(([matchday, stageList]) => (
                            <SelectGroup key={matchday}>
                              <SelectLabel className="text-indigo-600 font-bold">{matchday}</SelectLabel>
                              {stageList.map(s => <SelectItem key={s.id} value={s.id}>{s.round_name} ({s.match_date})</SelectItem>)}
                            </SelectGroup>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-500 uppercase">Match Name</label>
                      <Input placeholder="e.g., Match 1" className="bg-white dark:bg-slate-950" value={matchName} onChange={(e) => setMatchName(e.target.value)} />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-500 uppercase text-blue-600 font-bold">Kickoff Time ONLY</label>
                      <Input type="time" className="bg-white dark:bg-slate-950 border-blue-300 focus-visible:ring-blue-500" value={timeOnly} onChange={(e) => setTimeOnly(e.target.value)} />
                    </div>
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg" onClick={handleCreateMatch} disabled={loading || !selectedStageId || !timeOnly || !matchName}>
                    {loading ? "Saving..." : "Schedule Match"}
                  </Button>
                </div>

              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}