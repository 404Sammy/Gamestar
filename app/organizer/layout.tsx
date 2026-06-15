"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Trophy, 
  Layers, 
  GitMerge, 
  Calendar, 
  Activity, 
  Settings, 
  LayoutDashboard, 
  LogOut, 
  ChevronDown, 
  Radio, 
  UserCheck,
  BarChart4
} from "lucide-react";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeType?: "green" | "amber";
  getBadgeValue?: (badges: BadgeCounts) => number;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

interface BadgeCounts {
  pools: number;
  unassignedTeams: number;
}

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [tournamentName, setTournamentName] = useState<string>("Loading...");
  const [badgeCounts, setBadgeCounts] = useState<BadgeCounts>({ pools: 0, unassignedTeams: 0 });

  const navigationConfig: NavigationSection[] = [
    {
      title: "Command",
      items: [
        { name: "Dashboard", href: "/organizer/dashboard", icon: LayoutDashboard },
        { name: "My tournaments", href: "/organizer/tournament", icon: Trophy },
      ],
    },
    {
      title: "Setup",
      items: [
        { 
          name: "Pools", 
          href: "/organizer/pools", 
          icon: Layers, 
          badgeType: "green", 
          getBadgeValue: (b) => b.pools 
        },
        { name: "Stages", href: "/organizer/stages", icon: Calendar },
        { 
          name: "Assign teams", 
          href: "/organizer/assign", 
          icon: GitMerge, 
          badgeType: "amber", 
          getBadgeValue: (b) => b.unassignedTeams 
        },
      ],
    },
    {
      title: "Operations",
      items: [
        { name: "Match overview", href: "/organizer/overview", icon: Activity },
        { name: "Referees", href: "/organizer/referees", icon: UserCheck },
        { name: "Standings", href: "/organizer/standings", icon: BarChart4 },
      ],
    },
    {
      title: "Account",
      items: [
        { name: "Settings", href: "/organizer/settings", icon: Settings },
      ],
    },
  ];

  const allNavItems = navigationConfig.flatMap((section) => section.items);
  const activeItem = allNavItems.find((item) => pathname === item.href) || {
    name: "Organizer Workspace",
    icon: LayoutDashboard,
  };
  const ActiveIcon = activeItem.icon;

  useEffect(() => {
    async function fetchLayoutContext() {
      try {
        // 1. Fetch current active context parameters using .maybeSingle() to safeguard against empty tables
        const { data: contextData, error: contextError } = await supabase
          .from("admin_context")
          .select("active_tournament_id")
          .eq("id", 1)
          .maybeSingle();

        if (contextError) {
          console.error("Supabase context reading error:", contextError.message);
          setTournamentName("Console Workspace");
          return;
        }

        // 2. Resolve the matching tournament string from reference ID
        if (contextData?.active_tournament_id) {
          const { data: tournamentData, error: tournamentError } = await supabase
            .from("tournaments")
            .select("name")
            .eq("id", contextData.active_tournament_id)
            .maybeSingle();

          if (tournamentError) {
            console.error("Supabase tournament resolution error:", tournamentError.message);
          }
          
          setTournamentName(tournamentData?.name || "Standalone Grid Mode");
        } else {
          setTournamentName("No Active Tournament");
        }
      } catch (err: any) {
        console.error("Error standardizing application runtime layout variables:", err?.message || err);
        setTournamentName("Error loading context");
      }
    }

    fetchLayoutContext();
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Upper Navigation Control Header */}
      <header className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold tracking-tight text-slate-900">
            Game<span className="text-[#534AB7]">star</span>
          </div>
          <div className="h-4 w-[1px] bg-slate-200" />
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <ActiveIcon className="h-3.5 w-3.5 text-[#534AB7]" />
            <span>{activeItem.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#EEEDFE] border border-[#534AB7]/20 rounded-md text-[11px] font-medium text-[#3C3489] cursor-pointer">
            <Radio className="h-3 w-3 text-[#534AB7] animate-pulse" />
            <span>{tournamentName}</span>
            <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
          </div>

          <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded bg-[#EEEDFE] text-[#3C3489] border border-[#534AB7]/10">
            Organizer
          </span>

          <div className="h-7 w-7 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-[11px] font-semibold text-indigo-700 shadow-sm">
            JO
          </div>
        </div>
      </header>

      {/* Main Structural Framework Layout Body */}
      <div className="flex flex-1 min-h-0">
        {/* Left Side App Workspace Navigation Panel */}
        <aside className="w-[178px] border-r border-slate-200 bg-white flex flex-col shrink-0 select-none">
          <div className="flex-1 py-3 overflow-y-auto space-y-4">
            {navigationConfig.map((section) => (
              <div key={section.title} className="space-y-0.5">
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 px-3.5 py-1">
                  {section.title}
                </div>
                <nav className="space-y-[1px]">
                  {section.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive = pathname === item.href;
                    const hasBadge = item.getBadgeValue && item.getBadgeValue(badgeCounts) > 0;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2 px-3.5 py-1.5 text-[11.5px] font-medium border-l-2 transition-all ${
                          isActive
                            ? "bg-[#EEEDFE] border-l-[#534AB7] text-[#3C3489]"
                            : "border-l-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <ItemIcon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#534AB7]" : "text-slate-400"}`} />
                        <span className="truncate">{item.name}</span>
                        
                        {hasBadge && item.badgeType === "green" && (
                          <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#EAF3DE] text-[#27500A]">
                            {item.getBadgeValue!(badgeCounts)}
                          </span>
                        )}

                        {hasBadge && item.badgeType === "amber" && (
                          <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#FAEEDA] text-[#633806]">
                            {item.getBadgeValue!(badgeCounts)}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* Action Footer Button Group Container */}
          <div className="p-2 border-t border-slate-100 mt-auto">
            <button className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11.5px] font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors text-left">
              <LogOut className="h-4 w-4 shrink-0 text-red-500" />
              <span>Sign out</span>
            </button>
          </div>
        </aside>

        {/* Dynamic Display Rendering Port Viewport */}
        <main className="flex-1 overflow-y-auto p-[18px] bg-[#F8FAFC]">
          {children}
        </main>
      </div>
    </div>
  );
}