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
import { 
  Trophy, 
  Users, 
  FolderKanban, 
  Trash2, 
  ArrowRightLeft, 
  Layers, 
  UserMinus, 
  Globe, 
  Plus, 
  ClipboardList, 
  Check 
} from "lucide-react"

// TypeScript Type Definitions
type Tournament = { id: string, title: string }
type Pool = { id: string, name: string, category: string }
type Team = { id: string, name: string, coach_name: string, pool_name: string, category: string }
type Stage = { id: string, matchday: string, round_name: string, match_date: string }
type Match = { id: string, status: string, home_score: number, away_score: number, home_team: { name: string }, away_team: { name: string } }

interface TeamTask {
  id: number;
  task: string;
  assignedTo: string;
  completed: boolean;
}

// Logistics Initial Mock Data
const initialTasks: TeamTask[] = [
  { id: 1, task: "Bring team match balls (5 x Size 5)", assignedTo: "Coach Caleb", completed: true },
  { id: 2, task: "First Aid Kit & Ice Packs replenishment", assignedTo: "Alex (Captain)", completed: false },
  { id: 3, task: "Fresh water bottles and energy hydration sets", assignedTo: "Mercy (Manager)", completed: false },
  { id: 4, task: "Collect and pack away alternative green training bibs", assignedTo: "John (Kit Coordinator)", completed: true },
];

