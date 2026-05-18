"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2, Users, UserPlus, ShieldCheck } from "lucide-react"

// Define the shape of our data
type Player = {
  id: string
  full_name: string
  jersey_number: number
  created_at: string
  id_front_url: string
}

export default function TeamRoster() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRoster()
  }, [])

  const fetchRoster = async () => {
    try {
      // Pull players from the database, sorted numerically by jersey number
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('jersey_number', { ascending: true })

      if (error) throw error
      if (data) setPlayers(data)
    } catch (error) {
      console.error("Error fetching roster:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-4xl space-y-6">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Murang’a Rugby</h1>
            <p className="text-slate-500">Official Tournament Roster</p>
          </div>
          <Link href="/team-manager/Register">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Player
            </Button>
          </Link>
        </div>

        {/* Data Table Card */}
        <Card className="border-2 shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <CardTitle>Registered Squad</CardTitle>
            </div>
            <CardDescription>
              Players fully registered with DPA-compliant biometric data.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Loader2 className="w-8 h-8 mb-4 animate-spin text-blue-600" />
                <p>Loading live roster...</p>
              </div>
            ) : players.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Users className="w-12 h-12 mb-4 text-slate-300" />
                <p>No players registered yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-900">
                    <TableHead className="w-[100px] text-center">Jersey</TableHead>
                    <TableHead>Player Name</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead className="text-right">Verification</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.map((player) => (
                    <TableRow key={player.id}>
                      <TableCell className="font-bold text-center text-lg">
                        #{player.jersey_number}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900 dark:text-white">
                        {player.full_name}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {new Date(player.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {player.id_front_url ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            ID Secured
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Missing ID</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}