"use client";

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Trophy, 
  Calendar, 
  BarChart3, 
  Settings, 
  LogOut, 
  Radio, 
  AlertTriangle, 
  Clock, 
  Zap, 
  AlertCircle, 
  Activity, 
  ShieldCheck, 
  X, 
  Download, 
  Search, 
  ChevronDown, 
  Edit2, 
  Upload, 
  IdCard, 
  Camera, 
  Shield, 
  CheckCircle2, 
  ClipboardCheck, 
  Check, 
  Flag,
  ArrowLeft
} from 'lucide-react';

type TabType = 'dashboard' | 'roster' | 'register' | 'tourney' | 'fixtures' | 'stats' | 'settings';

export default function TeamManagerLayout() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [consentChecked, setConsentChecked] = useState(false);

  // Helper to change tab and update visual indicators
  const nav = (tab: TabType) => {
    setActiveTab(tab);
  };

  // Get breadcrumb title text based on tab state
  const getBreadcrumbText = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'roster': return 'Squad roster';
      case 'register': return 'Register player';
      case 'tourney': return 'Tournament registration';
      case 'fixtures': return 'Fixtures';
      case 'stats': return 'Stats';
      case 'settings': return 'Settings';
      default: return 'Hub';
    }
  };

  return (
  <div className="min-h-screen bg-white text-slate-800 font-sans antialiased flex flex-col">
    <div className="w-full flex-1 flex flex-col text-xs">

        {/* TOPBAR */}
        <div className="bg-slate-50 border-bottom border-slate-200 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-slate-900 tracking-tight">
              Game<span className="text-blue-600">star</span>
            </div>
            <div className="text-[11px] text-slate-400 pl-2.5 border-l border-slate-200 flex items-center gap-1">
              <LayoutDashboard className="w-3 h-3 text-slate-400" /> {getBreadcrumbText()}
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1 font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/50 rounded-full px-2 py-0.5 text-[10px]">
              <Radio className="w-3 h-3 animate-pulse text-emerald-600" /> Murang'a Open 2026
            </span>
            <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[10px] font-semibold text-emerald-800">
              BM
            </div>
          </div>
        </div>

        {/* WORKSPACE BODY */}
<div className="flex flex-1 flex-col md:flex-row">
          
          {/* SIDEBAR NAVIGATION */}
          <div className="w-full md:w-44 bg-white border-r border-slate-200/80 py-3 flex flex-col justify-between shrink-0">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-3.5 mb-1">Main</div>
              <nav className="space-y-0.5">
                <button 
                  onClick={() => nav('dashboard')}
                  className={`w-full flex items-center gap-2 px-3.5 py-1.5 text-left text-xs transition-colors border-l-2 cursor-pointer ${activeTab === 'dashboard' ? 'bg-blue-50/70 text-blue-800 border-blue-600 font-medium' : 'text-slate-600 border-transparent hover:bg-slate-50'}`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                </button>
                <button 
                  onClick={() => nav('roster')}
                  className={`w-full flex items-center gap-2 px-3.5 py-1.5 text-left text-xs transition-colors border-l-2 cursor-pointer ${activeTab === 'roster' ? 'bg-blue-50/70 text-blue-800 border-blue-600 font-medium' : 'text-slate-600 border-transparent hover:bg-slate-50'}`}
                >
                  <Users className="w-3.5 h-3.5" /> Squad roster
                  <span className="ml-auto bg-red-50 text-red-700 font-semibold px-1.5 py-0.5 rounded-full text-[9px] border border-red-100">2</span>
                </button>
                <button 
                  onClick={() => nav('register')}
                  className={`w-full flex items-center gap-2 px-3.5 py-1.5 text-left text-xs transition-colors border-l-2 cursor-pointer ${activeTab === 'register' ? 'bg-blue-50/70 text-blue-800 border-blue-600 font-medium' : 'text-slate-600 border-transparent hover:bg-slate-50'}`}
                >
                  <UserPlus className="w-3.5 h-3.5" /> Register player
                </button>
              </nav>

              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-3.5 mt-4 mb-1">Tournament</div>
              <nav className="space-y-0.5">
                <button 
                  onClick={() => nav('tourney')}
                  className={`w-full flex items-center gap-2 px-3.5 py-1.5 text-left text-xs transition-colors border-l-2 cursor-pointer ${activeTab === 'tourney' ? 'bg-blue-50/70 text-blue-800 border-blue-600 font-medium' : 'text-slate-600 border-transparent hover:bg-slate-50'}`}
                >
                  <Trophy className="w-3.5 h-3.5" /> Registration
                  <span className="ml-auto bg-emerald-50 text-emerald-800 font-semibold px-1.5 py-0.5 rounded-full text-[9px] border border-emerald-100">3/3</span>
                </button>
                <button 
                  onClick={() => nav('fixtures')}
                  className={`w-full flex items-center gap-2 px-3.5 py-1.5 text-left text-xs transition-colors border-l-2 cursor-pointer ${activeTab === 'fixtures' ? 'bg-blue-50/70 text-blue-800 border-blue-600 font-medium' : 'text-slate-600 border-transparent hover:bg-slate-50'}`}
                >
                  <Calendar className="w-3.5 h-3.5" /> Fixtures
                </button>
                <button 
                  onClick={() => nav('stats')}
                  className={`w-full flex items-center gap-2 px-3.5 py-1.5 text-left text-xs transition-colors border-l-2 cursor-pointer ${activeTab === 'stats' ? 'bg-blue-50/70 text-blue-800 border-blue-600 font-medium' : 'text-slate-600 border-transparent hover:bg-slate-50'}`}
                >
                  <BarChart3 className="w-3.5 h-3.5" /> Stats
                </button>
              </nav>

              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-3.5 mt-4 mb-1">Account</div>
              <nav className="space-y-0.5">
                <button 
                  onClick={() => nav('settings')}
                  className={`w-full flex items-center gap-2 px-3.5 py-1.5 text-left text-xs transition-colors border-l-2 cursor-pointer ${activeTab === 'settings' ? 'bg-blue-50/70 text-blue-800 border-blue-600 font-medium' : 'text-slate-600 border-transparent hover:bg-slate-50'}`}
                >
                  <Settings className="w-3.5 h-3.5" /> Settings
                </button>
              </nav>
            </div>

            <div className="mt-4 pt-2 border-t border-slate-100">
              <button className="w-full flex items-center gap-2 px-3.5 py-1.5 text-left text-xs text-red-700 font-medium hover:bg-red-50 transition-colors cursor-pointer">
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </div>
          </div>

          {/* MAIN CONTAINER VIEWS */}
          <div className="flex-1 p-5 min-w-0 bg-slate-50/50">
            
            {/* VIEW 1: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Welcome back, Brian</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">Murang'a RFC · Pool MA · Men's</p>
                  </div>
                  <button onClick={() => nav('register')} className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium px-2.5 py-1.5 rounded-md shadow-xs transition-colors cursor-pointer">
                    <UserPlus className="w-3 h-3" /> Register player
                  </button>
                </div>

                {/* Warnings banner */}
                <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3 py-2 rounded-lg text-[11px] flex items-start gap-2 shadow-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>2 players flagged by data team.</strong> James Kariuki (#14) has a missing ID back photo. Peter Njoroge (#1) has a duplicate ID number. Fix these to unlock the green flag.
                  </div>
                </div>

                {/* Stats Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
                    <div className="text-[10px] font-medium text-slate-400">Players registered</div>
                    <div className="text-lg font-semibold text-slate-900 mt-0.5">18</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">of 25 max</div>
                    <div className="w-full h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: '72%' }}></div>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
                    <div className="text-[10px] font-medium text-slate-400">ID verified</div>
                    <div className="text-lg font-semibold text-emerald-800 mt-0.5">16</div>
                    <div className="text-[10px] text-red-600 font-medium mt-0.5">2 need attention</div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
                    <div className="text-[10px] font-medium text-slate-400">Pool status</div>
                    <div className="mt-1">
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 font-medium px-2 py-0.5 rounded-full text-[10px] border border-amber-200/50">
                        <Clock className="w-3 h-3" /> Pending flag
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Data team reviewing</div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
                    <div className="text-[10px] font-medium text-slate-400">Next fixture</div>
                    <div className="text-xs font-semibold text-slate-900 mt-1">vs Nakuru RFC</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">28 Jun · 09:00</div>
                  </div>
                </div>

                {/* Sub Cards Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {/* Quick Actions List */}
                  <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
                    <h3 className="text-xs font-semibold text-slate-900 mb-3 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-blue-600" /> Quick actions
                    </h3>
                    <div className="space-y-2">
                      <div onClick={() => nav('register')} className="border border-slate-200/70 hover:border-slate-300 hover:bg-slate-50 p-2 rounded-lg flex items-center gap-3 transition-colors cursor-pointer group">
                        <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                          <UserPlus className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-xs">Register a player</div>
                          <div className="text-[10px] text-slate-400">Add new squad member</div>
                        </div>
                      </div>
                      <div onClick={() => nav('roster')} className="border border-slate-200/70 hover:border-slate-300 hover:bg-slate-50 p-2 rounded-lg flex items-center gap-3 transition-colors cursor-pointer group">
                        <div className="w-7 h-7 rounded-md bg-red-50 text-red-700 flex items-center justify-center shrink-0">
                          <AlertCircle className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-xs">Fix flagged players</div>
                          <div className="text-[10px] text-slate-400">2 players need action</div>
                        </div>
                      </div>
                      <div onClick={() => nav('fixtures')} className="border border-slate-200/70 hover:border-slate-300 hover:bg-slate-50 p-2 rounded-lg flex items-center gap-3 transition-colors cursor-pointer group">
                        <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                          <Calendar className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-xs">View fixtures</div>
                          <div className="text-[10px] text-slate-400">3 matches scheduled</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Validation Status Dashboard Summary */}
                  <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
                    <h3 className="text-xs font-semibold text-slate-900 mb-3 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-blue-600" /> Validation status
                    </h3>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">Brian Mwangi #7</span>
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-md"><ShieldCheck className="w-3 h-3" /> Verified</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">Kevin Gitau #10</span>
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-md"><ShieldCheck className="w-3 h-3" /> Verified</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">James Kariuki #14</span>
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-red-800 bg-red-50 px-1.5 py-0.5 rounded-md"><X className="w-3 h-3" /> Missing ID back</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">Peter Njoroge #1</span>
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-red-800 bg-red-50 px-1.5 py-0.5 rounded-md"><X className="w-3 h-3" /> Duplicate ID</span>
                      </div>
                      <hr className="border-slate-100 my-1" />
                      <div className="text-[10px] text-slate-400">+14 more players verified</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: ROSTER VIEW */}
            {activeTab === 'roster' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Squad roster</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">Murang'a RFC · 18 players registered</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="inline-flex items-center gap-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-2.5 py-1.5 rounded-md shadow-xs transition-colors cursor-pointer">
                      <Download className="w-3 h-3" /> Export
                    </button>
                    <button onClick={() => nav('register')} className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium px-2.5 py-1.5 rounded-md shadow-xs transition-colors cursor-pointer">
                      <UserPlus className="w-3 h-3" /> Add player
                    </button>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3 py-2 rounded-lg text-[11px] flex items-start gap-2 shadow-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>2 players need attention</strong> before the data team can issue a green flag. Upload missing documents or correct ID conflicts below.
                  </div>
                </div>

                {/* Table card list wrapper */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <div className="p-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 border border-slate-200 rounded-md bg-slate-50 px-2.5 py-1 w-full max-w-[200px]">
                      <Search className="w-3.5 h-3.5 text-slate-400" />
                      <input type="text" placeholder="Search players…" className="w-full bg-transparent border-none outline-none text-xs placeholder-slate-400" disabled />
                    </div>
                    <div className="flex gap-1.5">
                      <span className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium px-2 py-0.5 rounded-md cursor-pointer text-[10px]">All <ChevronDown className="w-2.5 h-2.5" /></span>
                      <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-100 font-medium px-2 py-0.5 rounded-md cursor-pointer text-[10px]">Flagged (2)</span>
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-100 font-medium px-2 py-0.5 rounded-md cursor-pointer text-[10px]">Verified (16)</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left min-w-[500px]">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                          <th className="p-3 w-12">#</th>
                          <th className="p-3">Player</th>
                          <th className="p-3 w-24">Position</th>
                          <th className="p-3 w-20">Added</th>
                          <th className="p-3 w-36">ID status</th>
                          <th className="p-3 w-24 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        <tr className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3"><span className="inline-flex items-center justify-center w-6 h-6 bg-slate-50 border border-slate-200 text-[11px] font-mono font-bold rounded-md">7</span></td>
                          <td className="p-3 flex items-center gap-2.5">
                            <div className="w-6 h-6 bg-blue-50 text-blue-800 font-semibold rounded-full flex items-center justify-center text-[9px]">BM</div>
                            <div>
                              <div className="font-semibold text-slate-800">Brian Mwangi</div>
                              <div className="text-[10px] text-slate-400">Winger</div>
                            </div>
                          </td>
                          <td className="p-3"><span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-medium">Forward</span></td>
                          <td className="p-3 text-slate-400 text-[11px]">22 May</td>
                          <td className="p-3"><span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-md"><ShieldCheck className="w-3 h-3" /> Verified</span></td>
                          <td className="p-3 text-right"><button className="bg-white border border-slate-200 hover:bg-slate-50 px-2 py-1 rounded text-[11px] cursor-pointer"><Edit2 className="w-2.5 h-2.5 inline mr-1" /> Edit</button></td>
                        </tr>
                        <tr className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3"><span className="inline-flex items-center justify-center w-6 h-6 bg-slate-50 border border-slate-200 text-[11px] font-mono font-bold rounded-md">10</span></td>
                          <td className="p-3 flex items-center gap-2.5">
                            <div className="w-6 h-6 bg-indigo-50 text-indigo-800 font-semibold rounded-full flex items-center justify-center text-[9px]">KG</div>
                            <div>
                              <div className="font-semibold text-slate-800">Kevin Gitau</div>
                              <div className="text-[10px] text-slate-400">Fly-half</div>
                            </div>
                          </td>
                          <td className="p-3"><span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-medium">Back</span></td>
                          <td className="p-3 text-slate-400 text-[11px]">22 May</td>
                          <td className="p-3"><span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-md"><ShieldCheck className="w-3 h-3" /> Verified</span></td>
                          <td className="p-3 text-right"><button className="bg-white border border-slate-200 hover:bg-slate-50 px-2 py-1 rounded text-[11px] cursor-pointer"><Edit2 className="w-2.5 h-2.5 inline mr-1" /> Edit</button></td>
                        </tr>
                        <tr className="bg-red-50/20 hover:bg-red-50/40 transition-colors">
                          <td className="p-3"><span className="inline-flex items-center justify-center w-6 h-6 bg-slate-50 border border-slate-200 text-[11px] font-mono font-bold rounded-md">14</span></td>
                          <td className="p-3 flex items-center gap-2.5">
                            <div className="w-6 h-6 bg-amber-50 text-amber-800 font-semibold rounded-full flex items-center justify-center text-[9px]">JK</div>
                            <div>
                              <div className="font-semibold text-slate-800">James Kariuki</div>
                              <div className="text-[10px] text-slate-400">Centre</div>
                            </div>
                          </td>
                          <td className="p-3"><span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-medium">Back</span></td>
                          <td className="p-3 text-slate-400 text-[11px]">23 May</td>
                          <td className="p-3"><span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-red-800 bg-red-50 px-1.5 py-0.5 rounded-md border border-red-100"><AlertCircle className="w-3 h-3" /> Missing ID back</span></td>
                          <td className="p-3 text-right"><button className="bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 px-2 py-1 rounded text-[11px] cursor-pointer font-medium"><Upload className="w-2.5 h-2.5 inline mr-1" /> Fix</button></td>
                        </tr>
                        <tr className="bg-red-50/20 hover:bg-red-50/40 transition-colors">
                          <td className="p-3"><span className="inline-flex items-center justify-center w-6 h-6 bg-slate-50 border border-slate-200 text-[11px] font-mono font-bold rounded-md">1</span></td>
                          <td className="p-3 flex items-center gap-2.5">
                            <div className="w-6 h-6 bg-teal-50 text-teal-800 font-semibold rounded-full flex items-center justify-center text-[9px]">PN</div>
                            <div>
                              <div className="font-semibold text-slate-800">Peter Njoroge</div>
                              <div className="text-[10px] text-slate-400">Prop</div>
                            </div>
                          </td>
                          <td className="p-3"><span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-medium">Forward</span></td>
                          <td className="p-3 text-slate-400 text-[11px]">24 May</td>
                          <td className="p-3"><span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-red-800 bg-red-50 px-1.5 py-0.5 rounded-md border border-red-100"><AlertCircle className="w-3 h-3" /> Duplicate ID #</span></td>
                          <td className="p-3 text-right"><button className="bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 px-2 py-1 rounded text-[11px] cursor-pointer font-medium"><Edit2 className="w-2.5 h-2.5 inline mr-1" /> Fix</button></td>
                        </tr>
                        <tr className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3"><span className="inline-flex items-center justify-center w-6 h-6 bg-slate-50 border border-slate-200 text-[11px] font-mono font-bold rounded-md">2</span></td>
                          <td className="p-3 flex items-center gap-2.5">
                            <div className="w-6 h-6 bg-rose-50 text-rose-800 font-semibold rounded-full flex items-center justify-center text-[9px]">SM</div>
                            <div>
                              <div className="font-semibold text-slate-800">Samuel Mugo</div>
                              <div className="text-[10px] text-slate-400">Hooker</div>
                            </div>
                          </td>
                          <td className="p-3"><span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-medium">Forward</span></td>
                          <td className="p-3 text-slate-400 text-[11px]">24 May</td>
                          <td className="p-3"><span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-md"><ShieldCheck className="w-3 h-3" /> Verified</span></td>
                          <td className="p-3 text-right"><button className="bg-white border border-slate-200 hover:bg-slate-50 px-2 py-1 rounded text-[11px] cursor-pointer"><Edit2 className="w-2.5 h-2.5 inline mr-1" /> Edit</button></td>
                        </tr>
                        <tr className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3"><span className="inline-flex items-center justify-center w-6 h-6 bg-slate-50 border border-slate-200 text-[11px] font-mono font-bold rounded-md">9</span></td>
                          <td className="p-3 flex items-center gap-2.5">
                            <div className="w-6 h-6 bg-emerald-50 text-emerald-800 font-semibold rounded-full flex items-center justify-center text-[9px]">AK</div>
                            <div>
                              <div className="font-semibold text-slate-800">Alex Kamau</div>
                              <div className="text-[10px] text-slate-400">Scrum-half</div>
                            </div>
                          </td>
                          <td className="p-3"><span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-medium">Back</span></td>
                          <td className="p-3 text-slate-400 text-[11px]">25 May</td>
                          <td className="p-3"><span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-md"><ShieldCheck className="w-3 h-3" /> Verified</span></td>
                          <td className="p-3 text-right"><button className="bg-white border border-slate-200 hover:bg-slate-50 px-2 py-1 rounded text-[11px] cursor-pointer"><Edit2 className="w-2.5 h-2.5 inline mr-1" /> Edit</button></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Table Pagination */}
                  <div className="p-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/30 text-[11px] text-slate-400">
                    <div>Showing 6 of 18 players</div>
                    <div className="flex gap-1">
                      <button className="border border-slate-200 px-2 py-1 rounded hover:bg-slate-50 disabled:opacity-50" disabled>&lt;</button>
                      <button className="border border-slate-200 bg-white font-semibold text-blue-700 px-2.5 py-1 rounded">1</button>
                      <button className="border border-slate-200 px-2.5 py-1 rounded hover:bg-slate-50">2</button>
                      <button className="border border-slate-200 px-2.5 py-1 rounded hover:bg-slate-50">3</button>
                      <button className="border border-slate-200 px-2 py-1 rounded hover:bg-slate-50">&gt;</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 3: REGISTRATION FORM */}
            {activeTab === 'register' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Register a new player</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">All fields required · Kenya DPA 2019 compliant</p>
                  </div>
                  <button onClick={() => nav('roster')} className="inline-flex items-center gap-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-2.5 py-1.5 rounded-md shadow-xs transition-colors cursor-pointer">
                    <ArrowLeft className="w-3 h-3" /> Back to roster
                  </button>
                </div>

                {/* Player details form card */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                  <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    <IdCard className="w-3.5 h-3.5 text-blue-600" /> Player details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full name</label>
                      <input type="text" placeholder="Enter full legal name" className="h-8 px-2.5 border border-slate-200 rounded-md bg-white text-xs text-slate-800 outline-none focus:border-blue-500" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jersey number</label>
                      <input type="number" placeholder="e.g. 15" className="h-8 px-2.5 border border-slate-200 rounded-md bg-white text-xs text-slate-800 outline-none focus:border-blue-500" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Playing position</label>
                      <select className="h-8 px-2 border border-slate-200 rounded-md bg-slate-50 text-xs text-slate-700 outline-none cursor-pointer">
                        <option>Select position...</option>
                        <option>Prop</option>
                        <option>Hooker</option>
                        <option>Lock</option>
                        <option>Scrum-half</option>
                        <option>Fly-half</option>
                        <option>Winger</option>
                        <option>Centre</option>
                        <option>Full-back</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date of birth</label>
                      <input type="text" placeholder="DD / MM / YYYY" className="h-8 px-2.5 border border-slate-200 rounded-md bg-white text-xs text-slate-400 outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone number</label>
                      <input type="text" placeholder="+254 7XX XXX XXX" className="h-8 px-2.5 border border-slate-200 rounded-md bg-white text-xs text-slate-800 outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">National ID number</label>
                      <input type="text" placeholder="Enter ID number" className="h-8 px-2.5 border border-slate-200 rounded-md bg-white text-xs text-slate-800 outline-none" />
                    </div>
                  </div>
                </div>

                {/* Identity upload files card */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                  <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-blue-600" /> Identity documents
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">National ID — front</label>
                      <div className="border border-dashed border-slate-300 rounded-md p-4 text-center bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer">
                        <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                        <div className="font-semibold text-slate-700 text-xs">Upload front photo</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">JPG or PNG · max 5MB</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">National ID — back</label>
                      <div className="border border-dashed border-slate-300 rounded-md p-4 text-center bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer">
                        <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                        <div className="font-semibold text-slate-700 text-xs">Upload back photo</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">JPG or PNG · max 5MB</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 text-blue-900 px-3 py-2 rounded-lg text-[11px] flex items-start gap-2 shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      Photos are used for OCR duplicate detection and face verification by the data team. Blurry or partial images will be rejected.
                    </div>
                  </div>
                </div>

                {/* Consent Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                  <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-600" /> Data protection consent
                  </h3>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-md text-slate-600 leading-relaxed text-[11px]">
                    By registering this player you confirm they have given informed consent for their personal data — including national ID photographs — to be collected and processed for tournament administration purposes under the <strong>Kenya Data Protection Act 2019</strong>. Data is retained for the duration of the tournament and deleted within 90 days thereafter.
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="dpa" 
                      checked={consentChecked}
                      onChange={(e) => setConsentChecked(e.target.checked)}
                      className="w-3.5 h-3.5 text-blue-600 border-slate-300 rounded cursor-pointer" 
                    />
                    <label htmlFor="dpa" className="text-xs text-slate-600 cursor-pointer select-none">Player has read and given informed consent</label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button onClick={() => nav('roster')} className="bg-white border border-slate-200 hover:bg-slate-50 font-medium px-3 py-1.5 rounded-md cursor-pointer">Cancel</button>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-md shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Register player
                  </button>
                </div>
              </div>
            )}

            {/* VIEW 4: TOURNAMENT REGISTRATION STEPS */}
            {activeTab === 'tourney' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Tournament registration</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">Murang'a Open 2026 · 3 of 3 steps complete</p>
                  </div>
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded-full shadow-xs">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Submitted
                  </span>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-2 rounded-lg text-[11px] flex items-start gap-2 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Registration submitted.</strong> Your team is in the queue. The data team must issue a green flag before the organizer assigns you to Pool MA. Fix the 2 flagged players to unblock this.
                  </div>
                </div>

                {/* Checklist steps timeline card */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4 text-left">
                  <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    <ClipboardCheck className="w-3.5 h-3.5 text-blue-600" /> Registration steps
                  </h3>
                  
                  <div className="space-y-3.5 relative">
                    {/* Step 1 */}
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800 text-xs">Create account</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Completed 20 May 2026</div>
                      </div>
                      <span className="bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded text-[9px] border border-emerald-100">Done</span>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800 text-xs">Team registration</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Murang'a RFC registered 21 May 2026</div>
                      </div>
                      <span className="bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded text-[9px] border border-emerald-100">Done</span>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800 text-xs">Tournament entry submitted</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Murang'a Open 2026 · 18 players submitted</div>
                      </div>
                      <span className="bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded text-[9px] border border-emerald-100">Done</span>
                    </div>

                    <hr className="border-slate-100 my-2" />

                    {/* Step 4 Pending */}
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                        <Flag className="w-2.5 h-2.5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-400 text-xs">Data team green flag</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Awaiting — 2 players need to be fixed first</div>
                      </div>
                      <span className="bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded text-[9px] border border-amber-200/50 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> Pending</span>
                    </div>

                    {/* Step 5 Inactive */}
                    <div className="flex items-start gap-3 opacity-60">
                      <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                        <Shield className="w-2.5 h-2.5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-400 text-xs">Organizer pool assignment</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Locked until verified</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEWS 5, 6, 7: PLACEHOLDERS FOR SYSTEM COMPLETE */}
            {(activeTab === 'fixtures' || activeTab === 'stats' || activeTab === 'settings') && (
              <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-6 animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <Activity className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 capitalize">{activeTab} Panel</h3>
                <p className="text-slate-400 max-w-xs mt-1 text-[11px]">This feature interface is registered dynamically under the tournament manager routing hub.</p>
                <button onClick={() => nav('dashboard')} className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700 underline cursor-pointer">Return to Dashboard Home</button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}