"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function TeamManagerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [gateStatus, setGateStatus] = useState<"loading" | "needs_tournament" | "needs_registration" | "complete">("loading");
  const [selectedTournamentName, setSelectedTournamentName] = useState<string>("");
  const [managerInitials, setManagerInitials] = useState<string>("BM");

  const checkGateStatus = useCallback(async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        const mockProgress = localStorage.getItem("mock_gate_progress");
        const mockRegComplete = localStorage.getItem("mock_registration_complete") === "true";
        
        if (mockRegComplete) {
          setGateStatus("complete");
          setSelectedTournamentName(localStorage.getItem("selected_tournament_name") || "Active Tournament");
        } else if (mockProgress === "needs_registration") {
          setGateStatus("needs_registration");
          setSelectedTournamentName(localStorage.getItem("selected_tournament_name") || "Active Tournament");
        } else {
          setGateStatus("needs_tournament");
        }
        return;
      }

      if (user.email) setManagerInitials(user.email.substring(0, 2).toUpperCase());

      const { data: team, error: teamError } = await supabase
        .from("teams")
        .select("id, tournament_id, team_registration_complete")
        .eq("team_manager_user_id", user.id)
        .maybeSingle();

      if (teamError) throw teamError;

      if (!team || !team.tournament_id) {
        setGateStatus("needs_tournament");
      } else if (!team.team_registration_complete) {
        setGateStatus("needs_registration");
        fetchTournamentContext(team.tournament_id);
      } else {
        setGateStatus("complete");
        fetchTournamentContext(team.tournament_id);
      }
    } catch (err) {
      console.error("Gating framework processing exception:", err);
      setGateStatus("needs_tournament");
    }
  }, []);

  async function fetchTournamentContext(id: string) {
    const { data } = await supabase.from("teams").select("pool").eq("id", id).maybeSingle(); 
    if (data && data.pool) setSelectedTournamentName(data.pool);
  }

  useEffect(() => {
    checkGateStatus();
  }, [checkGateStatus]);

  // Safer Routing Logic
  useEffect(() => {
    if (gateStatus === "loading") return;

    if (gateStatus === "needs_tournament" && pathname !== "/team-manager/select-tournament") {
      router.push("/team-manager/select-tournament");
    } else if (gateStatus === "needs_registration" && pathname !== "/team-manager/team-registration") {
      router.push("/team-manager/team-registration");
    }
  }, [gateStatus, pathname, router]);

  if (gateStatus === "loading") {
    return (
      <div
        suppressHydrationWarning
        className="flex h-screen w-full items-center justify-center bg-neutral-50"
      >
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mx-auto"></div>
          <p className="mt-3 text-xs text-gray-500 font-medium">Verifying team status...</p>
        </div>
      </div>
    );
  }

  const isGated = gateStatus !== "complete";

  // Sidebar Menu Schema broken into visual group contexts
  const navigationGroups = [
    {
      title: "Main Operations",
      items: [
        { label: "Dashboard", path: "/team-manager/dashboard", icon: "📊" },
        { label: "Squad Roster", path: "/team-manager/roster", icon: "👥" },
        { label: "Register Player", path: "/team-manager/register", icon: "➕" },
      ]
    },
    {
      title: "Tournament",
      items: [
        { label: "Fixtures", path: "/team-manager/fixtures", icon: "🗓️" },
        { label: "Stats", path: "/team-manager/stats", icon: "📈" },
      ]
    },
    {
      title: "Account",
      items: [
        { label: "Settings", path: "/team-manager/settings", icon: "⚙️" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800 m-2 rounded-xl overflow-hidden border border-neutral-200">
      <header className="bg-neutral-100 border-b border-neutral-200 px-4 py-2.5 flex items-center justify-between">
        <div className="text-sm font-medium">Game<span className="text-emerald-700 font-bold">star</span></div>
        <div className="flex items-center gap-3">
          {gateStatus === "complete" && (
            <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              🏆 {selectedTournamentName}
            </span>
          )}
          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-semibold text-emerald-800">
            {managerInitials}
          </div>
        </div>
      </header>

      <div className="flex min-h-[580px]">
        {/* Navigation Sidebar Drawer Panel */}
        <aside className="w-48 bg-white border-r border-neutral-200 p-2 flex flex-col gap-4">
          {navigationGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="flex flex-col gap-0.5">
              <div className="text-[10px] text-neutral-400 px-3 py-1 font-bold tracking-wider uppercase">
                {group.title}
              </div>
              
              {group.items.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-md transition-colors ${
                      isGated 
                        ? "opacity-30 pointer-events-none" 
                        : "hover:bg-neutral-50"
                    } ${
                      isActive 
                        ? "bg-emerald-50 text-emerald-800 font-medium" 
                        : "text-neutral-600"
                    }`}
                  >
                    <span className="flex-shrink-0 w-4 text-center">
                      {isGated ? "🔒" : item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </aside>
        
        {/* Core Render Surface */}
        <main className="flex-1 p-5 bg-neutral-100/50 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}