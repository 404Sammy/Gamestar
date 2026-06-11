"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Edit2 } from "lucide-react";

export default function HeadRefereeOfficials() {
  const [officials, setOfficials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Field Processing Parameters States Block Configuration mappings
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [certLevel, setCertLevel] = useState("Level 1");
  const [eligibility, setEligibility] = useState("CR+AR");

  const loadOfficialsRoster = async () => {
    setLoading(true);
    const { data } = await supabase.from("referees").select("*").order("full_name", { ascending: true });
    setOfficials(data || []);
    setLoading(false);
  };

  useEffect(() => { loadOfficialsRoster(); }, []);

  const resetFormState = () => {
    setEditingId(null);
    setFullName("");
    setEmail("");
    setPhone("");
    setCertLevel("Level 1");
    setEligibility("CR+AR");
  };

  const openEditDialog = (o: any) => {
    setEditingId(o.id);
    setFullName(o.full_name);
    setEmail(o.email);
    setPhone(o.phone || "");
    setCertLevel(o.certification_level);
    setEligibility(o.role_eligibility);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        full_name: fullName,
        email,
        phone,
        certification_level: certLevel,
        role_eligibility: eligibility
      };

      if (editingId) {
        const { error } = await supabase.from("referees").update(payload).eq("id", editingId);
        if (error) throw error;
        toast.success("Official profile data sheet updated safely.");
      } else {
        const { error } = await supabase.from("referees").insert([payload]);
        if (error) throw error;
        toast.success("New tournament official registered successfully.");
      }

      setIsModalOpen(false);
      resetFormState();
      loadOfficialsRoster();
    } catch (err: any) {
      toast.error(err.message || "An error occurred writing down row entries mapping parameters.");
    }
  };

  if (loading) return <div className="text-xs text-slate-400 text-center py-24 animate-pulse">Loading officials profile data sheets...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-base font-semibold text-slate-900">Officials Roster Registry</h1>
          <p className="text-slate-500 text-xs mt-0.5">Manage credentials, roles, and status listings</p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={(o) => { setIsModalOpen(o); if(!o) resetFormState(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-amber-800 hover:bg-amber-900 text-amber-50 h-8 text-xs gap-1">
              <Plus className="w-3.5 h-3.5" /> Add official
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white border border-slate-200 shadow-xl rounded-lg p-5">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-2">
                {editingId ? "Edit Credentials Roster Profile" : "Register New Tournament Official Entry"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleFormSubmit} className="space-y-3.5 pt-2">
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-slate-500">Full Name</Label>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} required className="h-8 text-xs border-slate-200" />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-slate-500">Email Address</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="h-8 text-xs border-slate-200" />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-slate-500">Phone Contact</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} className="h-8 text-xs border-slate-200" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-slate-500">Certification Grade</Label>
                  <Select value={certLevel} onValueChange={setCertLevel}>
                    <SelectTrigger className="h-8 text-xs border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Level 1" className="text-xs">Level 1 (Regional)</SelectItem>
                      <SelectItem value="Level 2" className="text-xs">Level 2 (National)</SelectItem>
                      <SelectItem value="Level 3" className="text-xs">Level 3 (International/FIFA)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-slate-500">Role Eligibility Map</Label>
                  <Select value={eligibility} onValueChange={setEligibility}>
                    <SelectTrigger className="h-8 text-xs border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CR+AR" className="text-xs">CR + AR Eligible</SelectItem>
                      <SelectItem value="AR only" className="text-xs">AR Only Specialist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="h-8 text-xs px-3">Cancel</Button>
                <Button type="submit" className="bg-amber-800 hover:bg-amber-900 text-amber-50 h-8 text-xs px-4">Confirm Write</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Roster Information Data Table Components Shell Frame Mapping Layout */}
      <div className="border border-slate-200 rounded-md bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/70 border-b border-slate-200">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider h-9">Official Info</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider h-9">Grade</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider h-9">Eligibility</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider h-9">Contact Phone</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider h-9 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100">
            {officials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-xs text-slate-400 py-12">No officials currently listed within the tournament registry database.</TableCell>
              </TableRow>
            ) : (
              officials.map((o) => (
                <TableRow key={o.id} className="hover:bg-slate-50/40 transition-colors">
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-100 border text-slate-700 flex items-center justify-center font-bold text-[10px]">
                        {o.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{o.full_name}</p>
                        <p className="text-[10px] text-slate-400">{o.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5 text-xs text-slate-600 font-medium">{o.certification_level}</TableCell>
                  <TableCell className="py-2.5">
                    <Badge variant="secondary" className="bg-slate-100 border-transparent text-slate-700 font-medium text-[10px] rounded-sm px-1.5 py-0">
                      {o.role_eligibility}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2.5 text-xs font-mono text-slate-500">{o.phone || "---"}</TableCell>
                  <TableCell className="py-2.5 text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(o)} className="w-7 h-7 hover:bg-slate-100 border border-transparent hover:border-slate-200">
                      <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}