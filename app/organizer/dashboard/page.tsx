"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { CalendarDays, Trophy, Users, FolderKanban, Shield, Trash2, ArrowRightLeft, Layers, CalendarClock, UserMinus, Globe } from "lucide-react"

type Tournament = { id: string, title: string }
type Pool = { id: string, name: string, category: string }
type Team = { id: string, name: string, coach_name: string, pool_name: string, category: string }
type Stage = { id: string, matchday: string, round_name: string, match_date: string }
type Match = { id: string, status: string, home_score: number, away_score: number, home_team: { name: string }, away_team: { name: string } }

export default function OrganizerDashboard() {
  // Global Context States
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [activeTournamentId, setActiveTournamentId] = useState<string>("")

  // Data States (Filtered by active tournament)
  const [pools, setPools] = useState<Pool[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(true)

  // Form States
  const [newPoolName, setNewPoolName] = useState("")
  const [newPoolCategory, setNewPoolCategory] = useState("")
  const [selectedTeamId, setSelectedTeamId] = useState("")
  const [assignToPool, setAssignToPool] = useState("")
  const [newMatchday, setNewMatchday] = useState("")
  const [newRoundName, setNewRoundName] = useState("")
  const [newMatchDate, setNewMatchDate] = useState("")

  // 1. Initial Load: Fetch Tournaments and Global Admin Context
  useEffect(() => {
    fetchGlobalContext()
  }, [])

  // 2. Whenever the Active Tournament changes, fetch its specific data
  useEffect(() => {
    if (activeTournamentId) fetchTournamentData(activeTournamentId)
  }, [activeTournamentId])

  const fetchGlobalContext = async () => {
    const { data: tData } = await supabase.from('tournament_settings').select('id, title').order('id')
    if (tData) setTournaments(tData as any)

    const { data: ctxData } = await supabase.from('admin_context').select('active_tournament_id').eq('id', 1).single()
    if (ctxData && ctxData.active_tournament_id) {
      setActiveTournamentId(ctxData.active_tournament_id.toString())
    }
  }

  const fetchTournamentData = async (tId: string) => {
    setLoading(true)
    // Notice the .eq('tournament_id', tId) added to every query!
    const { data: poolsData } = await supabase.from('pools').select('*').eq('tournament_id', tId).order('name')
    if (poolsData) setPools(poolsData as any)

    const { data: teamsData } = await supabase.from('teams').select('*').eq('tournament_id', tId).order('name')
    if (teamsData) setTeams(teamsData as any)

    const { data: stagesData } = await supabase.from('stages').select('*').eq('tournament_id', tId).order('match_date')
    if (stagesData) setStages(stagesData as any)

    const { data: matchesData } = await supabase.from('matches').select('id, status, home_score, away_score, home_team:teams!home_team_id(name), away_team:teams!away_team_id(name)').eq('tournament_id', tId).order('kickoff_time', { ascending: false })
    if (matchesData) setMatches(matchesData as any)
    
    setLoading(false)
  }

  // Handle switching tournaments
  const handleSwitchTournament = async (newId: string) => {
    setActiveTournamentId(newId)
    toast.info("Switching context...")
    await supabase.from('admin_context').update({ active_tournament_id: parseInt(newId) }).eq('id', 1)
  }

  // Action: Create Pool (Now includes tournament_id)
  const handleCreatePool = async () => {
    if (!newPoolName || !newPoolCategory || !activeTournamentId) return toast.error("Missing Info")
    setLoading(true)
    await supabase.from('pools').insert([{ name: newPoolName.toUpperCase(), category: newPoolCategory, tournament_id: activeTournamentId }])
    toast.success("Pool created!"); setNewPoolName(""); setNewPoolCategory(""); fetchTournamentData(activeTournamentId)
  }

  const handleDeletePool = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name}? Teams in this pool will become unassigned.`)) return;
    setLoading(true); await supabase.from('pools').delete().eq('id', id); fetchTournamentData(activeTournamentId)
  }

  // Action: Assign Team
  const handleAssignTeam = async () => {
    if (!selectedTeamId || !assignToPool) return toast.error("Select Team & Pool")
    setLoading(true)
    await supabase.from('teams').update({ pool_name: assignToPool }).eq('id', selectedTeamId)
    toast.success("Team assigned!"); setSelectedTeamId(""); setAssignToPool(""); fetchTournamentData(activeTournamentId)
  }

  const handleRemoveFromPool = async (id: string, name: string) => {
    if (!window.confirm(`Remove ${name} from this pool?`)) return;
    setLoading(true); await supabase.from('teams').update({ pool_name: 'Unassigned' }).eq('id', id); toast.success(`${name} unassigned!`); fetchTournamentData(activeTournamentId)
  }

  // Action: Create Stage (Now includes tournament_id)
  const handleCreateStage = async () => {
    if (!newMatchday || !newRoundName || !newMatchDate || !activeTournamentId) return toast.error("Fill all stage details")
    setLoading(true)
    const { error } = await supabase.from('stages').insert([{ matchday: newMatchday, round_name: newRoundName, match_date: newMatchDate, tournament_id: activeTournamentId }])
    if (!error) { toast.success("Stage Saved!"); setNewMatchday(""); setNewRoundName(""); setNewMatchDate(""); fetchTournamentData(activeTournamentId) }
  }

  const handleDeleteStage = async (id: string) => {
    if (!window.confirm("Delete this stage?")) return;
    setLoading(true); await supabase.from('stages').delete().eq('id', id); fetchTournamentData(activeTournamentId)
  }

  // Grouping & Filtering for UI
  const menPools = pools.filter(p => p.category === 'Men')
  const womenPools = pools.filter(p => p.category === 'Women')
  
  const unassignedTeams = teams.filter(t => t.pool_name === 'Unassigned' || !t.pool_name)
  const unassignedMen = unassignedTeams.filter(t => t.category === 'Men')
  const unassignedWomen = unassignedTeams.filter(t => t.category === 'Women')

  const pooledTeams = teams.filter(t => t.pool_name && t.pool_name !== 'Unassigned')
  const groupedPooledTeams = pooledTeams.reduce((acc, team) => {
    if (!acc[team.pool_name]) acc[team.pool_name] = [];
    acc[team.pool_name].push(team);
    return acc;
  }, {} as Record<string, Team[]>)

  const selectedTeamCategory = teams.find(t => t.id === selectedTeamId)?.category || 'Men'

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-6xl space-y-8">
        
        {/* NEW: Admin Header with Context Switcher */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border-2 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold dark:text-white flex items-center">
              <Globe className="w-8 h-8 mr-3 text-indigo-600" />
              Global Command
            </h1>
            <p className="text-slate-500 mt-1">Manage infrastructure across all network tournaments.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider hidden sm:inline-block">Active Network:</span>
            <Select value={activeTournamentId} onValueChange={handleSwitchTournament}>
              <SelectTrigger className="w-[220px] font-bold border-indigo-200 focus:ring-indigo-500">
                <SelectValue placeholder="Select Tournament" />
              </SelectTrigger>
              <SelectContent>
                {tournaments.map(t => (
                  <SelectItem key={t.id} value={t.id.toString()}>{t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge className="bg-indigo-600">Admin</Badge>
          </div>
        </div>

        {/* The Rest of the UI remains identical, but data is completely dynamic! */}
        <Tabs defaultValue="assign" className="w-full">
          <TabsList className="grid w-full max-w-3xl grid-cols-4 mb-8 bg-slate-200/50 dark:bg-slate-900">
            <TabsTrigger value="pools"><FolderKanban className="w-4 h-4 mr-2" /> 1. Pools</TabsTrigger>
            <TabsTrigger value="stages"><CalendarClock className="w-4 h-4 mr-2" /> 2. Stages</TabsTrigger>
            <TabsTrigger value="assign"><Users className="w-4 h-4 mr-2" /> 3. Assign</TabsTrigger>
            <TabsTrigger value="overview"><Trophy className="w-4 h-4 mr-2" /> 4. Overview</TabsTrigger>
          </TabsList>

          {/* TAB 1: POOLS */}
          <TabsContent value="pools" className="mt-0">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <Card className="md:col-span-1 border-2 shadow-sm">
                 <CardHeader className="bg-slate-100/50"><CardTitle className="text-lg">Create Pool</CardTitle></CardHeader>
                 <CardContent className="space-y-4 pt-6">
                  <Input placeholder="e.g., Pool MA" value={newPoolName} onChange={(e) => setNewPoolName(e.target.value)} />
                  <Select value={newPoolCategory} onValueChange={setNewPoolCategory}>
                    <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent><SelectItem value="Men">Men</SelectItem><SelectItem value="Women">Women</SelectItem></SelectContent>
                  </Select>
                  <Button className="w-full" onClick={handleCreatePool} disabled={loading || !activeTournamentId}>Save Pool</Button>
                 </CardContent>
               </Card>
               <Card className="md:col-span-2 border-2 shadow-sm">
                 <CardHeader className="bg-slate-100/50"><CardTitle className="text-lg">Active Pools</CardTitle></CardHeader>
                 <CardContent className="grid grid-cols-2 gap-4 pt-6">
                  <div>
                    <h3 className="font-bold text-blue-600 mb-2">Men's</h3>
                    {menPools.length === 0 && <p className="text-xs text-slate-400">No pools in this tournament.</p>}
                    {menPools.map(p => <div key={p.id} className="flex justify-between p-2 border mb-2 rounded bg-slate-50">{p.name}<Trash2 className="w-4 h-4 text-red-500 cursor-pointer" onClick={()=>handleDeletePool(p.id, p.name)}/></div>)}
                  </div>
                  <div>
                    <h3 className="font-bold text-purple-600 mb-2">Women's</h3>
                    {womenPools.length === 0 && <p className="text-xs text-slate-400">No pools in this tournament.</p>}
                    {womenPools.map(p => <div key={p.id} className="flex justify-between p-2 border mb-2 rounded bg-slate-50">{p.name}<Trash2 className="w-4 h-4 text-red-500 cursor-pointer" onClick={()=>handleDeletePool(p.id, p.name)}/></div>)}
                  </div>
                 </CardContent>
               </Card>
             </div>
          </TabsContent>

          {/* TAB 2: STAGES & DATES */}
          <TabsContent value="stages" className="mt-0">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <Card className="md:col-span-1 border-2 shadow-sm">
                 <CardHeader className="bg-slate-100/50"><CardTitle className="flex items-center text-lg"><Layers className="w-5 h-5 mr-2 text-indigo-600" /> Create Stage</CardTitle></CardHeader>
                 <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2"><label className="text-xs font-bold uppercase">Matchday Name</label><Input placeholder="e.g., Day 1" value={newMatchday} onChange={(e) => setNewMatchday(e.target.value)} /></div>
                    <div className="space-y-2"><label className="text-xs font-bold uppercase">Round / Group</label><Input placeholder="e.g., Round 1" value={newRoundName} onChange={(e) => setNewRoundName(e.target.value)} /></div>
                    <div className="space-y-2"><label className="text-xs font-bold uppercase">Official Date</label><Input type="date" value={newMatchDate} onChange={(e) => setNewMatchDate(e.target.value)} /></div>
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleCreateStage} disabled={loading || !activeTournamentId}>Lock Stage Date</Button>
                 </CardContent>
               </Card>
               <Card className="md:col-span-2 border-2 shadow-sm">
                 <CardHeader className="bg-slate-100/50"><CardTitle className="text-lg">Tournament Calendar</CardTitle></CardHeader>
                 <CardContent className="pt-6 space-y-2">
                    {stages.length === 0 ? <p className="text-slate-500">No stages set for this tournament.</p> : stages.map(s => (
                      <div key={s.id} className="flex items-center justify-between p-3 border rounded bg-white dark:bg-slate-900">
                        <div className="flex items-center space-x-4">
                          <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">{s.matchday}</Badge>
                          <span className="font-bold">{s.round_name}</span>
                          <span className="text-slate-500 font-mono text-sm border-l pl-4 ml-4">{s.match_date}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteStage(s.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    ))}
                 </CardContent>
               </Card>
             </div>
          </TabsContent>

          {/* TAB 3: ASSIGN TEAMS */}
          <TabsContent value="assign" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1 border-2 shadow-sm h-fit">
                <CardHeader className="bg-slate-100/50 dark:bg-slate-900/50">
                  <CardTitle className="flex items-center text-lg"><ArrowRightLeft className="w-5 h-5 mr-2 text-blue-600" /> Assign Team</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 pt-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">1. Select Registered Team</label>
                    <Select value={selectedTeamId} onValueChange={(val) => { setSelectedTeamId(val); setAssignToPool(""); }}>
                      <SelectTrigger className="bg-white"><SelectValue placeholder="Choose pending team..." /></SelectTrigger>
                      <SelectContent>
                        {unassignedTeams.length === 0 && <SelectItem value="none" disabled>No pending teams in this tournament</SelectItem>}
                        {unassignedMen.length > 0 && <SelectGroup><SelectLabel className="text-blue-500 font-black">Men's</SelectLabel>{unassignedMen.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectGroup>}
                        {unassignedWomen.length > 0 && <SelectGroup><SelectLabel className="text-purple-500 font-black mt-2">Women's</SelectLabel>{unassignedWomen.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectGroup>}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">2. Target Pool</label>
                    <Select value={assignToPool} onValueChange={setAssignToPool} disabled={!selectedTeamId}>
                      <SelectTrigger className="bg-white"><SelectValue placeholder="Select target pool..." /></SelectTrigger>
                      <SelectContent>
                        {selectedTeamCategory === 'Men' && menPools.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                        {selectedTeamCategory === 'Women' && womenPools.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700" onClick={handleAssignTeam} disabled={loading || !selectedTeamId || !assignToPool}>
                    Lock in Assignment
                  </Button>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 border-2 shadow-sm">
                <CardHeader className="bg-slate-100/50 dark:bg-slate-900/50">
                  <CardTitle className="flex items-center text-lg"><Users className="w-5 h-5 mr-2 text-blue-600" /> Current Assignments</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6 max-h-[600px] overflow-y-auto">
                  {Object.keys(groupedPooledTeams).length === 0 ? <p className="text-center text-slate-500">No teams assigned yet for this event.</p> : (
                    Object.entries(groupedPooledTeams).sort().map(([pool, poolTeams]) => (
                      <div key={pool} className="space-y-3">
                        <Badge className="bg-slate-800 text-white uppercase tracking-widest px-3 py-1 text-xs">{pool}</Badge>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2 border-l-2 border-slate-200 ml-2">
                          {poolTeams.map(team => (
                            <div key={team.id} className="p-3 bg-white border rounded-md shadow-sm flex items-center justify-between group">
                              <div><p className="font-bold text-sm text-slate-900">{team.name}</p><p className="text-xs text-slate-500">{team.coach_name || "No Manager"}</p></div>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveFromPool(team.id, team.name)}><UserMinus className="w-4 h-4" /></Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 4: OVERVIEW */}
          <TabsContent value="overview" className="mt-0">
             <Card className="border-2 shadow-sm"><CardHeader className="bg-slate-100/50"><CardTitle className="text-lg">Event Fixtures</CardTitle></CardHeader><CardContent className="space-y-2 pt-6">
               {matches.length === 0 ? <p className="text-slate-500 text-center">No fixtures scheduled.</p> : matches.map(m => <div key={m.id} className="p-3 border rounded flex justify-between bg-white items-center"><span className="w-1/3 text-right font-bold">{m.home_team?.name}</span><Badge className="mx-4">{m.home_score} - {m.away_score}</Badge><span className="w-1/3 font-bold">{m.away_team?.name}</span></div>)}
             </CardContent></Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}