"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Shield, 
  ExternalLink, 
  MoreVertical, 
  Trash2, 
  RefreshCcw,
  Search,
  Filter,
  ArrowUpRight,
  FileText,
  Download,
  Crosshair,
  Cpu,
  AlertTriangle,
  ChevronDown,
  Activity,
  Clock,
  BarChart3,
  Github,
  Globe,
  Target,
  Zap
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ScansPage() {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchScans() {
      try {
        const response = await fetch("/api/scan");
        const data = await response.json();
        setScans(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to fetch scans", e);
      } finally {
        setLoading(false);
      }
    }
    fetchScans();
  }, []);

  const filteredScans = scans.filter(scan => {
    if (filter !== "all" && scan.status !== filter) return false;
    if (searchQuery && !scan.url?.toLowerCase().includes(searchQuery.toLowerCase()) && !scan.id?.includes(searchQuery)) return false;
    return true;
  });

  const stats = {
    total: scans.length,
    completed: scans.filter(s => s.status === "COMPLETED").length,
    running: scans.filter(s => s.status === "RUNNING").length,
    failed: scans.filter(s => s.status === "FAILED").length,
  };

  return (
    <>
      {/* Header */}
      <header className="relative mb-5 pb-5 border-b border-white/5">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-3">
              <Shield size={14} className="text-cyan-400" />
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">Audit Pipeline</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-4xl font-bold tracking-tight text-white mb-2">
              Security <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Scans</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-slate-500 text-sm">
              Review audit history and mission telemetry logs.
            </motion.p>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(scans, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `scans-export-${Date.now()}.json`;
                a.click(); URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Export All
            </button>
          </motion.div>
        </div>
      </header>

      {/* Stats Bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <MiniStat label="Total" value={stats.total} icon={<Target size={16} />} gradient="from-slate-500/10 to-slate-500/5" iconColor="text-slate-400" />
        <MiniStat label="Completed" value={stats.completed} icon={<Shield size={16} />} gradient="from-green-500/10 to-green-500/5" iconColor="text-green-400" />
        <MiniStat label="Running" value={stats.running} icon={<Activity size={16} />} gradient="from-blue-500/10 to-blue-500/5" iconColor="text-blue-400" pulse />
        <MiniStat label="Failed" value={stats.failed} icon={<AlertTriangle size={16} />} gradient="from-red-500/10 to-red-500/5" iconColor="text-red-400" />
      </motion.div>

      {/* Search & Filter */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-black border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/[0.04] flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} 
              placeholder="Search by URL or mission ID..." 
              className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-11 py-2.5 text-sm focus:outline-none focus:border-white/20 transition-colors placeholder:text-slate-700"
            />
          </div>
          <div className="flex gap-1 p-1 bg-white/[0.02] border border-white/5 rounded-xl">
            {[
              { key: "all", label: "All" },
              { key: "COMPLETED", label: "Passed" },
              { key: "RUNNING", label: "Active" },
              { key: "FAILED", label: "Failed" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  filter === f.key
                    ? "bg-white text-black shadow-lg"
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.04]">
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Target</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Engine</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Status</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Date</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <RefreshCcw className="w-5 h-5 animate-spin mx-auto mb-4 text-white/10" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Synchronizing...</span>
                  </td>
                </tr>
              ) : filteredScans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-dashed border-white/10 flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-6 h-6 text-slate-700" />
                    </div>
                    <p className="text-slate-500 text-sm font-bold mb-1">No missions found</p>
                    <p className="text-[10px] text-slate-600">
                      {searchQuery ? "Try a different search query." : "Initialize a new scan from the dashboard."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredScans.map((scan, idx) => (
                  <ScanRow key={scan.id} scan={scan} index={idx} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredScans.length > 0 && (
          <div className="px-6 py-3 border-t border-white/[0.04] flex items-center justify-between">
            <span className="text-[10px] text-slate-600 font-bold">
              Showing {filteredScans.length} of {scans.length} missions
            </span>
          </div>
        )}
      </motion.div>
    </>
  );
}

function MiniStat({ label, value, icon, gradient, iconColor, pulse = false }: any) {
  return (
    <div className={`bg-gradient-to-br ${gradient} border border-white/[0.06] rounded-xl p-4 flex items-center gap-3`}>
      <div className={`w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center ${iconColor}`}>
        {icon}
      </div>
      <div>
        <div className="text-xl font-black text-white flex items-center gap-2">
          {value}
          {pulse && value > 0 && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />}
        </div>
        <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</div>
      </div>
    </div>
  );
}

function ScanRow({ scan, index }: any) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const isGithub = scan.url?.includes("github.com");

  const statusConfig: Record<string, { color: string; bg: string; border: string; dot: string }> = {
    COMPLETED: { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", dot: "bg-green-400" },
    RUNNING: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", dot: "bg-blue-400" },
    FAILED: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", dot: "bg-red-400" },
    PENDING: { color: "text-slate-500", bg: "bg-white/5", border: "border-white/10", dot: "bg-slate-500" },
  };
  const sc = statusConfig[scan.status] || statusConfig.PENDING;

  const handleRetry = async () => {
    if (!confirm("Retry this scan?")) return;
    setIsRetrying(true);
    try {
      const response = await fetch(`/api/scan/${scan.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "retry" }),
      });
      if (response.ok) window.location.reload();
      else alert("Failed to retry scan");
    } catch { alert("Error retrying scan"); }
    finally { setIsRetrying(false); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this scan permanently?")) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/scan/${scan.id}`, { method: "DELETE" });
      if (response.ok) window.location.reload();
      else alert("Failed to delete scan");
    } catch { alert("Error deleting scan"); }
    finally { setIsDeleting(false); }
  };

  const engineLabel = scan.scanEngine === "sentinelx" ? "SentinelX" : "CodeQL";

  return (
    <motion.tr
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="group hover:bg-white/[0.02] transition-colors"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border border-white/5 ${sc.bg}`}>
            {isGithub ? <Github className={`w-4 h-4 ${sc.color}`} /> : <Globe className={`w-4 h-4 ${sc.color}`} />}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors tracking-tight max-w-[260px] truncate">
              {scan.url || "Unknown target"}
            </span>
            <span className="text-[10px] text-slate-700 font-mono mt-0.5">ID: {scan.id?.substring(0, 12)}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5">
            {scan.scanEngine === "sentinelx" ? <Crosshair size={10} className="text-red-400" /> : <Cpu size={10} className="text-blue-400" />}
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{engineLabel}</span>
          </div>
          <span className="text-[8px] uppercase tracking-widest text-slate-600 bg-white/[0.02] px-2 py-0.5 rounded-md">{scan.scanMode || "Full"}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest ${sc.color} ${sc.bg} ${sc.border}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${scan.status === "RUNNING" ? "animate-pulse" : ""}`} />
          {scan.status}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Clock size={12} className="text-slate-600" />
          <span className="text-[10px] font-medium whitespace-nowrap">
            {scan.createdAt ? new Date(scan.createdAt).toLocaleDateString() : "—"}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {scan.status === "COMPLETED" && (
            <a 
              href={`/api/scan/${scan.id}/report`} 
              download 
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-500 hover:text-blue-400"
              title="Download Report"
            >
              <Download size={14} />
            </a>
          )}
          <button 
            onClick={handleRetry}
            disabled={isRetrying || scan.status === "RUNNING"}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-500 hover:text-white disabled:opacity-30"
            title="Retry"
          >
            <RefreshCcw size={14} className={isRetrying ? "animate-spin" : ""} />
          </button>
          <Link href={`/dashboard/scans/${scan.id}`} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-500 hover:text-white" title="Details">
            <ArrowUpRight size={14} />
          </Link>
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-500 hover:text-red-400 disabled:opacity-30"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}
