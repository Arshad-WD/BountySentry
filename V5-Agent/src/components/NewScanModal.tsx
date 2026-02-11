"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Globe, Github, AlertCircle, Terminal, RefreshCcw, CheckCircle2, ShieldAlert, Brain, Zap, Shield, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

export default function NewScanModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [scanType, setScanType] = useState<"url" | "repo">("url");
  const [target, setTarget] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [useStaticAnalysis, setUseStaticAnalysis] = useState(true);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

  // Refresh keys from localStorage whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const savedKeys = localStorage.getItem("sentinel_api_keys");
      if (savedKeys) {
        try {
          const parsed = JSON.parse(savedKeys);
          setApiKeys(parsed);
          
          // Auto-select a provider that has a key if current one doesn't
          if (!parsed[selectedProvider]) {
            const firstAvailable = Object.keys(parsed).find(k => parsed[k]);
            if (firstAvailable) setSelectedProvider(firstAvailable);
          }
        } catch (e) {
          console.error("Failed to parse mission credentials");
        }
      }
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!target || !hasConsented) return;
    
    setIsScanning(true);
    setLogs(["Initializing Autonomous Agent..."]);
    setScanProgress(5);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          url: target, 
          type: scanType, 
          consent: hasConsented,
          llmProvider: selectedProvider,
          llmKey: apiKeys[selectedProvider] || "",
          allKeys: apiKeys,
          useStaticAnalysis
        }),
      });

      if (response.ok) {
        const scanData = await response.json();
        const scanId = scanData.id;

        const pollInterval = setInterval(async () => {
            try {
                const res = await fetch(`/api/scan/${scanId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.logs) {
                        setLogs(data.logs);
                    }
                    
                    if (data.status === "COMPLETED") {
                        setScanProgress(100);
                        clearInterval(pollInterval);
                        setTimeout(() => {
                            onClose();
                            window.location.reload();
                        }, 1500);
                    } else if (data.status === "FAILED") {
                        setScanProgress(100);
                        clearInterval(pollInterval);
                        setLogs(prev => [...prev, "Critical Failure: Agent mission aborted."]);
                    } else {
                        const progress = Math.min(95, 10 + (data.logs?.length || 0) * 12);
                        setScanProgress(progress);
                    }
                }
            } catch (e) {
                console.error("Mission telemetry lost:", e);
            }
        }, 1200);
      } else {
          setLogs(["Connection Refused: API handoff failed."]);
          setIsScanning(false);
      }
    } catch (error) {
      console.error("Agent handoff error:", error);
      setIsScanning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!isScanning ? onClose : undefined}
          className="absolute inset-0 bg-black/90"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          className="relative w-full max-w-xl bg-black border border-white/10 rounded-lg overflow-hidden flex flex-col shadow-2xl"
        >
          {isScanning ? (
            <div className="flex flex-col h-[450px]">
                <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Terminal className="w-4 h-4 text-white" />
                        <h2 className="text-sm font-bold uppercase tracking-widest">Agent Mission Console</h2>
                    </div>
                </div>

                <div className="flex-1 bg-[#050505] p-6 font-mono text-[12px] overflow-y-auto space-y-1.5 scrollbar-none">
                    {logs.map((log, i) => (
                        <div key={i} className="flex gap-3">
                            <span className="text-slate-600">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                            <span className={log.includes("Finding") || log.includes("Critical") ? "text-red-500 font-bold" : "text-slate-300"}>
                                <span className="opacity-50 mr-2">➜</span>{log}
                            </span>
                        </div>
                    ))}
                    {scanProgress < 100 && (
                        <div className="flex gap-2 text-white/50 bg-white/5 px-2 py-1 rounded w-fit mt-4">
                             <RefreshCcw className="w-3 h-3 animate-spin" />
                             <span className="text-[10px] font-bold uppercase tracking-widest">Autonomous Reasoning...</span>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-black border-t border-white/5">
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-white"
                            animate={{ width: `${scanProgress}%` }}
                        />
                    </div>
                </div>
            </div>
          ) : (
            <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white mb-1 uppercase tracking-widest">Initialize Mission</h2>
                        <p className="text-slate-500 text-xs font-medium uppercase">Provisioning agent for security audit.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded transition-colors text-slate-500 hover:text-white">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-2">
                        <SelectionButton 
                            active={scanType === "url"} 
                            onClick={() => setScanType("url")}
                            icon={<Globe size={16} />}
                            label="Web Infrastructure"
                        />
                        <SelectionButton 
                            active={scanType === "repo"} 
                            onClick={() => setScanType("repo")}
                            icon={<Github size={16} />}
                            label="Security Repo Audit"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block">
                               Target Authorization
                            </label>
                            <input 
                                type="text" 
                                value={target}
                                onChange={(e) => setTarget(e.target.value)}
                                placeholder={scanType === "url" ? "https://example.com" : "github.com/org/repo"}
                                className="w-full bg-black border border-white/20 rounded px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors placeholder:text-slate-700"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block">
                               Intelligence Synergy
                            </label>
                            <select 
                                value={selectedProvider}
                                onChange={(e) => setSelectedProvider(e.target.value)}
                                className="w-full bg-black border border-white/20 rounded px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors cursor-pointer appearance-none"
                            >
                                <option value="openai">OpenAI (GPT-4o)</option>
                                <option value="anthropic">Anthropic (Claude 3.5)</option>
                                <option value="google">Google Gemini Pro</option>
                                <option value="groq">Groq (Llama 3)</option>
                                <option value="openrouter">OpenRouter (Universal)</option>
                            </select>
                            {!apiKeys[selectedProvider] && (
                                <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest mt-1">
                                    [!] Mission credential missing in system settings
                                </p>
                            )}
                        </div>

                        {scanType === "repo" && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block">
                                   Analysis Depth
                                </label>
                                <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded">
                                    <div className="flex items-center gap-3">
                                        <Zap className={`w-4 h-4 ${useStaticAnalysis ? "text-yellow-400" : "text-slate-600"}`} />
                                        <div>
                                            <div className="text-white text-[12px] font-bold uppercase tracking-wide">Deep Static Analysis</div>
                                            <div className="text-[10px] text-slate-500">Enable Semgrep / Pattern Engine (Slower)</div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setUseStaticAnalysis(!useStaticAnalysis)}
                                        className={`w-10 h-5 rounded-full relative transition-colors ${useStaticAnalysis ? "bg-white" : "bg-white/10"}`}
                                    >
                                        <motion.div 
                                            animate={{ x: useStaticAnalysis ? 20 : 2 }}
                                            className="absolute top-1 left-0 w-3 h-3 rounded-full bg-black"
                                        />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="p-4 bg-white/5 border border-white/5 rounded flex gap-4">
                            <ShieldAlert className="w-4 h-4 text-white shrink-0 mt-0.5" />
                            <div className="space-y-2">
                                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                                    <span className="text-white font-bold">Authorized Mission:</span> By proceeding, you verify full legal authorization to audit this target. All agent activities are logged and trace verified.
                                </p>
                                <p className="text-[10px] text-red-400 font-bold leading-relaxed uppercase tracking-tight">
                                    [!] Licensing Protocol: This platform is for Open-Source & Educational use. Corporate/Private audits are restricted by CodeQL licensing terms.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                                hasConsented ? "bg-white border-white" : "border-white/20"
                            }`}>
                                {hasConsented && <CheckCircle2 className="w-3 h-3 text-black" />}
                            </div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Accept ethical protocols</span>
                            <input 
                                type="checkbox" 
                                className="hidden" 
                                checked={hasConsented}
                                onChange={(e) => setHasConsented(e.target.checked)}
                            />
                        </label>
                        <button 
                            disabled={!target || !hasConsented}
                            onClick={handleSubmit}
                            className="bg-white text-black text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-30 disabled:hover:bg-white"
                        >
                            Initialize Mission
                        </button>
                    </div>
                </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function SelectionButton({ active, onClick, icon, label }: any) {
    return (
        <button 
            onClick={onClick}
            className={`px-4 py-3 rounded border flex items-center gap-3 transition-all ${
                active 
                    ? "bg-white/10 border-white text-white shadow-xl" 
                    : "bg-transparent border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300"
            }`}
        >
            <div className={active ? "text-white" : "text-slate-600"}>
                {icon}
            </div>
            <span className="font-bold text-[10px] uppercase tracking-widest">{label}</span>
        </button>
    );
}
