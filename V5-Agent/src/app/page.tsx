"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, ShieldAlert, Zap, Globe, Github, Lock, ArrowRight, Terminal, Search, Cpu, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-white/20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-16 border-b border-white/10 bg-black/50 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <Shield className="w-5 h-5 text-white" />
            <span className="text-sm font-black uppercase tracking-[0.3em]">Sentinel AI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Link href="#infrastructure" className="hover:text-white transition-colors">Infrastructure</Link>
            <Link href="#protocols" className="hover:text-white transition-colors">Protocols</Link>
            <Link href="#intelligence" className="hover:text-white transition-colors">Intelligence</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/auth/signin">
              <button className="text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded hover:bg-white/5 transition-all">
                Sign In
              </button>
            </Link>
            <Link href="/auth/signup">
              <button className="bg-white text-black text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded hover:bg-slate-200 transition-all">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center mb-32"
        >
          <div className="px-3 py-1 border border-white/10 rounded-full mb-10 flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Status</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Engine Online</span>
          </div>

          <h1 className="text-4xl md:text-7xl font-bold tracking-tighter mb-8 leading-[1.05] uppercase max-w-4xl">
            Autonomous <br className="hidden md:block" /> Security Intelligence
          </h1>

          <p className="text-sm md:text-base text-slate-500 max-w-xl mb-12 font-medium leading-relaxed uppercase tracking-wide">
            Next-generation autonomous agent designed for continuous perimeter monitoring and proactive vulnerability discovery.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard">
              <button className="bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] py-4 px-10 rounded hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2 shadow-2xl shadow-white/5">
                Initialize Console
              </button>
            </Link>
            <Link href="/docs/system-design">
              <button className="border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.2em] py-4 px-10 rounded hover:bg-white/5 transition-all active:scale-95">
                Technical Blueprint
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Distributed Intelligence Section */}
        <section id="intelligence" className="w-full mb-40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="flex items-center gap-3 text-white/40">
                <Brain className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Distributed Core</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight leading-tight">Infinite Intelligence <br/> via Resilient Fallback</h2>
              <p className="text-slate-500 text-sm font-medium leading-relaxed uppercase tracking-wide">
                Sentinel AI utilizes a multi-provider strategy. If a primary provider is exhausted, the system automatically rotates through standby agents (Ollama, Anthropic, Gemini) to ensure mission completion.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-white/10 rounded bg-white/[0.02]">
                  <div className="text-white font-black text-[10px] uppercase tracking-widest mb-1">Local Ollama</div>
                  <div className="text-slate-600 text-[9px] uppercase font-bold">Unrestricted Logic</div>
                </div>
                <div className="p-4 border border-white/10 rounded bg-white/[0.02]">
                  <div className="text-white font-black text-[10px] uppercase tracking-widest mb-1">Provider Mesh</div>
                  <div className="text-slate-600 text-[9px] uppercase font-bold">Auto-Rotation</div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative p-10 border border-white/10 bg-black rounded-lg hidden lg:block"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />
              <div className="grid grid-cols-3 gap-6 relative z-10">
                {['OpenAI', 'Claude', 'Ollama', 'Gemini', 'Groq', 'Mistral'].map((p) => (
                  <div key={p} className="aspect-square border border-white/10 rounded flex items-center justify-center bg-black/50 overflow-hidden group">
                    <span className="text-[9px] font-black text-white/20 group-hover:text-white transition-colors uppercase tracking-tighter">{p}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* High-Velocity Engine */}
        <section id="infrastructure" className="w-full mb-40">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="flex items-center justify-center gap-3 text-white/40 mb-6">
              <Zap className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Velocity Architecture</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight mb-6">Built for Rapid Reconnaissance</h2>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wide max-w-2xl mx-auto">
              Parallelized infrastructure probing and concurrent vulnerability analysis reduce audit time from hours to minutes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10">
            <FeatureItem 
              icon={<Globe size={20} />}
              title="Parallel Probing"
              description="Concurrent analysis of subdomains, robots.txt, and tech stacks."
            />
            <FeatureItem 
              icon={<Cpu size={20} />}
              title="Batch Processing"
              description="Dozens of security heuristics evaluated in a single mission heart-beat."
            />
            <FeatureItem 
              icon={<Terminal size={20} />}
              title="Async Persistence"
              description="Telemetry stream writes to the database with zero blocking latency."
            />
          </div>
        </section>

        {/* Autonomous Flow */}
        <section id="protocols" className="w-full mb-40">
           <div className="flex flex-col md:flex-row gap-10">
             <div className="md:w-1/3">
                <h3 className="text-2xl font-bold uppercase tracking-tighter mb-4 text-white">Mission <br/> Lifecycle</h3>
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">The Sentinel agent operates in a continuous loop of discovery and reasoning.</p>
             </div>
             <div className="flex-1 space-y-4">
                <WorkflowStep num="01" title="Discovery" text="Parallel crawling of the target surface area to identify infrastructure fingerprints." />
                <WorkflowStep num="02" title="Reasoning" text="Multi-LLM intelligence correlates recon data to map high-impact vulnerabilities." />
                <WorkflowStep num="03" title="Reporting" text="Automated synthesis of findings into professional, evidence-backed reports." />
             </div>
           </div>
        </section>

        {/* Console Mockup */}
        <MissionConsole />
        {/* Compliance & Scope */}
        <section className="w-full mb-40 border-y border-white/5 py-20 px-10 bg-white/[0.01]">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="flex items-center justify-center gap-3 text-white/40 mb-2">
              <Lock className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Global Compliance</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">Ethical Scope & Licensing</h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed uppercase tracking-tight max-w-2xl mx-auto">
              Sentinel AI is engineered for **Educational Research and Open-Source Perimeter Analysis**. 
              In accordance with licensing protocols, the platform does not target private codebases and operates under 
              standard research guidelines.
            </p>
            <div className="flex flex-wrap justify-center gap-8 pt-4 grayscale opacity-40">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">OSI Standards</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Public Domain Focus</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Non-Production</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="pt-40 pb-20 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-20 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <div className="space-y-6">
             <div className="flex items-center gap-2 text-white">
               <Shield size={16} />
               <span className="tracking-[0.2em]">Sentinel</span>
             </div>
             <p className="text-slate-600 font-medium leading-relaxed italic">The perimeter is the product.</p>
          </div>
          <div className="space-y-6">
            <h5 className="text-white">Platform</h5>
            <div className="flex flex-col gap-4">
              <Link href="#infrastructure" className="hover:text-white transition-colors">Infrastructure</Link>
              <Link href="#intelligence" className="hover:text-white transition-colors">Intelligence</Link>
              <Link href="#protocols" className="hover:text-white transition-colors">Protocols</Link>
            </div>
          </div>
          <div className="space-y-6">
            <h5 className="text-white">Engineering</h5>
            <div className="flex flex-col gap-4">
              <Link href="#" className="hover:text-white transition-colors">OSS Agents</Link>
              <Link href="#" className="hover:text-white transition-colors">Benchmark</Link>
              <Link href="#" className="hover:text-white transition-colors">Status</Link>
            </div>
          </div>
          <div className="space-y-6">
            <h5 className="text-white">Legal</h5>
            <div className="flex flex-col gap-4">
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Consent</Link>
              <Link href="#" className="hover:text-white transition-colors">Ethics</Link>
            </div>
          </div>
          <div className="space-y-6 col-span-2 md:col-span-1">
             <div className="flex items-center gap-2 px-3 py-1 border border-green-500/20 bg-green-500/5 text-green-500 rounded-full w-fit">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span>All Systems Operational</span>
             </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 border-t border-white/5 pt-10 text-white/20 text-[10px] font-black uppercase tracking-widest">
          <div>© {new Date().getFullYear()} Precision Protocols · Worldwide Access Enabled</div>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-white transition-colors">Global Registry</Link>
            <Link href="#" className="hover:text-white transition-colors">Mission Nodes</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MissionConsole() {
  const [logs] = useState([
    { time: "16:15:02", type: "USER", text: "sentinel initialize_mission --target perimeter.alpha", color: "text-white" },
    { time: "16:15:03", type: "SYST", text: "Provisioning autonomous agent...", color: "text-slate-500" },
    { time: "16:15:05", type: "ENGN", text: "Analyzing surface area: 12 endpoints detected.", color: "text-slate-500" },
    { time: "16:15:06", type: "RECN", text: "Parallel fingerprinting: Node.js / Next.js / PostgreSQL", color: "text-blue-500/50" },
    { time: "16:15:08", type: "ALRT", text: "Discovery: High-Impact SQL Exposure in /api/mission", color: "text-red-500 font-black uppercase tracking-widest" },
    { time: "16:15:09", type: "INTE", text: "Heuristic correlation: Mapping CVE-2024-X to telemetry.", color: "text-slate-400" },
    { time: "16:15:10", type: "SYST", text: "Reasoning complete. Neutralization roadmap generated.", color: "text-white/60" },
  ]);

  const [visibleLogs, setVisibleLogs] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (currentIndex < logs.length) {
      timeoutId = setTimeout(() => {
        setVisibleLogs((prev) => {
            // Prevent duplicate logs if effect runs twice
            if (prev.length > currentIndex) return prev;
            return [...prev, logs[currentIndex]];
        });
        setCurrentIndex((prev) => prev + 1);
      }, currentIndex === 0 ? 800 : 1200);
    } else {
        // Reset loop with a longer delay
        timeoutId = setTimeout(() => {
            setVisibleLogs([]);
            setCurrentIndex(0);
        }, 8000);
    }

    return () => clearTimeout(timeoutId);
  }, [currentIndex, logs]);

  return (
    <div className="w-full bg-black border border-white/10 rounded-lg overflow-hidden text-left font-mono text-[11px] leading-relaxed shadow-3xl relative backdrop-blur-sm group">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
      <div className="px-4 py-2 border-b border-white/10 bg-white/[0.02] flex items-center justify-between relative z-10 font-sans">
        <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/40" />
            </div>
            <span className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">mission_telemetry_live.bin</span>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-white/20">
            <span className="animate-pulse">Active Instance</span>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
        </div>
      </div>
      <div className="p-10 space-y-4 min-h-[360px] relative z-10">
        {visibleLogs.map((log: any, i: number) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-6"
          >
            <span className="text-white/10 hidden md:inline w-16 shrink-0 font-bold tracking-tighter">[{log.time}]</span>
            <span className="text-white/30 w-12 shrink-0 font-black tracking-widest text-[9px]">{log.type}</span>
            <span className={`flex-1 ${log.color} tracking-tight`}>
                {log.type === "USER" && <span className="mr-3 text-white">➜</span>}
                {log.text}
            </span>
          </motion.div>
        ))}
        <div className="mt-6 flex gap-6">
          <span className="text-white/10 hidden md:inline w-16 shrink-0 font-bold">--:--:--</span>
          <span className="text-white/30 w-12 shrink-0 font-black tracking-widest text-[9px]">WAIT</span>
          <span className="text-white/40 flex items-center gap-1">
             <span className="animate-pulse">➜</span>
             <span className="w-2 h-4 bg-white/20 animate-pulse ml-1" />
          </span>
        </div>
      </div>
      {/* Scanline & Grid Overlays */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%]" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px]" />
    </div>
  );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-black p-12 flex flex-col items-center text-center group">
      <div className="mb-6 text-white group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-4 text-white">{title}</h3>
      <p className="text-[12px] text-slate-500 font-medium leading-relaxed uppercase tracking-wide">
        {description}
      </p>
    </div>
  );
}

function WorkflowStep({ num, title, text }: { num: string; title: string; text: string }) {
  return (
    <div className="flex gap-6 items-start p-6 border border-white/5 bg-white/[0.01] rounded hover:border-white/10 transition-colors group">
      <span className="text-[10px] font-black text-white/20 group-hover:text-white transition-colors mt-1">{num}</span>
      <div>
        <h4 className="text-[11px] font-black uppercase tracking-widest text-white mb-2">{title}</h4>
        <p className="text-[11px] text-slate-500 font-medium leading-relaxed uppercase tracking-tight">{text}</p>
      </div>
    </div>
  );
}

function Brain(props: any) {
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
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .52 8.105 4 4 0 0 0 10 0 4 4 0 0 0 .52-8.105 4 4 0 0 0-2.526-5.77A3 3 0 1 0 12 5z" />
      <path d="M9 13a4.5 4.5 0 0 0 3-4" />
      <path d="M12 13a4.5 4.5 0 0 1-3-4" />
      <path d="M12 13v4" />
      <path d="M12 13a4.5 4.5 0 0 0 3-4" />
      <path d="M15 13a4.5 4.5 0 0 1-3-4" />
    </svg>
  );
}
