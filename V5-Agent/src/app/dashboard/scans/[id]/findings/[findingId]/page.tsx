"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    ChevronLeft, 
    ShieldAlert, 
    ShieldCheck, 
    ShieldQuestion, 
    Zap, 
    Activity, 
    Link as LinkIcon, 
    Calendar, 
    Hash, 
    ExternalLink, 
    BookOpen,
    ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import Badge from "@/components/Badge";

export default function FindingDetailPage() {
    const { id, findingId } = useParams();
    const router = useRouter();
    const [finding, setFinding] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFinding = async () => {
            try {
                const res = await fetch(`/api/scan/${id}`);
                const data = await res.json();
                if (data.findings) {
                    const found = data.findings.find((f: any) => f.id === findingId);
                    setFinding(found);
                }
            } catch (error) {
                console.error("Failed to fetch finding:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFinding();
    }, [id, findingId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!finding) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
                <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold italic tracking-tighter">FINDING NOT FOUND</h1>
                <button 
                    onClick={() => router.back()}
                    className="mt-4 text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                    <ChevronLeft className="w-4 h-4" /> Back to mission
                </button>
            </div>
        );
    }

    const s = finding.severity?.toUpperCase();
    const severityColor = 
        s === "CRITICAL" ? "text-red-500" :
        s === "HIGH" ? "text-orange-500" :
        s === "MEDIUM" ? "text-yellow-500" : "text-blue-500";

    const severityBg = 
        s === "CRITICAL" ? "bg-red-500/10 border-red-500/20" :
        s === "HIGH" ? "bg-orange-500/10 border-orange-500/20" :
        s === "MEDIUM" ? "bg-yellow-500/10 border-yellow-500/20" : "bg-blue-500/10 border-blue-500/20";

    return (
        <div className="min-h-screen bg-black text-zinc-100 p-6 md:p-12 font-mono">
            {/* Header / Breadcrumb */}
            <motion.button 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => router.back()}
                className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 text-xs font-bold tracking-[0.2em]"
            >
                <ChevronLeft className="w-4 h-4" /> REGISTRY DATABASE
            </motion.button>

            {/* Main Finding Card */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-white/10 bg-zinc-950 rounded-2xl p-8 mb-8 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-8">
                    <button className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-lg text-xs font-black tracking-widest hover:bg-zinc-200 transition-all uppercase shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                        <Zap className="w-4 h-4 fill-current" /> Re-Verify Discovery
                    </button>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <Badge variant={finding.severity === "Critical" ? "error" : "warning"} className="px-4 py-1.5 text-[10px] uppercase font-black tracking-widest border-2">
                            {finding.severity}
                        </Badge>
                        <span className="text-zinc-500 text-xs font-bold tracking-widest uppercase">{finding.location}</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                        {finding.type}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-[10px] text-zinc-500 font-bold tracking-widest uppercase">
                        <div className="flex items-center gap-2">
                            <LinkIcon className="w-3 h-3" />
                            <span>TARGET CLUSTER REPO</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(finding.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Hash className="w-3 h-3" />
                            <span>MDS: {finding.id.substring(0, 12).toUpperCase()}</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Intelligence Analysis Section */}
                    <div className="space-y-4">
                        <h2 className="text-xs font-black tracking-[0.3em] text-zinc-500 uppercase flex items-center gap-2">
                            <Activity className="w-4 h-4 text-blue-500" /> Intelligence Analysis
                        </h2>
                        
                        <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6 space-y-6">
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                {finding.description}
                            </p>

                            <div className="bg-black/50 border border-white/10 rounded-xl p-5 font-mono text-xs leading-relaxed">
                                <div className="text-zinc-500 mb-4 font-bold select-none">// RAW TELEMETRY DATA</div>
                                <div className="text-blue-400 break-all">
                                    {finding.evidence || "No raw telemetry available for this discovery."}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recommended Neutralization Section */}
                    <div className="space-y-4 pt-4">
                        <h2 className="text-xs font-black tracking-[0.3em] text-zinc-500 uppercase flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-green-500" /> Recommended Neutralization
                        </h2>
                        
                        <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                                    <Zap className="w-5 h-5 text-green-500" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white mb-2 uppercase italic tracking-tight">Active Remediation Action</h4>
                                    <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">
                                        {finding.remediation || "Use secure coding patterns to sanitize all input vectors. Refer to the OWASP guidelines for comprehensive protection."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Metrics */}
                <div className="space-y-8">
                    {/* Discovery Metrics Section */}
                    <div className="space-y-4">
                        <h2 className="text-xs font-black tracking-[0.3em] text-zinc-500 uppercase">Discovery Metrics</h2>
                        <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 space-y-6">
                            {[
                                { label: "Exploitability", value: 74, color: "bg-blue-500" },
                                { label: "System Impact", value: 82, color: "bg-blue-500" },
                                { label: "Agent Reliability", value: 98, color: "bg-blue-500" },
                            ].map((metric) => (
                                <div key={metric.label} className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black tracking-widest text-zinc-500 uppercase">
                                        <span>{metric.label}</span>
                                        <span className="text-white">{metric.value}%</span>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${metric.value}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className={`h-full ${metric.color}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Knowledge Base Section */}
                    <div className="space-y-4">
                        <h2 className="text-xs font-black tracking-[0.3em] text-zinc-500 uppercase">Knowledge Base</h2>
                        <div className="space-y-3">
                            {[
                                { label: "OWASP Mapping", icon: ShieldQuestion },
                                { label: "Remediation Guide", icon: BookOpen },
                            ].map((item) => (
                                <button key={item.label} className="w-full flex items-center justify-between p-4 bg-zinc-950 hover:bg-zinc-900 border border-white/5 rounded-xl group transition-all">
                                    <div className="flex items-center gap-3">
                                        <item.icon className="w-4 h-4 text-zinc-500 group-hover:text-blue-500 transition-colors" />
                                        <span className="text-[10px] font-black tracking-widest text-zinc-400 group-hover:text-white transition-colors uppercase">{item.label}</span>
                                    </div>
                                    <ExternalLink className="w-3 h-3 text-zinc-600 group-hover:text-white transition-colors" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Asset Context */}
                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6">
                        <h3 className="text-[10px] font-black tracking-widest text-blue-500 mb-4 uppercase">Asset Context</h3>
                        <div className="space-y-4 text-xs font-bold uppercase tracking-tight">
                            <div>
                                <div className="text-zinc-600 text-[9px] mb-1 tracking-widest">AFFECTED COMPONENT</div>
                                <div className="text-zinc-300">REPOSITORY ROOT / SRC</div>
                            </div>
                            <div>
                                <div className="text-zinc-600 text-[9px] mb-1 tracking-widest">MISSION PARAMETERS</div>
                                <div className="text-zinc-300">DEEP RECON :: COMPLETED</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
