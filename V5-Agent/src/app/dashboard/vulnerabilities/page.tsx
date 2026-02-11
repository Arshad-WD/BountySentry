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
  ArrowRight
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

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

  /*
  useEffect(() => {
    fetchFindings();
  }, []);
  */
  useEffect(() => {
      fetchFindings();
  }, []);

  const filteredFindings = findings.filter(f => {
    if (activeFilter === "all") return true;
    if (activeFilter === "critical") return f.severity === "CRITICAL";
    if (activeFilter === "high") return f.severity === "HIGH";
    if (activeFilter === "resolved") return false; 
    return true;
  });

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Vulnerability Registry</h1>
          <p className="text-slate-500 text-sm">Aggregated intelligence on all verified system weaknesses.</p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => fetchFindings()} 
            disabled={loading}
            className="secondary-button text-xs flex items-center gap-2"
          >
            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} /> Sync
          </button>
          <button className="secondary-button text-xs flex items-center gap-2">
            <Download className="w-3.5 h-3.5" /> Export Report
          </button>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 mb-8 bg-black border border-white/10 p-1 rounded-md w-fit">
        <FilterTab label="All Discoveries" count={findings.length} active={activeFilter === "all"} onClick={() => setActiveFilter("all")} />
        <FilterTab label="Critical" count={findings.filter(f => f.severity === "CRITICAL").length} active={activeFilter === "critical"} onClick={() => setActiveFilter("critical")} />
        <FilterTab label="High" count={findings.filter(f => f.severity === "HIGH").length} active={activeFilter === "high"} onClick={() => setActiveFilter("high")} />
      </div>

      <div className="grid grid-cols-1 gap-3">
        {loading ? (
          <div className="text-center py-20 text-slate-500">
            <RefreshCcw className="w-5 h-5 animate-spin mx-auto mb-4 text-white/20" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Synchronizing Registry...</span>
          </div>
        ) : filteredFindings.length === 0 ? (
          <div className="text-center py-20 bg-black border border-dashed border-white/10 rounded-lg text-slate-500 text-sm font-medium">
            No vulnerability records identified for this perimeter subset.
          </div>
        ) : (
          filteredFindings.map((vuln) => (
            <VulnerabilityCard key={vuln.id} vuln={vuln} />
          ))
        )}
      </div>
    </>
  );
}

function FilterTab({ label, count, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded text-[10px] font-bold transition-all flex items-center gap-3 uppercase tracking-widest ${
        active 
          ? "bg-white text-black" 
          : "text-slate-500 hover:text-white"
      }`}
    >
      {label}
      <span className={`opacity-50 ${active ? "text-black" : "text-slate-500"}`}>{count}</span>
    </button>
  );
}

function VulnerabilityCard({ vuln }: any) {
  const severityColors: any = {
    CRITICAL: "text-red-500 border-red-500/20",
    HIGH: "text-orange-500 border-orange-500/20",
    MEDIUM: "text-yellow-500 border-yellow-500/20",
    LOW: "text-blue-500 border-blue-500/10",
  };

  return (
    <Link href={`/dashboard/vulnerabilities/${vuln.id}`}>
      <div className="bg-black border border-white/5 p-5 flex items-center justify-between hover:border-white/20 transition-all cursor-pointer group rounded-lg">
        <div className="flex items-center gap-6">
          <div className={`w-10 h-10 rounded bg-white/5 flex items-center justify-center border ${severityColors[vuln.severity] || "border-white/5"}`}>
            <ShieldAlert size={18} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors tracking-tight uppercase">{vuln.type}</h3>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-widest ${severityColors[vuln.severity] || ""}`}>{vuln.severity}</span>
            </div>
            <p className="text-[12px] text-slate-500 mb-2 max-w-xl line-clamp-1 font-medium">{vuln.description}</p>
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              <span>{vuln.location}</span>
              <span className="w-1 h-1 rounded-full bg-white/10" />
              <span>{vuln.scan?.url}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest mb-1">Impact</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`w-3 h-0.5 rounded-full ${i <= (vuln.severity === "CRITICAL" ? 5 : vuln.severity === "HIGH" ? 4 : 3) ? "bg-red-500" : "bg-white/5"}`} />
              ))}
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-white transition-colors" />
        </div>
      </div>
    </Link>
  );
}
