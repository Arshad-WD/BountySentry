"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Shield, 
  Search, 
  Plus, 
  ArrowUpRight,
  Globe,
  RefreshCcw,
  Zap,
  ArrowRight,
  TrendingUp,
  Clock,
  BarChart3,
  Github,
  Target,
  Cpu,
  Crosshair
} from "lucide-react";
import { useState, useEffect } from "react";
import NewScanModal from "@/components/NewScanModal";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, critical: 0, high: 0, medium: 0, resolved: 0 });
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    if (loading && scans.length > 0) return;
    
    setLoading(true);
    try {
      const fetchWithTimeout = async (url: string) => {
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), 5000);
          try {
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(id);
            return res;
          } catch (e) {
            clearTimeout(id);
            throw e;
          }
      };

      const [scansRes, findingsRes] = await Promise.allSettled([
        fetchWithTimeout("/api/scan"),
        fetchWithTimeout("/api/findings")
      ]);
      
      let scansData: any[] = [];
      let findingsData: any[] = [];

      if (scansRes.status === "fulfilled" && scansRes.value.ok) {
          try { scansData = await scansRes.value.json(); } catch(e) { console.error("Failed to parse scans", e); }
      }
      
      if (findingsRes.status === "fulfilled" && findingsRes.value.ok) {
          try { findingsData = await findingsRes.value.json(); } catch(e) { console.error("Failed to parse findings", e); }
      }

      const latestScans = Array.isArray(scansData) ? scansData.slice(0, 5) : [];
      const allFindings = Array.isArray(findingsData) ? findingsData : [];

      setScans(latestScans);
      setStats({
        total: scansData.length || 0,
        critical: allFindings.filter((f: any) => f.severity === "CRITICAL").length,
        high: allFindings.filter((f: any) => f.severity === "HIGH").length,
        medium: allFindings.filter((f: any) => f.severity === "MEDIUM").length,
        resolved: 0
      });
    } catch (e) {
      console.error("Dashboard data fetch failed", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const riskScore = stats.critical > 0 ? Math.max(15, 100 - (stats.critical * 20 + stats.high * 10)) 
                   : stats.high > 0 ? Math.max(40, 100 - stats.high * 8) 
                   : stats.total > 0 ? 92 : 100;

  return (
    <>
      {/* Hero Header */}
      <header className="relative mb-6 pb-5 border-b border-white/5">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-10 right-0 w-60 h-60 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-3"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black text-green-500 uppercase tracking-[0.2em]">System Online</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2"
            >
              Security<br/>
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">Overview</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-slate-500 text-sm max-w-md"
            >
              Real-time monitoring of your security posture across all registered assets and attack surfaces.
            </motion.p>
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="flex items-center gap-3"
          >
            <button 
              onClick={() => fetchData()} 
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-bold uppercase tracking-widest text-slate-400 hover:bg-white/5 hover:text-white transition-all disabled:opacity-40"
            >
              <RefreshCcw size={14} className={loading ? "animate-spin" : ""} /> Sync
            </button>
            <button
              onClick={() => {
                const reportData = { generatedAt: new Date().toISOString(), stats, scans };
                const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `sentinel-report-${Date.now()}.json`;
                a.click(); URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-bold uppercase tracking-widest text-slate-400 hover:bg-white/5 hover:text-white transition-all"
            >
              <Shield className="w-3.5 h-3.5" /> Export
            </button>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-[0.97]">
              <Zap className="w-3.5 h-3.5" /> New Mission
            </button>
          </motion.div>
        </div>
      </header>

      {/* Stat Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
      >
        <StatCard 
          label="Total Missions" 
          value={stats.total.toString()} 
          icon={<Target className="w-5 h-5" />}
          gradient="from-blue-500/10 to-cyan-500/5"
          iconColor="text-blue-400"
          borderColor="border-blue-500/20"
        />
        <StatCard 
          label="Critical" 
          value={stats.critical.toString()} 
          icon={<AlertTriangle className="w-5 h-5" />}
          gradient="from-red-500/10 to-orange-500/5"
          iconColor="text-red-400"
          borderColor="border-red-500/20"
          valueColor="text-red-400"
        />
        <StatCard 
          label="High Priority" 
          value={stats.high.toString()} 
          icon={<Shield className="w-5 h-5" />}
          gradient="from-orange-500/10 to-yellow-500/5"
          iconColor="text-orange-400"
          borderColor="border-orange-500/20"
          valueColor="text-orange-400"
        />
        <StatCard 
          label="Medium" 
          value={stats.medium.toString()} 
          icon={<Activity className="w-5 h-5" />}
          gradient="from-yellow-500/10 to-amber-500/5"
          iconColor="text-yellow-400"
          borderColor="border-yellow-500/20"
          valueColor="text-yellow-400"
        />
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Missions — 2/3 width */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="lg:col-span-2 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white uppercase tracking-[0.15em]">Recent Missions</h3>
            <Link href="/dashboard/scans" className="text-[10px] font-black text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest flex items-center gap-1.5 group">
              View All <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          
          <div className="bg-black border border-white/[0.06] rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-16 flex flex-col items-center justify-center">
                <RefreshCcw className="w-6 h-6 animate-spin text-white/10 mb-4" />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Synchronizing...</span>
              </div>
            ) : scans.length > 0 ? (
              <div className="divide-y divide-white/[0.04]">
                {scans.map((scan, idx) => (
                  <MissionRow key={scan.id} scan={scan} index={idx} />
                ))}
              </div>
            ) : (
              <div className="p-16 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-dashed border-white/10 flex items-center justify-center mb-4">
                  <Globe className="w-7 h-7 text-slate-700" />
                </div>
                <p className="text-slate-500 text-sm font-bold mb-1">No active missions</p>
                <p className="text-[10px] text-slate-600">Initialize a new scan to get started.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* System Health Panel — 1/3 width */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h3 className="text-sm font-black text-white uppercase tracking-[0.15em]">System Health</h3>
          
          {/* Risk Score Ring */}
          <div className="bg-black border border-white/[0.06] rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/[0.03] to-blue-500/[0.03]" />
            <div className="relative flex flex-col items-center">
              {/* Ring */}
              <div className="relative w-32 h-32 mb-5">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
                  <circle 
                    cx="50" cy="50" r="42" fill="none" 
                    stroke={riskScore >= 80 ? "#22c55e" : riskScore >= 50 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="6" 
                    strokeDasharray={`${riskScore * 2.64} 264`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white">{riskScore}</span>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Score</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm font-bold text-white mb-0.5">
                  {riskScore >= 80 ? "Perimeter Secure" : riskScore >= 50 ? "Attention Needed" : "Critical Risk"}
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  {stats.total > 0 ? `${stats.total} asset${stats.total > 1 ? "s" : ""} monitored` : "No assets scanned"}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black border border-white/[0.06] rounded-xl p-4 text-center">
              <div className="text-lg font-black text-white">{stats.total}</div>
              <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Scans</div>
            </div>
            <div className="bg-black border border-white/[0.06] rounded-xl p-4 text-center">
              <div className="text-lg font-black text-white">{stats.critical + stats.high + stats.medium}</div>
              <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Findings</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-black border border-white/[0.06] rounded-2xl p-5">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Quick Actions</h4>
            <div className="space-y-2">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Zap size={14} className="text-blue-400" />
                </div>
                <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">Launch New Scan</span>
              </button>
              <Link 
                href="/dashboard/vulnerabilities"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle size={14} className="text-red-400" />
                </div>
                <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">Review Findings</span>
              </Link>
              <Link 
                href="/dashboard/assets"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Globe size={14} className="text-green-400" />
                </div>
                <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">Manage Assets</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      <NewScanModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

function StatCard({ label, value, icon, gradient, iconColor, borderColor, valueColor = "text-white" }: any) {
  return (
    <div className={`relative group rounded-2xl border ${borderColor} bg-gradient-to-br ${gradient} p-5 overflow-hidden hover:scale-[1.02] transition-all duration-200`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[9px] font-black tracking-[0.2em] text-slate-500 uppercase">{label}</span>
          <div className={`p-2 rounded-xl bg-black/30 ${iconColor}`}>
            {icon}
          </div>
        </div>
        <div className={`text-3xl font-black tracking-tight ${valueColor}`}>{value}</div>
      </div>
    </div>
  );
}

function MissionRow({ scan, index }: any) {
  const isGithub = scan.url?.includes("github.com");
  const statusConfig: Record<string, { color: string; bg: string; dot: string }> = {
    COMPLETED: { color: "text-green-400", bg: "bg-green-500/10", dot: "bg-green-400" },
    RUNNING: { color: "text-blue-400", bg: "bg-blue-500/10", dot: "bg-blue-400" },
    FAILED: { color: "text-red-400", bg: "bg-red-500/10", dot: "bg-red-400" },
    PENDING: { color: "text-slate-500", bg: "bg-white/5", dot: "bg-slate-500" },
  };
  const sc = statusConfig[scan.status] || statusConfig.PENDING;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link href={`/dashboard/scans/${scan.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-all group">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl ${sc.bg} flex items-center justify-center`}>
            {isGithub ? <Github className={`w-4 h-4 ${sc.color}`} /> : <Globe className={`w-4 h-4 ${sc.color}`} />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white truncate max-w-[280px] group-hover:text-blue-400 transition-colors">{scan.url || "Unknown target"}</h4>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[10px] text-slate-600 font-medium">{scan.createdAt ? new Date(scan.createdAt).toLocaleDateString() : "—"}</span>
              <span className="text-[9px] text-slate-700">•</span>
              <span className="text-[9px] text-slate-600 uppercase tracking-widest font-bold">{scan.scanMode || "Full"}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${sc.bg}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${scan.status === "RUNNING" ? "animate-pulse" : ""}`} />
            <span className={`text-[9px] font-black uppercase tracking-widest ${sc.color}`}>{scan.status}</span>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-700 group-hover:text-white transition-colors" />
        </div>
      </Link>
    </motion.div>
  );
}
