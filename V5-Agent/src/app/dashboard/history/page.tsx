"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  History as HistoryIcon, 
  Terminal, 
  User, 
  ShieldCheck, 
  Zap,
  ArrowRight,
  RefreshCcw,
  AlertTriangle
} from "lucide-react";
import { useEffect, useState } from "react";

export default function HistoryPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch("/api/scan");
        const data = await response.json();
        setActivities(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to fetch history", e);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  return (
    <DashboardLayout>
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-display font-extrabold tracking-tight">Audit Trail</h1>
          <p className="text-slate-500 text-base">Comprehensive log of all system and agent activities.</p>
        </div>
      </header>

      <div className="space-y-4">
        {loading ? (
            <div className="text-center py-12 text-slate-500 text-sm">
                <RefreshCcw className="w-5 h-5 animate-spin mx-auto mb-2" />
                Loading audit trail...
            </div>
        ) : activities.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-500 text-sm italic border-dashed">
                The audit trail is currently empty. Start a scan to see agent logs.
            </div>
        ) : (
            activities.map((activity, i) => (
                <div key={i} className="glass-card p-6 flex items-start justify-between hover:bg-white/[0.02] transition-colors border-l-2 border-l-transparent hover:border-l-blue-500/50">
                    <div className="flex gap-6">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                        {activity.status === "COMPLETED" ? <ShieldCheck className="w-5 h-5 text-green-400" /> : 
                        activity.status === "FAILED" ? <AlertTriangle className="w-5 h-5 text-red-500" /> : 
                        <Terminal className="w-5 h-5 text-blue-400" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">MISSION_{activity.status}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                        <span className="text-xs font-bold text-blue-400">ADMINHOST</span>
                        </div>
                        <h3 className="text-base font-bold mb-1">Autonomous Scan on <span className="text-white underline decoration-blue-500/30 underline-offset-4">{activity.url}</span></h3>
                        <p className="text-sm text-slate-500">
                            {activity.status === "COMPLETED" ? "Full surface heuristics check finalized successfully." : 
                             activity.status === "FAILED" ? "Mission aborted: Scope validation error or target unreachable." : 
                             "Agent currently assessing the target infrastructure."}
                        </p>
                    </div>
                    </div>
                    <div className="text-right">
                    <div className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-tighter">
                        {new Date(activity.createdAt).toLocaleDateString()}
                    </div>
                    <button className="text-[10px] font-bold text-blue-500 flex items-center gap-1 hover:underline ml-auto">
                        View Report <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                    </div>
                </div>
            ))
        )}
      </div>
    </DashboardLayout>
  );
}
