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
  ArrowRight
} from "lucide-react";
import { useState, useEffect } from "react";
import NewScanModal from "@/components/NewScanModal";
import Link from "next/link";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, critical: 0, high: 0, resolved: 0 });
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    if (loading && scans.length > 0) return; // Prevent double fetch if already verified
    
    setLoading(true);
    try {
      // Add timeout to fetch to prevent hanging requests
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
        resolved: 0 // Mock resolved
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

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Security Overview</h1>
          <p className="text-slate-500 text-sm">Real-time status of your protected infrastructure and assets.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchData()} 
            disabled={loading}
            className="secondary-button text-sm flex items-center gap-2"
          >
            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} /> Sync
          </button>
          <button className="secondary-button text-sm flex items-center gap-2">
            <Shield className="w-4 h-4" /> Download Report
          </button>
          <button onClick={() => setIsModalOpen(true)} className="glass-button text-sm flex items-center gap-2">
            <Zap className="w-4 h-4" /> New Mission
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Active Assets" value={stats.total.toString()} trend="+3 this week" icon={<Globe className="w-4 h-4" />} />
        <StatCard label="Critical Issues" value={stats.critical.toString()} trend="Immediate Action" icon={<AlertTriangle className="w-4 h-4" />} />
        <StatCard label="High Priority" value={stats.high.toString()} trend="Requires Review" icon={<Shield className="w-4 h-4" />} />
        <StatCard label="Agent Confidence" value="98%" trend="Autonomous" icon={<Zap className="w-4 h-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white tracking-tight">Recent Audit Missions</h3>
            <Link href="/dashboard/scans" className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest flex items-center gap-2">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="space-y-3">
            {loading ? (
                <div className="glass-card p-12 flex flex-col items-center justify-center">
                   <RefreshCcw className="w-8 h-8 animate-spin text-white/20 mb-4" />
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Synchronizing...</span>
                </div>
            ) : scans.length > 0 ? (
              scans.map((scan) => (
                <MiniScanItem 
                  key={scan.id}
                  name={scan.url}
                  status={scan.status}
                  date={new Date(scan.createdAt).toLocaleDateString()}
                />
              ))
            ) : (
              <div className="glass-card p-12 flex flex-col items-center justify-center border-dashed border-white/5">
                <Globe className="w-12 h-12 text-slate-800 mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No active missions detected.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white tracking-tight">System Health</h3>
          <div className="glass-card p-8 border-white/10 relative overflow-hidden group">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full border-4 border-white/5 flex items-center justify-center mb-6 relative">
                 <div className="absolute inset-0 rounded-full border-4 border-white border-t-transparent" />
                 <span className="text-3xl font-bold">98%</span>
              </div>
              <div className="text-sm font-bold text-white mb-1">Perimeter Secure</div>
              <p className="text-[11px] text-slate-500 leading-relaxed uppercase tracking-widest font-bold">
                 Last scan: 2 mins ago
              </p>
            </div>
          </div>
        </div>
      </div>

      <NewScanModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

function StatCard({ label, value, trend, icon }: any) {
  return (
    <div className="glass-card p-6 border-white/10 hover:border-white/20 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">{label}</span>
        <div className="p-2 rounded-md bg-white/5 text-slate-400 group-hover:text-white transition-colors">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold tracking-tight text-white mb-2">{value}</div>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{trend}</span>
      </div>
    </div>
  );
}

function MiniScanItem({ name, status, date }: any) {
  const statusColors: any = {
    COMPLETED: "text-green-500 bg-green-500/5 border-green-500/10",
    RUNNING: "text-blue-400 bg-blue-400/5 border-blue-400/10 animate-pulse",
    FAILED: "text-red-500 bg-red-500/5 border-red-500/10",
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-[#0c0c0c] border border-white/5 hover:border-white/20 transition-all group cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-white transition-colors">
          <Globe className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white truncate max-w-[200px] mb-0.5">{name}</h4>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{date}</span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase border ${statusColors[status] || "bg-white/5 border-white/10 text-slate-500"}`}>
          {status}
        </div>
        <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
      </div>
    </div>
  );
}
