"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  AlertTriangle, 
  ShieldAlert, 
  ChevronRight, 
  Filter,
  Download,
  Shield,
  RefreshCcw,
  ArrowRight,
  Activity,
  Target,
  AlertCircle,
  Flame,
  Bug,
  Crosshair
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function VulnerabilitiesPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [findings, setFindings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchFindings() {
    if (loading && findings.length > 0) return;

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

      const response = await fetchWithTimeout("/api/findings");
      if (!response.ok) throw new Error("API Failed");
      
      let data = [];
      try {
        data = await response.json();
      } catch (e) {
        console.error("JSON Parse Error", e);
        data = [];
      }

      setFindings(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch findings", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
      fetchFindings();
  }, []);

  const filteredFindings = findings.filter(f => {
    if (activeFilter === "all") return true;
    if (activeFilter === "critical") return f.severity === "CRITICAL";
    if (activeFilter === "high") return f.severity === "HIGH";
    if (activeFilter === "medium") return f.severity === "MEDIUM";
    return true;
  });

  const criticalCount = findings.filter(f => f.severity === "CRITICAL").length;
  const highCount = findings.filter(f => f.severity === "HIGH").length;
  const mediumCount = findings.filter(f => f.severity === "MEDIUM").length;

  return (
    <>
      {/* Header */}
      <header className="relative mb-5 pb-5 border-b border-white/5">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-10 right-10 w-60 h-60 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-3">
              <ShieldAlert size={14} className="text-red-400" />
              <span className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em]">Threat Intelligence</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-4xl font-bold tracking-tight text-white mb-2">
              Vulnerability <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Registry</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-slate-500 text-sm">
              Aggregated intelligence on all verified system weaknesses.
            </motion.p>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex gap-2">
            <button 
              onClick={() => fetchFindings()} 
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all disabled:opacity-40"
            >
              <RefreshCcw size={14} className={loading ? "animate-spin" : ""} /> Sync
            </button>
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(findings, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `vulnerabilities-export-${Date.now()}.json`;
                a.click(); URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </motion.div>
        </div>
      </header>

      {/* Severity Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <SeverityStat label="Total" value={findings.length} icon={<Bug size={16} />} gradient="from-slate-500/10 to-slate-500/5" iconColor="text-slate-400" />
        <SeverityStat label="Critical" value={criticalCount} icon={<Flame size={16} />} gradient="from-red-500/10 to-red-500/5" iconColor="text-red-400" />
        <SeverityStat label="High" value={highCount} icon={<AlertTriangle size={16} />} gradient="from-orange-500/10 to-orange-500/5" iconColor="text-orange-400" />
        <SeverityStat label="Medium" value={mediumCount} icon={<AlertCircle size={16} />} gradient="from-yellow-500/10 to-yellow-500/5" iconColor="text-yellow-400" />
      </motion.div>

      {/* Filter Tabs */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex gap-1 p-1 bg-white/[0.02] border border-white/5 rounded-xl mb-6 w-fit">
        {[
          { key: "all", label: "All", count: findings.length },
          { key: "critical", label: "Critical", count: criticalCount },
          { key: "high", label: "High", count: highCount },
          { key: "medium", label: "Medium", count: mediumCount },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
              activeFilter === f.key
                ? "bg-white text-black shadow-lg"
                : "text-slate-500 hover:text-white hover:bg-white/5"
            }`}
          >
            {f.label}
            <span className={`opacity-60 ${activeFilter === f.key ? "text-black" : ""}`}>{f.count}</span>
          </button>
        ))}
      </motion.div>

      {/* Findings List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-20 bg-black border border-white/[0.06] rounded-2xl">
            <RefreshCcw className="w-5 h-5 animate-spin mx-auto mb-4 text-white/10" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Synchronizing Registry...</span>
          </div>
        ) : filteredFindings.length === 0 ? (
          <div className="text-center py-20 bg-black border border-dashed border-white/[0.08] rounded-2xl">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-slate-700" />
            </div>
            <p className="text-slate-500 text-sm font-bold mb-1">No vulnerabilities found</p>
            <p className="text-[10px] text-slate-600">
              {activeFilter !== "all" ? "No findings match this severity filter." : "Run a scan to detect vulnerabilities."}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredFindings.map((vuln, idx) => (
              <VulnerabilityCard key={vuln.id} vuln={vuln} index={idx} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </>
  );
}

function SeverityStat({ label, value, icon, gradient, iconColor }: any) {
  return (
    <div className={`bg-gradient-to-br ${gradient} border border-white/[0.06] rounded-xl p-4 flex items-center gap-3`}>
      <div className={`w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center ${iconColor}`}>
        {icon}
      </div>
      <div>
        <div className="text-xl font-black text-white">{value}</div>
        <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</div>
      </div>
    </div>
  );
}

function VulnerabilityCard({ vuln, index }: any) {
  const severityConfig: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode; barColor: string }> = {
    CRITICAL: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: <Flame size={16} />, barColor: "bg-red-500" },
    HIGH: { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: <AlertTriangle size={16} />, barColor: "bg-orange-500" },
    MEDIUM: { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: <AlertCircle size={16} />, barColor: "bg-yellow-500" },
    LOW: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/10", icon: <Shield size={16} />, barColor: "bg-blue-500" },
  };
  const sc = severityConfig[vuln.severity] || severityConfig.MEDIUM;
  const impactLevel = vuln.severity === "CRITICAL" ? 5 : vuln.severity === "HIGH" ? 4 : vuln.severity === "MEDIUM" ? 3 : 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link href={`/dashboard/vulnerabilities/${vuln.id}`}>
        <div className={`relative bg-black border ${sc.border} rounded-2xl p-5 hover:border-white/20 transition-all cursor-pointer group overflow-hidden`}>
          {/* Severity accent bar */}
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${sc.barColor} rounded-l-2xl`} />
          
          <div className="flex items-center justify-between pl-4">
            <div className="flex items-center gap-5 flex-1 min-w-0">
              <div className={`w-11 h-11 rounded-xl ${sc.bg} flex items-center justify-center shrink-0 ${sc.color}`}>
                {sc.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-1.5">
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors tracking-tight truncate">{vuln.type}</h3>
                  <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[8px] font-black border uppercase tracking-widest ${sc.color} ${sc.bg} ${sc.border}`}>{vuln.severity}</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2 max-w-xl line-clamp-1 font-medium">{vuln.description}</p>
                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  <span className="flex items-center gap-1">
                    <Crosshair size={10} /> {vuln.location || "Unknown"}
                  </span>
                  {vuln.scan?.url && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-white/10" />
                      <span className="truncate max-w-[200px]">{vuln.scan.url}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6 shrink-0 ml-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest mb-1.5">Impact</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`w-4 h-1 rounded-full transition-colors ${i <= impactLevel ? sc.barColor : "bg-white/5"}`} />
                  ))}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
