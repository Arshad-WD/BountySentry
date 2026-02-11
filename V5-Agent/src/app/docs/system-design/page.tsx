"use client";

import Link from "next/link";
import { ArrowLeft, Shield, Network, Cpu, Database, Activity, Lock, FileText } from "lucide-react";

export default function SystemDesignPage() {
  return (
    <div className="min-h-screen bg-black text-slate-300 font-sans selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-16 border-b border-white/10 bg-black/50 backdrop-blur-xl z-50">
        <div className="max-w-5xl mx-auto h-full px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer text-white hover:text-blue-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-white" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">System Design</span>
          </div>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <div className="mb-12 border-b border-white/10 pb-8">
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Sentinel AI - System Design Document</h1>
          <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
            Sentinel AI is an autonomous, distributed security intelligence platform designed for high-velocity auditing and resilient analysis.
          </p>
        </div>

        <section className="space-y-16">
          {/* 1. Architecture */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-blue-500">01.</span> System Architecture Overview
            </h2>
            <p className="leading-relaxed">
              The system follows a modern decoupled architecture with a focus on asynchronous execution and intelligence fallback.
            </p>
            
            <div className="bg-white/[0.02] border border-white/10 rounded-lg p-8 my-8 font-mono text-xs">
              <div className="flex justify-center">
                <div className="space-y-4 text-center w-full max-w-lg">
                  <div className="p-3 border border-white/20 rounded bg-white/5 text-white">Frontend Dashboard (Next.js)</div>
                  <div className="h-6 w-px bg-white/20 mx-auto"></div>
                  <div className="p-3 border border-white/20 rounded bg-white/5 text-white">API Layer (App Router)</div>
                  
                  <div className="grid grid-cols-2 gap-8 pt-4">
                    <div className="space-y-2">
                      <div className="h-8 w-px bg-white/20 mx-auto"></div>
                      <div className="p-3 border border-blue-500/30 rounded bg-blue-500/5 text-blue-200">PostgreSQL / Prisma</div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-8 w-px bg-white/20 mx-auto"></div>
                      <div className="p-3 border border-purple-500/30 rounded bg-purple-500/5 text-purple-200">Autonomous Scanner Engine</div>
                    </div>
                  </div>

                  <div className="pt-8 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-8 bg-purple-500/30"></div>
                    <div className="border border-white/10 rounded-lg p-6 bg-white/[0.01]">
                      <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-4">Agent Intelligence Layer</div>
                      <div className="p-3 border border-white/20 rounded bg-white/5 text-white mb-4">Intelligence Dispatcher</div>
                      <div className="grid grid-cols-3 gap-2 text-[10px]">
                        <div className="p-2 border border-white/10 rounded">OpenAI</div>
                        <div className="p-2 border border-white/10 rounded">Groq/Claude</div>
                        <div className="p-2 border border-white/10 rounded">Ollama</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-center text-slate-600 italic">Simplified Architecture Diagram</p>
            </div>
          </div>

          {/* 2. Core Components */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-blue-500">02.</span> Core Components
            </h2>

            <div className="grid gap-6">
              <div className="p-6 bg-white/[0.02] border border-white/10 rounded-lg hover:border-white/20 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <Cpu className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-bold text-white">2.1 Autonomous Scanner Engine</h3>
                </div>
                <code className="text-xs bg-white/10 px-2 py-0.5 rounded text-purple-200 mb-4 inline-block">scanner.ts</code>
                <p className="text-sm mb-4">The orchestrator of the security mission. It manages the lifecycle of a scan:</p>
                <ul className="space-y-2 text-sm text-slate-400 list-disc pl-4">
                  <li><strong className="text-slate-200">Initialization:</strong> Target validation and mission creation.</li>
                  <li><strong className="text-slate-200">Reconnaissance:</strong> Parallel probing of infrastructure and tech stacks.</li>
                  <li><strong className="text-slate-200">Reasoning:</strong> Concurrent analysis of reconnaissance data using heuristics and LLM intelligence.</li>
                  <li><strong className="text-slate-200">Persistence:</strong> Real-time telemetry logging and database synchronization.</li>
                </ul>
              </div>

              <div className="p-6 bg-white/[0.02] border border-white/10 rounded-lg hover:border-white/20 transition-colors">
                 <div className="flex items-center gap-3 mb-3">
                  <Network className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-bold text-white">2.2 Intelligence Resilience Layer</h3>
                </div>
                <code className="text-xs bg-white/10 px-2 py-0.5 rounded text-blue-200 mb-4 inline-block">AgentSystem.ts</code>
                <p className="text-sm mb-4">A multi-provider resilience model that ensures "Infinite Intelligence":</p>
                <ul className="space-y-2 text-sm text-slate-400 list-disc pl-4">
                  <li><strong className="text-slate-200">Provider Fallback:</strong> Automatic rotation of credentials (API Keys) upon rate-limiting or failure.</li>
                  <li><strong className="text-slate-200">Local Ollama Support:</strong> Support for unrestricted, self-hosted LLM instances.</li>
                  <li><strong className="text-slate-200">Caching Mechanism:</strong> Reduces costs and latency by caching previous reasoning outputs for similar telemetry patterns.</li>
                </ul>
              </div>

              <div className="p-6 bg-white/[0.02] border border-white/10 rounded-lg hover:border-white/20 transition-colors">
                 <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white">2.3 Security Reporting Engine</h3>
                </div>
                <p className="text-sm mb-4">Automated generation of audit trails:</p>
                <ul className="space-y-2 text-sm text-slate-400 list-disc pl-4">
                  <li><strong className="text-slate-200">Markdown Generator:</strong> Structure-aware engine that converts scan findings into professional reports.</li>
                  <li><strong className="text-slate-200">Technical Metadata:</strong> Includes target URL, executive summaries, finding distributions, and evidence logs.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 3. Data Flow */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-blue-500">03.</span> Data Flow (Mission Lifecycle)
            </h2>
            <div className="relative border-l border-white/10 pl-8 space-y-8 ml-4">
              {[
                { title: "Request", desc: "User initiates a scan with a target URL and preferred LLM provider." },
                { title: "Telemetry Phase", desc: "Scanner launches parallel probes (e.g., Robots.txt, Header Probing, Tech Detection)." },
                { title: "Intelligence Phase", desc: "Recon data is handed off to the Reasoning Agent. The Intelligence Dispatcher selects the best provider or falls back to standby." },
                { title: "Audit Phase", desc: "Findings are generated, evaluated against confidence thresholds, and persisted to the findings registry." },
                { title: "Reporting", desc: "Final results are synthesized into a downloadable markdown report." }
              ].map((step, i) => (
                <div key={i} className="relative group">
                  <span className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-black border border-white/20 flex items-center justify-center text-[9px] font-bold text-white group-hover:border-blue-500 group-hover:bg-blue-500/10 transition-colors">
                    {i + 1}
                  </span>
                  <h3 className="text-white font-bold mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-500">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Performance */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-blue-500">04.</span> Performance Optimization Model
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-white/[0.02] border border-white/10 rounded">
                <Activity className="w-5 h-5 text-orange-400 mb-3" />
                <h4 className="text-white font-bold text-sm mb-2">Parallel Probing</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Web and Repository reconnaissance paths are probed concurrently using Promise.all.</p>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/10 rounded">
                <Database className="w-5 h-5 text-pink-400 mb-3" />
                <h4 className="text-white font-bold text-sm mb-2">Concurrent Generation</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Multiple security issues are processed and written to the database in parallel.</p>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/10 rounded">
                <Network className="w-5 h-5 text-cyan-400 mb-3" />
                <h4 className="text-white font-bold text-sm mb-2">HEAD Probing</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Uses HEAD requests for architectural discovery to minimize bandwidth and detect infrastructure without payload overhead.</p>
              </div>
            </div>
          </div>

          {/* Licensing */}
          <div className="border border-white/10 bg-gradient-to-br from-white/[0.02] to-transparent rounded-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-bold text-white">Licensing & Ethical Boundaries</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Compliance Model</h3>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex gap-3">
                    <span className="text-sky-400">target:</span>
                    <span>Restricted to public domains and OSI-approved repositories.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-sky-400">privacy:</span>
                    <span>No analysis of private/proprietary codebases (GitHub CodeQL compatible).</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-sky-400">scope:</span>
                    <span>Educational and research purposes only.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Legal Safeguards</h3>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex gap-3">
                    <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Explicit Consent Required</span>
                  </li>
                  <li className="flex gap-3">
                    <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Provider Terms Compliance</span>
                  </li>
                  <li className="flex gap-3">
                    <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Unrestricted Intelligence Fallback</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </section>
      </main>

      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center text-[10px] uppercase tracking-widest text-slate-600">
          <div>Generated by Sentinel AI Development Agent</div>
          <div>System v0.1.0-alpha</div>
        </div>
      </footer>
    </div>
  );
}
