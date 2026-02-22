"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  AlertTriangle, 
  ShieldAlert, 
  ChevronLeft, 
  ExternalLink, 
  Terminal, 
  ShieldCheck, 
  Zap,
  Clock,
  Globe,
  ArrowRight,
  Activity,
  Target,
  Fingerprint,
  Bug,
  Crosshair,
  BookOpen,
  FileWarning
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function VulnerabilityDetailPage() {
  const { id } = useParams();
  const [finding, setFinding] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await fetch(`/api/finding/${id}`);
        const data = await res.json();
        setFinding(data);
      } catch (e) {
        console.error("Mission telemetry lost:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [id]);

  if (loading) return (
    <DashboardLayout>
      <div className="h-[80vh] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-cyan-500/20 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          </div>
          <div className="absolute inset-0 w-16 h-16 rounded-full bg-cyan-500/5 animate-ping" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mt-8">Decrypting Intelligence Feed...</span>
      </div>
    </DashboardLayout>
  );

  if (!finding) return (
    <DashboardLayout>
      <div className="text-center py-32">
        <div className="w-20 h-20 rounded-full bg-red-500/5 border border-red-500/10 flex items-center justify-center mx-auto mb-6">
          <FileWarning className="w-8 h-8 text-red-500/50" />
        </div>
        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Target Not Found</h2>
        <p className="text-slate-600 text-sm mb-8">The requested intelligence packet could not be retrieved.</p>
        <Link href="/dashboard/vulnerabilities" className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all">
          <ChevronLeft className="w-3 h-3" /> Return to Registry
        </Link>
      </div>
    </DashboardLayout>
  );

  const sev = finding.severity?.toUpperCase();
  const severityConfig: Record<string, { color: string; bg: string; border: string; glow: string; accent: string }> = {
    CRITICAL: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", glow: "shadow-red-500/20", accent: "from-red-500 to-orange-500" },
    HIGH:     { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", glow: "shadow-orange-500/20", accent: "from-orange-500 to-yellow-500" },
    MEDIUM:   { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", glow: "shadow-yellow-500/20", accent: "from-yellow-500 to-amber-500" },
    LOW:      { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", glow: "shadow-blue-500/20", accent: "from-blue-500 to-cyan-500" },
  };
  const sc = severityConfig[sev] || severityConfig.MEDIUM;

  const exploitability = sev === "CRITICAL" ? 94 : sev === "HIGH" ? 78 : sev === "MEDIUM" ? 52 : 28;
  const systemImpact = sev === "CRITICAL" ? 98 : sev === "HIGH" ? 85 : sev === "MEDIUM" ? 62 : 35;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Breadcrumb */}
        <Link href="/dashboard/vulnerabilities" className="inline-flex items-center gap-2 text-slate-600 hover:text-white transition-colors group text-[10px] font-black uppercase tracking-[0.25em]">
          <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
          Registry Database
        </Link>

        {/* ─── HERO CARD ─── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-black"
        >
          {/* Gradient accent line */}
          <div className={`h-[2px] w-full bg-gradient-to-r ${sc.accent}`} />
          
          {/* Ambient glow */}
          <div className={`absolute -top-20 -right-20 w-60 h-60 rounded-full ${sc.bg} blur-[80px] opacity-60`} />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-cyan-500/5 blur-[60px]" />
          
          <div className="relative p-8 md:p-10">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              <div className="space-y-5 flex-1">
                {/* Badges */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-[0.2em] border ${sc.color} ${sc.border} ${sc.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full bg-current animate-pulse`} />
                    {finding.severity}
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 tracking-widest uppercase font-mono">{finding.location}</span>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-[1.1]">
                  {finding.type}
                </h1>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-5 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3 h-3 text-slate-700" /> {finding.scan?.url || "Unknown Target"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-700" /> {new Date(finding.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-700 font-mono">
                    <Fingerprint className="w-3 h-3" /> {finding.id?.substring(0, 14)}
                  </span>
                </div>
              </div>

              {/* CTA Button */}
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2.5 bg-white text-black px-6 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-[0_0_30px_rgba(255,255,255,0.08)] hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-shadow"
              >
                <Zap className="w-3.5 h-3.5 fill-current" /> Re-Verify Discovery
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ─── 3-COLUMN LAYOUT ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Main Content */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Intelligence Analysis */}
            <motion.section 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-5 flex items-center gap-2.5">
                <Target className="w-3.5 h-3.5 text-cyan-500" /> Intelligence Analysis
              </h2>
              <div className="bg-[#0a0a0a] border border-white/[0.04] rounded-2xl p-7 space-y-6">
                <p className="text-slate-400 text-[13px] leading-[1.8] font-medium">
                  {finding.description}
                </p>
                
                {/* Evidence Terminal */}
                <div className="relative rounded-xl overflow-hidden border border-white/[0.06]">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.04]">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                    </div>
                    <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.3em] ml-2">Raw Telemetry Feed</span>
                  </div>
                  <div className="p-5 bg-black font-mono text-[11px] leading-[1.9]">
                    <div className="text-slate-700 select-none mb-1">$ sentinel --extract-evidence --format=raw</div>
                    <div className="text-cyan-400/80 whitespace-pre-wrap break-all">
                      {finding.evidence || "No raw evidence captured for this discovery vector."}
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Recommended Remediation */}
            <motion.section 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-5 flex items-center gap-2.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Recommended Neutralization
              </h2>
              <div className="bg-[#0a0a0a] border border-white/[0.04] rounded-2xl p-7 space-y-5">
                <RemediationStep 
                  step="01" 
                  label="Primary Action"
                  text={finding.remediation || "Neutralize active misconfigurations in the target surface environment."} 
                  accent="text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                />
                <RemediationStep 
                  step="02" 
                  label="Hardening"
                  text="Implement defense-in-depth security controls and cryptographic hardening across all exposed surfaces." 
                  accent="text-blue-500 bg-blue-500/10 border-blue-500/20"
                />
                <RemediationStep 
                  step="03" 
                  label="Verification"
                  text="Execute post-remediation integrity check to confirm full vulnerability neutralization." 
                  accent="text-purple-500 bg-purple-500/10 border-purple-500/20"
                />
              </div>
            </motion.section>
          </div>

          {/* RIGHT: Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Threat Score */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`rounded-2xl border ${sc.border} ${sc.bg} p-6 relative overflow-hidden`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${sc.accent} opacity-[0.03]`} />
              <div className="relative">
                <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Threat Score</h3>
                <div className="flex items-end gap-3">
                  <span className={`text-5xl font-black italic tracking-tighter ${sc.color}`}>
                    {sev === "CRITICAL" ? "9.8" : sev === "HIGH" ? "7.5" : sev === "MEDIUM" ? "5.2" : "3.1"}
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">/ 10.0</span>
                </div>
                <div className={`text-[8px] font-black uppercase tracking-[0.3em] mt-3 ${sc.color}`}>
                  {sev === "CRITICAL" ? "IMMEDIATE ACTION REQUIRED" : sev === "HIGH" ? "HIGH PRIORITY FIX" : sev === "MEDIUM" ? "SCHEDULED REMEDIATION" : "MONITOR & TRACK"}
                </div>
              </div>
            </motion.div>

            {/* Discovery Metrics */}
            <motion.section 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-5">Discovery Metrics</h3>
              <div className="bg-[#0a0a0a] border border-white/[0.04] rounded-2xl p-6 space-y-6">
                <RiskGauge label="Exploitability" value={exploitability} color="bg-gradient-to-r from-red-500 to-orange-400" />
                <RiskGauge label="System Impact" value={systemImpact} color="bg-gradient-to-r from-orange-500 to-yellow-400" />
                <RiskGauge label="Agent Reliability" value={98} color="bg-gradient-to-r from-cyan-500 to-blue-400" />
              </div>
            </motion.section>

            {/* Knowledge Base */}
            <motion.section 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-5">Knowledge Base</h3>
              <div className="space-y-2">
                <KBLink icon={<ShieldAlert className="w-3.5 h-3.5" />} label="OWASP Mapping" href="https://owasp.org/www-project-top-ten/" />
                <KBLink icon={<BookOpen className="w-3.5 h-3.5" />} label="Remediation Guide" href={`https://www.google.com/search?q=how+to+fix+${finding.type?.replace(/ /g, '+')}`} />
                <KBLink icon={<Bug className="w-3.5 h-3.5" />} label="CWE Definition" href="https://cwe.mitre.org/" />
              </div>
            </motion.section>

            {/* Asset Context */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#0a0a0a] border border-white/[0.04] rounded-2xl p-6"
            >
              <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-5">Asset Context</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-[8px] font-black text-slate-700 uppercase tracking-[0.3em] mb-1.5">Affected Component</div>
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-tight">{finding.location || "Repository Root"}</div>
                </div>
                <div className="h-px bg-white/[0.04]" />
                <div>
                  <div className="text-[8px] font-black text-slate-700 uppercase tracking-[0.3em] mb-1.5">Detection Engine</div>
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-tight">
                    {finding.id?.startsWith("LLM") ? "AI Intelligence" : finding.id?.startsWith("PATTERN") ? "Pattern Scanner" : "Heuristic Engine"}
                  </div>
                </div>
                <div className="h-px bg-white/[0.04]" />
                <div>
                  <div className="text-[8px] font-black text-slate-700 uppercase tracking-[0.3em] mb-1.5">Mission Status</div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-tight">Analysis Complete</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function RemediationStep({ step, label, text, accent }: { step: string; label: string; text: string; accent: string }) {
  return (
    <div className="flex gap-4 group">
      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${accent} transition-all`}>
        <span className="text-[10px] font-black">{step}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-600 mb-1">{label}</div>
        <p className="text-[12px] text-slate-400 font-medium leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function RiskGauge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-2.5">
      <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.2em]">
        <span className="text-slate-600">{label}</span>
        <span className="text-white tabular-nums">{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.2, ease: "circOut", delay: 0.3 }}
          className={`h-full rounded-full ${color}`} 
        />
      </div>
    </div>
  );
}

function KBLink({ icon, label, href }: { icon: React.ReactNode; label: string; href?: string }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="flex items-center justify-between p-3.5 rounded-xl border border-white/[0.04] bg-[#0a0a0a] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-3">
        <span className="text-slate-600 group-hover:text-cyan-500 transition-colors">{icon}</span>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover:text-white transition-colors">{label}</span>
      </div>
      <ArrowRight size={10} className="text-slate-800 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
    </a>
  );
}
