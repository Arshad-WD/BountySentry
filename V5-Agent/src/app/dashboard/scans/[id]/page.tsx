"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Shield, 
  ChevronLeft, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Globe, 
  Github, 
  Terminal,
  FileText,
  BarChart3,
  Cpu,
  Zap,
  ArrowRight
} from "lucide-react";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Badge from "@/components/Badge";

export default function ScanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [scan, setScan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScan() {
      try {
        const response = await fetch(`/api/scan/${id}`);
        const data = await response.json();
        setScan(data);
      } catch (e) {
        console.error("Failed to fetch scan details", e);
      } finally {
        setLoading(false);
      }
    }
    fetchScan();

    // Poll for updates if running
    const interval = setInterval(() => {
      if (scan?.status === "RUNNING") fetchScan();
    }, 5000);
    return () => clearInterval(interval);
  }, [id, scan?.status]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Activity className="w-8 h-8 text-cyan-500 animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-animate">Initializing telemetry data...</p>
    </div>
  );

  if (!scan) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-6" />
        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Access Denied</h2>
        <p className="text-slate-500 text-sm mb-8">The requested mission parameters could not be retrieved.</p>
        <Link href="/dashboard/scans" className="px-6 py-3 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5 hover:bg-white/10 transition-all">
            Return to Command Center
        </Link>
    </div>
  );

  const isGithub = scan.url?.includes("github.com");
  const statusColors: any = {
    COMPLETED: "text-green-400 border-green-500/20 bg-green-500/5",
    RUNNING: "text-blue-400 border-blue-500/20 bg-blue-500/5",
    FAILED: "text-red-400 border-red-500/20 bg-red-500/5",
    PENDING: "text-slate-500 border-white/10 bg-white/5",
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/scans" className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500">
            <ChevronLeft size={20} />
        </Link>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            <span className="text-slate-600">Missions</span>
            <span className="text-slate-800">/</span>
            <span className="text-white">Analysis Details</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-black border border-white/[0.06] rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
                <Badge variant={scan.status === 'COMPLETED' ? 'success' : scan.status === 'FAILED' ? 'error' : 'default'} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${scan.status === 'RUNNING' ? 'bg-blue-400 animate-pulse' : scan.status === 'COMPLETED' ? 'bg-green-400' : 'bg-red-400'}`} />
                    {scan.status}
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-4">
                    {isGithub ? <Github className="text-slate-400" /> : <Globe className="text-slate-400" />}
                    {new URL(scan.url).hostname}
                </h1>
                <p className="text-slate-500 font-mono text-sm max-w-2xl truncate bg-white/[0.02] p-2 rounded-lg border border-white/5 italic">
                    {scan.url}
                </p>
            </div>
            <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Mission ID</p>
                    <p className="text-xs font-mono text-white/50">{scan.id}</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12 border-t border-white/[0.06] pt-8">
            <StatCard label="Critical Issues" value={scan.findings?.filter((f: any) => f.severity === 'Critical').length || 0} color="text-red-500" />
            <StatCard label="High Risk" value={scan.findings?.filter((f: any) => f.severity === 'High').length || 0} color="text-orange-500" />
            <StatCard label="Medium Risk" value={scan.findings?.filter((f: any) => f.severity === 'Medium').length || 0} color="text-yellow-500" />
            <StatCard label="Execution Time" value={scan.updatedAt && scan.createdAt ? `${Math.round((new Date(scan.updatedAt).getTime() - new Date(scan.createdAt).getTime()) / 1000)}s` : '...'} color="text-cyan-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Logs */}
        <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-3">
                    <Terminal size={14} className="text-cyan-500" />
                    Technical Telemetry
                </h3>
            </div>
            <div className="bg-black border border-white/[0.06] rounded-2xl p-6 font-mono text-xs space-y-2 h-[500px] overflow-y-auto scrollbar-hide">
                {scan.logs?.map((log: string, i: number) => (
                    <div key={i} className="flex gap-4 group">
                        <span className="text-slate-700 min-w-[30px] select-none">{(i + 1).toString().padStart(2, '0')}</span>
                        <span className={`flex-1 ${log.includes('[Finding]') ? 'text-red-400 font-bold' : log.includes('COMPLETE') ? 'text-green-400' : 'text-slate-400'}`}>
                            {log}
                        </span>
                    </div>
                ))}
                {scan.status === "RUNNING" && (
                     <div className="flex gap-4 animate-pulse">
                        <span className="text-slate-700 min-w-[30px]">{(scan.logs?.length || 0) + 1}</span>
                        <span className="text-cyan-500 font-black">ANALYSIS_DAEMON_PROBING_ACTIVE_...</span>
                    </div>
                )}
            </div>
        </div>

        {/* Intelligence Breakdown */}
        <div className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-3">
                <Shield size={14} className="text-brand-accent" />
                Vulnerability Surface
                {scan.findings?.length > 0 && (
                    <span className="text-white bg-white/10 px-2 py-0.5 rounded-full text-[8px]">{scan.findings.length}</span>
                )}
            </h3>
            <div className="space-y-5">
                {scan.findings?.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                        <CheckCircle2 className="w-8 h-8 text-green-500/20 mx-auto mb-3" />
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No active threats detected</p>
                    </div>
                ) : (
                    scan.findings.sort((a: any, b: any) => {
                        const order: Record<string, number> = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
                        return (order[a.severity] ?? 9) - (order[b.severity] ?? 9);
                    }).map((finding: any, i: number) => {
                        const sevColor = finding.severity === 'Critical' ? 'red' : finding.severity === 'High' ? 'orange' : finding.severity === 'Medium' ? 'yellow' : 'blue';
                        const exploitScore = finding.severity === 'Critical' ? 94 : finding.severity === 'High' ? 76 : finding.severity === 'Medium' ? 52 : 28;
                        const impactScore = finding.severity === 'Critical' ? 98 : finding.severity === 'High' ? 84 : finding.severity === 'Medium' ? 60 : 32;
                        
                        return (
                        <div 
                            key={i} 
                            className={`bg-black border border-${sevColor}-500/10 rounded-2xl overflow-hidden`}
                        >
                            {/* Severity Accent */}
                            <div className={`h-[2px] bg-gradient-to-r from-${sevColor}-500 to-${sevColor}-500/30`} />
                            
                            <div className="p-6 space-y-5">
                                {/* Header */}
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[8px] font-black px-2.5 py-1 rounded-md uppercase tracking-[0.15em] bg-${sevColor}-500/15 text-${sevColor}-400 border border-${sevColor}-500/20`}>
                                                {finding.severity}
                                            </span>
                                            {finding.location && (
                                                <span className="text-[9px] font-mono text-slate-600 truncate max-w-[200px]">{finding.location}</span>
                                            )}
                                        </div>
                                        <h4 className="text-lg font-black text-white uppercase tracking-tight">{finding.type}</h4>
                                    </div>
                                    <span className="text-[8px] font-mono text-slate-700 bg-white/[0.03] px-2 py-1 rounded">#{finding.id?.substring(0, 8)}</span>
                                </div>

                                {/* Description */}
                                <p className="text-[12px] text-slate-400 leading-[1.8] font-medium">{finding.description}</p>

                                {/* Evidence Terminal */}
                                {finding.evidence && (
                                    <div className="rounded-xl overflow-hidden border border-white/[0.04]">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.02] border-b border-white/[0.03]">
                                            <div className="flex gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-red-500/40" />
                                                <div className="w-2 h-2 rounded-full bg-yellow-500/40" />
                                                <div className="w-2 h-2 rounded-full bg-green-500/40" />
                                            </div>
                                            <span className="text-[7px] font-black text-slate-700 uppercase tracking-[0.3em] ml-1">Evidence</span>
                                        </div>
                                        <div className="p-4 bg-[#050505] font-mono text-[10px] leading-[1.8] text-cyan-400/80 whitespace-pre-wrap break-all max-h-32 overflow-y-auto">
                                            {finding.evidence}
                                        </div>
                                    </div>
                                )}

                                {/* Metrics Row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white/[0.02] rounded-xl p-3 space-y-2">
                                        <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.2em]">
                                            <span className="text-slate-600">Exploitability</span>
                                            <span className="text-white">{exploitScore}%</span>
                                        </div>
                                        <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                                            <div className={`h-full bg-${sevColor}-500 rounded-full`} style={{ width: `${exploitScore}%` }} />
                                        </div>
                                    </div>
                                    <div className="bg-white/[0.02] rounded-xl p-3 space-y-2">
                                        <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.2em]">
                                            <span className="text-slate-600">Impact</span>
                                            <span className="text-white">{impactScore}%</span>
                                        </div>
                                        <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                                            <div className={`h-full bg-${sevColor}-500 rounded-full`} style={{ width: `${impactScore}%` }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Footer: View Full Details */}
                                <Link 
                                    href={`/dashboard/scans/${id}/findings/${finding.id}`}
                                    className="flex items-center justify-between pt-3 border-t border-white/[0.04] group/link"
                                >
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.25em] group-hover/link:text-white transition-colors">Full Intelligence Report</span>
                                    <ArrowRight size={12} className="text-slate-700 group-hover/link:text-cyan-500 group-hover/link:translate-x-0.5 transition-all" />
                                </Link>
                            </div>
                        </div>
                        );
                    })
                )}
            </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ label, value, color }: any) {
    return (
        <div className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl group hover:border-white/10 transition-all">
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1 group-hover:text-slate-400">{label}</p>
            <p className={`text-2xl font-black italic tracking-tighter ${color}`}>{value}</p>
        </div>
    );
}

