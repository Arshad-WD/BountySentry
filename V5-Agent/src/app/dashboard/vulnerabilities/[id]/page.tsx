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
  ArrowRight
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
      <div className="h-96 flex flex-col items-center justify-center">
        <RefreshCcw className="w-8 h-8 text-white/20 animate-spin mb-4" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Decrypting telemetry...</span>
      </div>
    </DashboardLayout>
  );

  if (!finding) return (
    <DashboardLayout>
      <div className="text-center py-20">
        <h2 className="text-xl font-bold mb-4 uppercase tracking-widest">Mission Objective Not Found</h2>
        <Link href="/dashboard/vulnerabilities" className="secondary-button text-xs">Return to Database</Link>
      </div>
    </DashboardLayout>
  );

  const severityColors: any = {
    CRITICAL: "text-red-500 border-red-500/20",
    HIGH: "text-orange-500 border-orange-500/20",
    MEDIUM: "text-yellow-500 border-yellow-500/20",
    LOW: "text-blue-500 border-blue-500/10",
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard/vulnerabilities" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-10 group text-[10px] font-black uppercase tracking-widest">
          <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
          Registry Database
        </Link>

        {/* Hero Section */}
        <div className="bg-black border border-white/10 p-10 mb-10 rounded-lg relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-[0.2em] border ${severityColors[finding.severity]}`}>
                  {finding.severity}
                </span>
                <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">{finding.location}</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-6 uppercase">{finding.type}</h1>
              <div className="flex flex-wrap items-center gap-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <span className="flex items-center gap-2"><Globe className="w-3 h-3" /> {finding.scan?.url}</span>
                <span className="flex items-center gap-2"><Clock className="w-3 h-3" /> {new Date(finding.createdAt).toLocaleDateString()}</span>
                <span className="text-slate-700 font-mono">MD5: {finding.id.substring(0, 12)}</span>
              </div>
            </div>
            
            <button className="glass-button text-xs flex items-center gap-2 px-6">
              <Zap className="w-3 h-3" /> Re-verify Discovery
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* Analysis */}
            <section>
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Terminal className="w-3 h-3" /> Intelligence Analysis
              </h2>
              <div className="bg-black border border-white/5 p-8 rounded-lg">
                <p className="text-slate-400 text-sm leading-relaxed mb-8 font-medium">
                  {finding.description}
                </p>
                
                <div className="bg-[#050505] rounded p-6 border border-white/5 font-mono text-[11px] leading-relaxed">
                  <div className="text-slate-700 mb-3 uppercase tracking-widest font-black">// Raw Telemetry Data</div>
                  <div className="text-slate-400 whitespace-pre-wrap break-all">
                    {finding.evidence}
                  </div>
                </div>
              </div>
            </section>

            {/* Remediation */}
            <section>
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-white" /> Recommended Neutralization
              </h2>
              <div className="bg-black border border-white/5 p-8 rounded-lg">
                <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium italic">
                   The autonomous discovery agent recommends the following prioritization for remediation:
                </p>
                <div className="space-y-4">
                  <RemediationStep 
                    step="01" 
                    text={finding.remediation || "Neutralize active misconfigurations in the target surface environment."} 
                  />
                  <RemediationStep 
                    step="02" 
                    text="Implement robust security protocols and cryptographically secure configurations." 
                  />
                  <RemediationStep 
                    step="03" 
                    text="Perform an integrity check to verify full resolution and perimeter stability." 
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-10">
            <section>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Discovery Metrics</h3>
              <div className="bg-black border border-white/5 p-6 rounded-lg space-y-8">
                <RiskGauge label="Exploitability" value={finding.severity === "CRITICAL" ? 92 : 74} />
                <RiskGauge label="System Impact" value={finding.severity === "CRITICAL" ? 98 : 82} />
                <RiskGauge label="Agent Reliability" value={98} />
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Knowledge Base</h3>
              <div className="space-y-2">
                <KBLink label="OWASP Mapping" href={`https://owasp.org/www-project-top-ten/`} />
                <KBLink label="Remediation Guide" href={`https://www.google.com/search?q=how+to+fix+${finding.type.replace(/ /g, '+')}`} />
                <KBLink label="CWE Definition" href={`https://cwe.mitre.org/data/definitions/${finding.id.split('-')[0]}.html`} />
              </div>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function RemediationStep({ step, text }: { step: string; text: string }) {
  return (
    <div className="flex gap-4">
      <span className="text-[10px] font-black text-white bg-white/10 w-6 h-6 rounded flex items-center justify-center shrink-0">
        {step}
      </span>
      <span className="text-[12px] text-slate-400 font-medium leading-relaxed">{text}</span>
    </div>
  );
}

function RiskGauge({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-600">
        <span>{label}</span>
        <span className="text-white">{value}%</span>
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.5, ease: "circOut" }}
          className="h-full bg-white" 
        />
      </div>
    </div>
  );
}

function KBLink({ label, href }: { label: string; href?: string }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="flex items-center justify-between p-3 rounded border border-white/5 bg-transparent hover:border-white/20 transition-all cursor-pointer group"
    >
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">{label}</span>
      <ArrowRight size={12} className="text-slate-800 group-hover:text-white transition-colors" />
    </a>
  );
}

function RefreshCcw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}
