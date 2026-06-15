"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Trophy, 
  Plus, 
  Trash2, 
  RefreshCw, 
  AlertCircle 
} from "lucide-react";

interface Tournament {
  id: number;
  name: string;
  status: string;
}

export default function TournamentListPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newName, setNewName] = useState<string>("");
  const [isCreating, setIsCreating] = useState<boolean>(false);

  async function fetchTournamentsData() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
    } catch (err: any) {
      // Improved error logging: now captures the real error string
      console.error("Tournament fetch exception:", err?.message || err);
      toast.error(`Sync error: ${err.message || "Unknown database error"}`);
    } finally {
      setLoading(false);
    }
  }

  async function createTournament(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setIsCreating(true);
      const { error } = await supabase
        .from("tournaments")
        .insert([{ name: newName, status: "Upcoming" }]);

      if (error) throw error;

      toast.success("Tournament initialized.");
      setNewName("");
      fetchTournamentsData();
    } catch (err: any) {
      console.error("Creation failure:", err?.message || err);
      toast.error("Failed to create tournament.");
    } finally {
      setIsCreating(false);
    }
  }

  async function deleteTournament(id: number) {
    try {
      const { error } = await supabase
        .from("tournaments")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Tournament removed.");
      fetchTournamentsData();
    } catch (err: any) {
      console.error("Deletion failure:", err?.message || err);
      toast.error("Failed to remove tournament.");
    }
  }

  useEffect(() => {
    fetchTournamentsData();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-lg font-bold tracking-tight text-slate-900">Tournament Registry</h1>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">Manage your tournament deployment lifecycle.</p>
      </div>

      {/* Creation Form */}
      <Card className="bg-slate-50/50 border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <form onSubmit={createTournament} className="flex gap-2">
            <Input 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new tournament name..."
              className="h-8 text-xs bg-white border-slate-200"
            />
            <Button 
              type="submit" 
              disabled={isCreating}
              className="h-8 text-xs font-bold bg-[#534AB7] hover:bg-[#3C3489]"
            >
              {isCreating ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Listings */}
      {loading ? (
        <div className="text-center p-8 text-xs text-slate-400">Loading registry...</div>
      ) : tournaments.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-lg text-xs font-medium text-slate-400 flex flex-col items-center gap-2">
          <AlertCircle className="h-6 w-6 text-slate-300" />
          <span>No tournament lines initialized. Create your first one above.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tournaments.map((t) => (
            <Card key={t.id} className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-[#534AB7] rounded-lg">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{t.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{t.status}</div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => deleteTournament(t.id)}
                  className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}