export default function OrganizerDashboard() {
  // Global Context States
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [activeTournamentId, setActiveTournamentId] = useState<string>("")

  // Data States
  const [pools, setPools] = useState<Pool[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(true)

  // Duty Checklist State
  const [tasks, setTasks] = useState<TeamTask[]>(initialTasks)

  // Form States
  const [newPoolName, setNewPoolName] = useState("")
  const [newPoolCategory, setNewPoolCategory] = useState("")
  const [selectedTeamId, setSelectedTeamId] = useState("")
  const [assignToPool, setAssignToPool] = useState("")
  const [newMatchday, setNewMatchday] = useState("")
  const [newRoundName, setNewRoundName] = useState("")
  const [newMatchDate, setNewMatchDate] = useState("")
  const [newTask, setNewTask] = useState({ task: "", assignedTo: "" })

  // Initial Load
  useEffect(() => {
    fetchGlobalContext()
  }, [])

  // Hook into active tournament changes
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

  const handleSwitchTournament = async (newId: string) => {
    setActiveTournamentId(newId)
    toast.info("Switching context...")
    await supabase.from('admin_context').update({ active_tournament_id: parseInt(newId) }).eq('id', 1)
  }

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

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.task || !newTask.assignedTo) return toast.error("Fill all task details");
    
    setTasks([
      ...tasks,
      {
        id: Date.now(),
        task: newTask.task,
        assignedTo: newTask.assignedTo,
        completed: false
      }
    ]);
    setNewTask({ task: "", assignedTo: "" });
    toast.success("Duty delegated!");
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // Filter Computations
  const menPools = pools.filter(p => p.category === 'Men')
  const womenPools = pools.filter(p => p.category === 'Women')
  
  const unassignedTeams = teams.filter(t => t.pool_name === 'Unassigned' || !t.pool_name)
  const unassignedMen = unassignedTeams.filter(t => t.category === 'Men')
  const unassignedWomen = unassignedTeams.filter(t => t.category === 'Women')

  const pooledTeams = teams.filter(t => t.pool_name && t.pool_name !== 'Unassigned')
  
  const groupedPooledTeams = pooledTeams.reduce<Record<string, Team[]>>((acc, team) => {
    if (!team.pool_name) return acc;
    if (!acc[team.pool_name]) acc[team.pool_name] = [];
    acc[team.pool_name].push(team);
    return acc;
  }, {});

  const selectedTeamCategory = teams.find(t => t.id === selectedTeamId)?.category || 'Men'

  return (
    <div className="flex flex-col items-center min-h-screen p-4 md:p-6 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased">
      <div className="w-full max-w-6xl space-y-6">
        
        {/* Hub Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border shadow-xs">
          <div>
            <h1 className="text-2xl font-bold flex items-center tracking-tight text-slate-900 dark:text-white">
              <Globe className="w-7 h-7 mr-2.5 text-blue-600" />
              Team Organizer & Command Hub
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage infrastructure, pools, match brackets, and matchday tasks.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider hidden sm:inline-block">Active Network:</span>
            <Select value={activeTournamentId} onValueChange={handleSwitchTournament}>
              <SelectTrigger className="w-[200px] h-8 text-xs font-bold border-slate-200 dark:border-slate-800 focus:ring-blue-500">
                <SelectValue placeholder="Select Tournament" />
              </SelectTrigger>
              <SelectContent>
                {tournaments.map(t => (
                  <SelectItem key={t.id} value={t.id.toString()}>{t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge className="bg-blue-600 text-white border-none text-[10px] py-1 px-2.5">Organizer</Badge>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6 bg-slate-200/60 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <TabsTrigger value="overview" className="text-xs py-2"><Trophy className="w-3.5 h-3.5 mr-1.5" /> 1. Fixtures</TabsTrigger>
            <TabsTrigger value="pools" className="text-xs py-2"><FolderKanban className="w-3.5 h-3.5 mr-1.5" /> 2. Pools</TabsTrigger>
            <TabsTrigger value="stages" className="text-xs py-2"><Layers className="w-3.5 h-3.5 mr-1.5" /> 3. Stages</TabsTrigger>
            <TabsTrigger value="assign" className="text-xs py-2"><Users className="w-3.5 h-3.5 mr-1.5" /> 4. Assignments</TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs py-2"><ClipboardList className="w-3.5 h-3.5 mr-1.5" /> 5. Duty List</TabsTrigger>
          </TabsList>

          {/* TAB 1: OVERVIEW FIXTURES */}
          <TabsContent value="overview" className="mt-0 outline-none">
            <Card className="border shadow-xs overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 dark:bg-slate-900/40 dark:border-slate-800/60">
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Active Match Brackets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 pt-5">
                {matches.length === 0 ? (
                  <p className="text-slate-400 text-center py-6 text-xs font-medium">No live fixtures linked to this tournament grid.</p>
                ) : (
                  matches.map(m => (
                    <div key={m.id} className="p-3 border rounded-xl flex justify-between bg-white dark:bg-slate-900 items-center border-slate-200/80 dark:border-slate-800 shadow-2xs">
                      <span className="w-1/3 text-right font-bold text-xs truncate text-slate-900 dark:text-white">{m.home_team?.name}</span>
                      <div className="flex flex-col items-center mx-4 gap-1">
                        <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-mono text-xs px-3 py-0.5 border border-blue-200/50 dark:border-blue-800/40">
                          {m.home_score} - {m.away_score}
                        </Badge>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{m.status}</span>
                      </div>
                      <span className="w-1/3 font-bold text-xs truncate text-slate-900 dark:text-white">{m.away_team?.name}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: POOLS */}
          <TabsContent value="pools" className="mt-0 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Card className="border shadow-xs h-fit">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 dark:bg-slate-900/40 dark:border-slate-800/60">
                  <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">Create Bracket Pool</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pool Designation Name</label>
                    <Input placeholder="e.g., Pool MA" value={newPoolName} onChange={(e) => setNewPoolName(e.target.value)} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gender Category Bracket</label>
                    <Select value={newPoolCategory} onValueChange={setNewPoolCategory}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select division..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Men">Men Division</SelectItem>
                        <SelectItem value="Women">Women Division</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full h-9 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white mt-2" onClick={handleCreatePool} disabled={loading || !activeTournamentId}>
                    Save Pool Division
                  </Button>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 border shadow-xs">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 dark:bg-slate-900/40 dark:border-slate-800/60">
                  <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">Active Pools Layout</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <div className="border border-slate-100 dark:border-slate-800/60 p-3 rounded-xl bg-slate-50/30">
                    <h3 className="font-bold text-xs text-blue-600 border-b pb-1.5 mb-2 flex items-center justify-between">Men Brackets <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{menPools.length}</Badge></h3>
                    {menPools.length === 0 && <p className="text-[11px] text-slate-400 py-2">No active men's groups.</p>}
                    {menPools.map(p => (
                      <div key={p.id} className="flex justify-between items-center text-xs p-2.5 border mb-2 rounded-lg bg-white dark:bg-slate-900 shadow-2xs border-slate-200/60 dark:border-slate-800">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => handleDeletePool(p.id, p.name)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    ))}
                  </div>

                  <div className="border border-slate-100 dark:border-slate-800/60 p-3 rounded-xl bg-slate-50/30">
                    <h3 className="font-bold text-xs text-purple-600 border-b pb-1.5 mb-2 flex items-center justify-between">Women Brackets <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{womenPools.length}</Badge></h3>
                    {womenPools.length === 0 && <p className="text-[11px] text-slate-400 py-2">No active women's groups.</p>}
                    {womenPools.map(p => (
                      <div key={p.id} className="flex justify-between items-center text-xs p-2.5 border mb-2 rounded-lg bg-white dark:bg-slate-900 shadow-2xs border-slate-200/60 dark:border-slate-800">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => handleDeletePool(p.id, p.name)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 3: STAGES */}
          <TabsContent value="stages" className="mt-0 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Card className="border shadow-xs h-fit">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 dark:bg-slate-900/40 dark:border-slate-800/60">
                  <CardTitle className="flex items-center text-sm font-semibold text-slate-900 dark:text-white"><Layers className="w-4 h-4 mr-2 text-indigo-600" /> Initialize Stage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Matchday Name</label>
                    <Input placeholder="e.g., Matchday 1" value={newMatchday} onChange={(e) => setNewMatchday(e.target.value)} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Round Classification</label>
                    <Input placeholder="e.g., Quarter Finals" value={newRoundName} onChange={(e) => setNewRoundName(e.target.value)} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Official Event Date</label>
                    <Input type="date" value={newMatchDate} onChange={(e) => setNewMatchDate(e.target.value)} className="h-9 text-xs" />
                  </div>
                  <Button className="w-full h-9 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white mt-2" onClick={handleCreateStage} disabled={loading || !activeTournamentId}>
                    Lock Stage Calendar
                  </Button>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 border shadow-xs">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 dark:bg-slate-900/40 dark:border-slate-800/60">
                  <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">Tournament Calendar Logs</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-2">
                  {stages.length === 0 ? (
                    <p className="text-slate-400 text-center py-6 text-xs">No active structural brackets set for this event matrix.</p>
                  ) : (
                    stages.map(s => (
                      <div key={s.id} className="flex items-center justify-between p-3 border rounded-xl bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-xs shadow-2xs">
                        <div className="flex items-center space-x-3 truncate">
                          <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 font-medium text-[10px] rounded-md px-2 py-0.5">{s.matchday}</Badge>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{s.round_name}</span>
                          <span className="text-slate-400 font-mono text-[11px] border-l pl-3 hidden sm:inline-block">{s.match_date}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 shrink-0" onClick={() => handleDeleteStage(s.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 4: ASSIGN TEAMS */}
          <TabsContent value="assign" className="mt-0 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Card className="border shadow-xs h-fit">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 dark:bg-slate-900/40 dark:border-slate-800/60">
                  <CardTitle className="flex items-center text-sm font-semibold text-slate-900 dark:text-white"><ArrowRightLeft className="w-4 h-4 mr-2 text-blue-600" /> Bracket Placement</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 pt-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">1. Select Unplaced Team</label>
                    <Select value={selectedTeamId} onValueChange={(val) => { setSelectedTeamId(val); setAssignToPool(""); }}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Choose pending squad..." /></SelectTrigger>
                      <SelectContent>
                        {unassignedTeams.length === 0 && <SelectItem value="none" disabled>No pending teams in this system</SelectItem>}
                        {unassignedMen.length > 0 && (
                          <SelectGroup>
                            <SelectLabel className="text-blue-500 font-bold text-[10px]">Men's Division</SelectLabel>
                            {unassignedMen.map(t => <SelectItem key={t.id} value={t.id} className="text-xs">{t.name}</SelectItem>)}
                          </SelectGroup>
                        )}
                        {unassignedWomen.length > 0 && (
                          <SelectGroup>
                            <SelectLabel className="text-purple-500 font-bold text-[10px] mt-1">Women's Division</SelectLabel>
                            {unassignedWomen.map(t => <SelectItem key={t.id} value={t.id} className="text-xs">{t.name}</SelectItem>)}
                          </SelectGroup>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">2. Target Destination Pool</label>
                    <Select value={assignToPool} onValueChange={setAssignToPool} disabled={!selectedTeamId}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select target pool allocation..." /></SelectTrigger>
                      <SelectContent>
                        {selectedTeamCategory === 'Men' && menPools.map(p => <SelectItem key={p.id} value={p.name} className="text-xs">{p.name}</SelectItem>)}
                        {selectedTeamCategory === 'Women' && womenPools.map(p => <SelectItem key={p.id} value={p.name} className="text-xs">{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full h-9 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white mt-2" onClick={handleAssignTeam} disabled={loading || !selectedTeamId || !assignToPool}>
                    Lock in Assignment Group
                  </Button>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 border shadow-xs">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 dark:bg-slate-900/40 dark:border-slate-800/60">
                  <CardTitle className="flex items-center text-sm font-semibold text-slate-900 dark:text-white"><Users className="w-4 h-4 mr-2 text-blue-600" /> Operational Assignments</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4 max-h-[500px] overflow-y-auto">
                  {Object.keys(groupedPooledTeams).length === 0 ? (
                    <p className="text-center text-slate-400 py-6 text-xs font-medium">No system teams assigned to bracket matrix pools yet.</p>
                  ) : (
                    Object.entries(groupedPooledTeams).sort().map(([pool, poolTeams]) => (
                      <div key={pool} className="space-y-2">
                        <Badge className="bg-slate-800 text-white dark:bg-slate-800 dark:text-slate-100 uppercase tracking-wider px-2 py-0.5 text-[9px] font-bold rounded">{pool}</Badge>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2 border-l-2 border-slate-200 dark:border-slate-800 ml-1">
                          {poolTeams.map(team => (
                            <div key={team.id} className="p-2.5 bg-white border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 rounded-lg shadow-2xs flex items-center justify-between group">
                              <div className="truncate pr-2">
                                <p className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">{team.name}</p>
                                <p className="text-[10px] text-slate-400 truncate">{team.coach_name || "Unassigned Head Coach"}</p>
                              </div>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveFromPool(team.id, team.name)}><UserMinus className="w-3.5 h-3.5" /></Button>
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

          {/* TAB 5: DUTY CHECKLIST */}
          <TabsContent value="tasks" className="mt-0 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Card className="border shadow-xs h-fit">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 dark:bg-slate-900/40 dark:border-slate-800/60">
                  <CardTitle className="flex items-center text-sm font-semibold text-slate-900 dark:text-white"><Plus className="w-4 h-4 mr-1.5 text-blue-600" /> Delegate Duty</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <form onSubmit={handleAddTask} className="space-y-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Logistics Duty Description</label>
                      <Input 
                        placeholder="What needs to be packed/brought?" 
                        value={newTask.task}
                        onChange={e => setNewTask({...newTask, task: e.target.value})}
                        className="h-9 text-xs"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Responsible Staff / Player</label>
                      <Input 
                        placeholder="e.g., Captain, Kit Coordinator" 
                        value={newTask.assignedTo}
                        onChange={e => setNewTask({...newTask, assignedTo: e.target.value})}
                        className="h-9 text-xs"
                      />
                    </div>

                    <Button type="submit" className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-md shadow-xs transition-colors mt-2">
                      Assign Matchday Task
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 border shadow-xs">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 dark:bg-slate-900/40 dark:border-slate-800/60">
                  <CardTitle className="flex items-center text-sm font-semibold text-slate-900 dark:text-white"><ClipboardList className="w-4 h-4 mr-1.5 text-blue-600" /> Matchday Duty Logistics</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                    {tasks.map((t) => (
                      <div key={t.id} className="flex items-center justify-between p-3.5 hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                        <div className="flex items-start gap-3 min-w-0">
                          <button 
                            type="button"
                            onClick={() => toggleTask(t.id)}
                            className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                              t.completed 
                                ? "bg-blue-600 border-blue-600 text-white" 
                                : "border-slate-300 bg-white dark:bg-slate-950 hover:border-slate-400"
                            }`}
                          >
                            {t.completed && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                          <div className="truncate pr-2">
                            <p className={`font-medium text-xs ${t.completed ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-800 dark:text-slate-200"}`}>{t.task}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Assigned: <span className="text-slate-600 dark:text-slate-300 font-medium">{t.assignedTo}</span></p>
                          </div>
                        </div>
                        <span className={`inline-flex font-semibold text-[9px] px-2 py-0.5 rounded-sm shrink-0 uppercase tracking-wide border ${
                          t.completed ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30" : "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30"
                        }`}>
                          {t.completed ? "Ready" : "Pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  )
}