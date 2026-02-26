"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Terminal, 
  ChevronLeft, 
  RefreshCcw, 
  Search,
  Zap,
  Clock,
  Globe,
  Shield,
  Activity,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export default function ScanDetailPage() {
  const { id } = useParams();
  const [scan, setScan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await fetch(`/api/scan/${id}`);
        const data = await res.json();
        setScan(data);
      } catch (e) {
        console.error("Mission telemetry lost:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
    
    // Poll for updates if the scan is running
    const interval = setInterval(() => {
      if (scan?.status === "RUNNING" || scan?.status === "PENDING") {
        fetchDetails();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [id, scan?.status]);

  useEffect(() => {
    // Scroll logs to bottom
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [scan?.logs]);

  if (loading && !scan) return (
    <DashboardLayout>
      <div className="h-96 flex flex-col items-center justify-center">
        <RefreshCcw className="w-8 h-8 text-white/20 animate-spin mb-4" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Decrypting telemetry...</span>
      </div>
    </DashboardLayout>
  );

  if (!scan) return (
    <DashboardLayout>
      <div className="text-center py-20">
        <h2 className="text-xl font-bold mb-4 uppercase tracking-widest">Mission Telemetry Not Found</h2>
        <Link href="/dashboard/scans" className="secondary-button text-xs font-bold px-8 uppercase tracking-[0.2em] bg-white/5 border-white/10 hover:bg-white text-slate-400 hover:text-black transition-all">
          Return to Registry
        </Link>
      </div>
    </DashboardLayout>
  );

  const statusColors: any = {
    COMPLETED: "text-green-500 border-green-500/20 bg-green-500/5",
    RUNNING: "text-blue-400 border-blue-400/20 bg-blue-400/5 animate-pulse",
    FAILED: "text-red-500 border-red-500/20 bg-red-500/5",
    PENDING: "text-slate-500 border-white/10 bg-white/5",
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <Link href="/dashboard/scans" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-10 group text-[10px] font-black uppercase tracking-widest">
          <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
          Mission Registry
        </Link>

        {/* Hero Section */}
        <div className="bg-black border border-white/10 p-8 md:p-10 mb-8 rounded-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -mr-32 -mt-32" />
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-[0.2em] border ${statusColors[scan.status]}`}>
                  {scan.status}
                </div>
                <span className="text-[10px] font-bold text-slate-700 tracking-widest uppercase font-mono">ID: {scan.id}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-6 uppercase break-all">{scan.url}</h1>
              <div className="flex flex-wrap items-center gap-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <span className="flex items-center gap-2"><Globe className="w-3 h-3 text-white" /> {scan.url.includes("github.com") ? "Source Audit" : "Infrastructure Scan"}</span>
                <span className="flex items-center gap-2"><Clock className="w-3 h-3 text-white" /> {new Date(scan.createdAt).toLocaleString()}</span>
                {scan.findings && (
                  <span className="flex items-center gap-2 text-blue-400"><Shield className="w-3 h-3" /> {scan.findings.length} Vulnerabilities Identified</span>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
               <button className="secondary-button text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                 <RefreshCcw size={12} /> Sync Mission
               </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Telemetry Logs */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-black border border-white/10 rounded-lg overflow-hidden flex flex-col h-[600px]">
              <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Terminal className="w-3 h-3 text-blue-400" /> Mission Telemetry Logs
                </h3>
                {scan.status === "RUNNING" && (
                  <Activity className="w-3 h-3 text-blue-400 animate-pulse" />
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-6 font-mono text-[11px] space-y-2 bg-[#050505]">
                {scan.logs && scan.logs.length > 0 ? (
                  scan.logs.map((log: string, i: number) => (
                    <div key={i} className="flex gap-4 group">
                      <span className="text-slate-800 select-none shrink-0 w-4 text-right">{i + 1}</span>
                      <span className="text-slate-400 leading-relaxed">
                        {log.startsWith("[Finding]") ? (
                          <span className="text-blue-400 font-bold">{log}</span>
                        ) : log.startsWith("Critical Error") ? (
                          <span className="text-red-500 font-bold">{log}</span>
                        ) : (
                          log
                        )}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-700 italic">Initiating neural uplink...</div>
                )}
                <div ref={logEndRef} />
              </div>
              {scan.status === "RUNNING" && (
                <div className="p-4 bg-blue-500/5 text-[10px] text-blue-400 font-bold uppercase tracking-widest text-center border-t border-blue-500/10">
                  Agent is currently processing mission objective...
                </div>
              )}
            </section>
          </div>

          {/* Findings Summary */}
          <div className="space-y-8">
             <section className="bg-black border border-white/10 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Mission Findings</h3>
                </div>
                <div className="p-4 space-y-2">
                  {scan.findings && scan.findings.length > 0 ? (
                    scan.findings.map((finding: any) => (
                      <Link 
                        key={finding.id} 
                        href={`/dashboard/vulnerabilities/${finding.id}`}
                        className="flex items-center justify-between p-3 rounded bg-white/5 border border-white/10 hover:border-white/30 transition-all group"
                      >
                         <div className="flex flex-col gap-1">
                           <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors uppercase truncate max-w-[150px] tracking-tight">{finding.type}</span>
                           <span className={`text-[8px] font-black uppercase tracking-widest ${
                             finding.severity === "CRITICAL" ? "text-red-500" :
                             finding.severity === "HIGH" ? "text-orange-500" :
                             finding.severity === "MEDIUM" ? "text-yellow-500" :
                             "text-blue-500"
                           }`}>
                             {finding.severity} Risk
                           </span>
                         </div>
                         <ArrowUpRight size={14} className="text-slate-700 group-hover:text-white transition-colors" />
                      </Link>
                    ))
                  ) : (
                    <div className="py-10 text-center">
                       <Shield className="w-8 h-8 text-slate-800 mx-auto mb-3" />
                       <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No threats identified.</p>
                    </div>
                  )}
                </div>
             </section>

             <section className="bg-white/5 border border-white/10 p-6 rounded-lg">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Autonomous Intelligence</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  The mission is being analyzed by the Sentinel AI Agent. It uses a combination of Semgrep static audit, pattern heuristics, and LLM-based context reasoning to map attack surfaces.
                </p>
             </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
