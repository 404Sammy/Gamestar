"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  LayoutDashboard, Calendar, UserPlus, Users, 
  FileText, AlertTriangle, Settings, Shield, LogOut 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: "unassigned" | "fixtures" | "reports" | "incidents";
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/head-referee/dashboard", icon: LayoutDashboard },
  { name: "Fixtures", href: "/head-referee/fixtures", icon: Calendar, badgeKey: "fixtures" },
  { name: "Assignments", href: "/head-referee/assignments", icon: UserPlus, badgeKey: "unassigned" },
  { name: "Officials", href: "/head-referee/officials", icon: Users },
  { name: "Reports", href: "/head-referee/reports", icon: FileText, badgeKey: "reports" },
  { name: "Incidents", href: "/head-referee/incidents", icon: AlertTriangle, badgeKey: "incidents" },
  { name: "Settings", href: "/head-referee/settings", icon: Settings },
];

export default function HeadRefereeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [tournamentName, setTournamentName] = useState("Murang'a Open 2026");
  const [counts, setCounts] = useState({ unassigned: 0, fixtures: 0, reports: 0, incidents: 0 });

  useEffect(() => {
    async function fetchLayoutContext() {
      // Fetch active tournament settings
      const { data: settings } = await supabase
        .from("tournament_settings")
        .select("value")
        .eq("key", "active_tournament_name")
        .single();
      if (settings?.value) setTournamentName(settings.value);

      // Fetch dynamic badge markers
      const [mRes, aRes, rRes, iRes] = await Promise.all([
        supabase.from("matches").select("id"),
        supabase.from("match_assignments").select("match_id, role"),
        supabase.from("reports").select("id").eq("status", "draft"),
        supabase.from("incidents").select("id").eq("status", "open")
      ]);

      const matches = mRes.data || [];
      const assignments = aRes.data || [];
      const crAssigned = new Set(assignments.filter(a => a.role === "CR").map(a => a.match_id));
      const unassignedCount = matches.filter(m => !crAssigned.has(m.id)).length;

      setCounts({
        fixtures: matches.length,
        unassigned: unassignedCount,
        reports: rRes.data?.length || 0,
        incidents: iRes.data?.length || 0
      });
    }
    fetchLayoutContext();
  }, [pathname]);

  const getBadgeStyle = (key: string) => {
    if (key === "unassigned" || key === "incidents") return "bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded-full text-[10px]";
    return "bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[10px]";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900 selection:bg-amber-100">
      {/* Top Bar Header Layout */}
      <header className="bg-white border-b border-slate-200 h-14 flex items-center justify-between px-4 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center space-x-3">
          <span className="font-extrabold text-lg tracking-tight text-slate-900">
            Game<span className="text-amber-800">star</span>
          </span>
          <span className="text-slate-200">|</span>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            🏆 {tournamentName}
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge className="bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1 text-xs px-2.5 py-1">
            <Shield className="w-3.5 h-3.5 fill-amber-800/10" />
            Head Referee
          </Badge>
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs shadow-inner">
            DK
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Navigation Sidebar Panel */}
        <aside className="w-52 bg-white border-r border-slate-200 p-3 flex flex-col justify-between hidden md:flex">
          <nav className="space-y-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Overview</p>
              {navItems.slice(0, 1).map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link key={item.name} href={item.href} className={`flex items-center space-x-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${isActive ? "bg-amber-50/70 text-amber-900 font-semibold border-l-2 border-amber-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
                    <Icon className={`w-4 h-4 ${isActive ? "text-amber-800" : "text-slate-400"}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Operations</p>
              {navItems.slice(1, 4).map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link key={item.name} href={item.href} className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${isActive ? "bg-amber-50/70 text-amber-900 font-semibold border-l-2 border-amber-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-amber-800" : "text-slate-400"}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badgeKey && counts[item.badgeKey] > 0 && (
                      <span className={getBadgeStyle(item.badgeKey)}>{counts[item.badgeKey]}</span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Reporting</p>
              {navItems.slice(4, 6).map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link key={item.name} href={item.href} className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${isActive ? "bg-amber-50/70 text-amber-900 font-semibold border-l-2 border-amber-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-amber-800" : "text-slate-400"}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badgeKey && counts[item.badgeKey] > 0 && (
                      <span className={getBadgeStyle(item.badgeKey)}>{counts[item.badgeKey]}</span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Account</p>
              {navItems.slice(6).map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link key={item.name} href={item.href} className={`flex items-center space-x-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${isActive ? "bg-amber-50/70 text-amber-900 font-semibold border-l-2 border-amber-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
                    <Icon className={`w-4 h-4 ${isActive ? "text-amber-800" : "text-slate-400"}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <button className="flex items-center space-x-2.5 px-3 py-2 rounded-md text-xs font-medium text-red-700 hover:bg-red-50 transition-colors mt-auto border border-dashed border-transparent hover:border-red-200">
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </aside>

        {/* Content Box Core Area */}
        <main className="flex-1 p-5 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}