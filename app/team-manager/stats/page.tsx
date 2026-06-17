"use client";

export default function StatsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Team Performance Analytics</h1>
        <p className="text-xs text-neutral-500 mt-0.5">Live tracking for points, cards, sheets, and squad rosters performance matrix indicators.</p>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center shadow-sm space-y-2">
        <div className="text-2xl">📈</div>
        <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">No Performance Metrics Cached</h3>
        <p className="text-neutral-400 text-xs max-w-sm mx-auto leading-relaxed">
          Analytics tables update automatically once fixture status transitions to complete and official tournament scores are loaded.
        </p>
      </div>
    </div>
  );
}