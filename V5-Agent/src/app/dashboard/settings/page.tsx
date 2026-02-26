"use client";

import { 
  Settings as SettingsIcon, 
  Database, 
  Key, 
  Shield, 
  Bell, 
  Cpu,
  Save,
  ChevronRight,
  Brain,
  Eye,
  EyeOff,
  Zap,
  RefreshCcw,
  Trash2,
  Lock,
  CheckCircle2,
  AlertCircle,
  Crosshair,
  Layers,
  Activity,
  Sparkles
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function detectProviderFromKey(key: string): string | null {
  if (!key || key.trim().length === 0) return null;
  const k = key.trim();
  if (k.startsWith("sk-ant-")) return "anthropic";
  if (k.startsWith("sk-or-")) return "openrouter";
  if (k.startsWith("sk-")) return "openai";
  if (k.startsWith("gsk_")) return "groq";
  if (k.startsWith("http://localhost") || k.startsWith("http://127.0.0.1")) return "ollama";
  if (k.startsWith("AI") && k.length >= 35) return "google";
  if (k.length === 32 && /^[a-zA-Z0-9]+$/.test(k)) return "mistral";
  return null;
}

export default function SettingsPage() {
  const [showKey, setShowKey] = useState(false);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [activeTab, setActiveTab] = useState("agent");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [defaultEngine, setDefaultEngine] = useState("codeql");
  const [defaultMode, setDefaultMode] = useState("full");

  useEffect(() => {
    const savedKeys = localStorage.getItem("sentinel_api_keys");
    if (savedKeys) {
      try {
        setApiKeys(JSON.parse(savedKeys));
      } catch (e) {
        console.error("Failed to parse saved keys");
      }
    }
    const savedEngine = localStorage.getItem("sentinel_default_engine");
    if (savedEngine) setDefaultEngine(savedEngine);
    const savedMode = localStorage.getItem("sentinel_default_mode");
    if (savedMode) setDefaultMode(savedMode);
  }, []);

  const handleKeyChange = (providerId: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [providerId]: value }));
  };

  const handleSave = () => {
    setSaving(true);
    localStorage.setItem("sentinel_api_keys", JSON.stringify(apiKeys));
    localStorage.setItem("sentinel_default_engine", defaultEngine);
    localStorage.setItem("sentinel_default_mode", defaultMode);
    setTimeout(() => {
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 600);
  };

  const handleRevoke = (providerId: string) => {
    const newKeys = { ...apiKeys };
    delete newKeys[providerId];
    setApiKeys(newKeys);
    localStorage.setItem("sentinel_api_keys", JSON.stringify(newKeys));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to purge all stored credentials? This action cannot be undone.")) {
      setApiKeys({});
      localStorage.removeItem("sentinel_api_keys");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const providers = [
    { id: "ollama", name: "Ollama", model: "Local (Infinite)", icon: "🏠", color: "#22c55e" },
    { id: "openai", name: "OpenAI", model: "GPT-4o", icon: "⚡", color: "#10b981" },
    { id: "anthropic", name: "Anthropic", model: "Claude 3.5", icon: "🧠", color: "#8b5cf6" },
    { id: "google", name: "Google", model: "Gemini 1.5 Pro", icon: "🔮", color: "#3b82f6" },
    { id: "groq", name: "Groq", model: "Llama 3 (Fast)", icon: "🚀", color: "#f97316" },
    { id: "openrouter", name: "OpenRouter", model: "Universal (Free)", icon: "🌐", color: "#06b6d4" },
    { id: "mistral", name: "Mistral", model: "Mistral Large", icon: "💎", color: "#ec4899" },
    { id: "sentinelx", name: "SentinelX", model: "Shannon (Auto)", icon: "🎯", color: "#ef4444" },
  ];

  const connectedCount = Object.values(apiKeys).filter(v => v && v.length > 0).length;

  const tabs = [
    { id: "agent", icon: <Cpu size={14} />, label: "Engine Config" },
    { id: "llm", icon: <Brain size={14} />, label: "Intelligence" },
    { id: "keys", icon: <Key size={14} />, label: "Credentials" },
  ];

  return (
    <>
      {/* Header */}
      <header className="relative mb-5 pb-5 border-b border-white/5">
        <div className="absolute -top-20 right-0 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-3">
              <SettingsIcon size={14} className="text-violet-400" />
              <span className="text-[10px] font-black text-violet-400 uppercase tracking-[0.2em]">Configuration</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="text-4xl font-bold tracking-tight text-white mb-2"
            >
              System <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Settings</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-slate-500 text-sm">
              Configure engine parameters and autonomous agent behavior.
            </motion.p>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex items-center gap-3">
            <AnimatePresence>
              {saveSuccess && (
                <motion.div 
                  initial={{ opacity: 0, x: 10, scale: 0.95 }} 
                  animate={{ opacity: 1, x: 0, scale: 1 }} 
                  exit={{ opacity: 0, x: 10, scale: 0.95 }}
                  className="flex items-center gap-2 text-green-400 text-[10px] font-black uppercase tracking-widest bg-green-500/10 border border-green-500/20 px-4 py-2.5 rounded-xl"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized
                </motion.div>
              )}
            </AnimatePresence>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-[0.97] disabled:opacity-50"
            >
              {saving ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} 
              {saving ? "Encrypting..." : "Save All"}
            </button>
          </motion.div>
        </div>
      </header>

      {/* Tab Navigation */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="flex gap-1 p-1 bg-white/[0.02] border border-white/5 rounded-xl mb-5 w-fit"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg transition-all text-[9px] font-black uppercase tracking-widest ${
              activeTab === tab.id
                ? "bg-white text-black shadow-lg"
                : "text-slate-500 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === "agent" && (
          <motion.div 
            key="agent"
            initial={{ opacity: 0, y: 8 }} 
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {/* Engine Selection */}
            <div className="bg-black border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.04] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                  <Cpu className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xs font-black text-white uppercase tracking-widest">Default Analysis Engine</h2>
                  <p className="text-[10px] text-slate-600 mt-0.5">Pre-selected engine for new scan missions</p>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <button
                    onClick={() => setDefaultEngine("codeql")}
                    className={`p-4 rounded-xl border transition-all ${ 
                      defaultEngine === "codeql"
                        ? "bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/30 shadow-lg shadow-blue-500/5"
                        : "bg-white/[0.02] border-white/5 hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${defaultEngine === "codeql" ? "bg-blue-500/20" : "bg-white/5"}`}>
                        <Shield className={`w-4 h-4 ${defaultEngine === "codeql" ? "text-blue-400" : "text-slate-600"}`} />
                      </div>
                      <div className="text-left">
                        <div className={`text-sm font-bold tracking-tight ${defaultEngine === "codeql" ? "text-white" : "text-slate-400"}`}>CodeQL Engine</div>
                        <div className="text-[8px] text-slate-600 uppercase tracking-widest">Rule-Based Detection</div>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed text-left">Deterministic rule engine with pattern matching for OWASP detection.</p>
                  </button>
                  <button
                    onClick={() => setDefaultEngine("sentinelx")}
                    className={`p-4 rounded-xl border transition-all ${
                      defaultEngine === "sentinelx"
                        ? "bg-gradient-to-br from-red-500/10 to-orange-500/5 border-red-500/30 shadow-lg shadow-red-500/5"
                        : "bg-white/[0.02] border-white/5 hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${defaultEngine === "sentinelx" ? "bg-red-500/20" : "bg-white/5"}`}>
                        <Crosshair className={`w-4 h-4 ${defaultEngine === "sentinelx" ? "text-red-400" : "text-slate-600"}`} />
                      </div>
                      <div className="text-left">
                        <div className={`text-sm font-bold tracking-tight ${defaultEngine === "sentinelx" ? "text-white" : "text-slate-400"}`}>SentinelX Engine</div>
                        <div className="text-[8px] text-slate-600 uppercase tracking-widest">AI Pentesting</div>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed text-left">Autonomous AI pentester with exploit validation and reasoning.</p>
                  </button>
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">Default Scan Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "full", label: "Full Audit", icon: <Layers size={13} />, desc: "Static + Dynamic" },
                      { id: "static", label: "Static Only", icon: <Shield size={13} />, desc: "Code Scanning" },
                      { id: "dynamic", label: "Dynamic Only", icon: <Activity size={13} />, desc: "Recon + LLM" },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setDefaultMode(mode.id)}
                        className={`p-3 rounded-xl border transition-all text-left ${
                          defaultMode === mode.id
                            ? "bg-white/10 border-white/20 text-white"
                            : "bg-white/[0.02] border-white/5 text-slate-500 hover:border-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-0.5">
                          {mode.icon}
                          <span className="text-[9px] font-black uppercase tracking-widest">{mode.label}</span>
                        </div>
                        <span className="text-[8px] opacity-50">{mode.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Parameters */}
            <div className="bg-black border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.04] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center border border-white/10">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <h2 className="text-xs font-black text-white uppercase tracking-widest">Agent Parameters</h2>
              </div>
              <div className="p-5 space-y-5">
                <SettingItem 
                  title="Max Analysis Depth" 
                  description="How deep should the agent probe the application surface."
                  control={
                    <select className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-white/30 transition-colors">
                      <option>Standard (3 layers)</option>
                      <option>Deep (10 layers)</option>
                      <option>Infinite (Enterprise)</option>
                    </select>
                  }
                />
                <SettingItem 
                  title="Confidence Threshold" 
                  description="Findings below this level go to secondary audit log."
                  control={<input type="range" className="w-32 accent-white bg-white/10" />}
                />
                <SettingItem 
                  title="Mandatory Consent" 
                  description="Require user certification for every scan mission."
                  control={
                    <div className="w-10 h-5 rounded-full bg-white flex items-center px-1 cursor-pointer">
                      <div className="w-3.5 h-3.5 rounded-full bg-black ml-auto" />
                    </div>
                  }
                />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "llm" && (
          <motion.div 
            key="llm"
            initial={{ opacity: 0, y: 8 }} 
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div className="bg-black border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center border border-white/10">
                    <Brain className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-xs font-black text-white uppercase tracking-widest">Intelligence Providers</h2>
                    <p className="text-[10px] text-slate-600 mt-0.5">{connectedCount} of {providers.length} connected</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">{connectedCount > 0 ? "Online" : "Offline"}</span>
                </div>
              </div>

              <div className="p-5">
                {/* Provider Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-5">
                  {providers.map((provider) => {
                    const hasKey = !!apiKeys[provider.id];
                    return (
                      <button 
                        key={provider.id}
                        onClick={() => setSelectedProvider(provider.id)}
                        className={`p-3 rounded-xl border transition-all text-left relative overflow-hidden ${
                          selectedProvider === provider.id
                            ? "border-white/20 bg-white/5 text-white ring-1 ring-white/10"
                            : "border-white/5 bg-white/[0.01] text-slate-500 hover:border-white/10 hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 mb-1">
                          <span className="text-sm">{provider.icon}</span>
                          <span className="font-bold text-[10px] tracking-tight">{provider.name}</span>
                        </div>
                        <div className="text-[8px] uppercase tracking-widest opacity-50">{provider.model}</div>
                        {hasKey && (
                          <div className="absolute top-2.5 right-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Key Input */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                      {selectedProvider === "ollama" ? "Instance URL" : `${providers.find(p => p.id === selectedProvider)?.name} API Key`}
                    </label>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const currentKey = apiKeys[selectedProvider];
                        const detected = currentKey ? detectProviderFromKey(currentKey) : null;
                        if (detected && detected !== selectedProvider) {
                          return (
                            <span className="text-[8px] font-black text-yellow-400 uppercase tracking-widest bg-yellow-400/10 px-2 py-1 rounded-lg flex items-center gap-1">
                              <Zap className="w-2.5 h-2.5" /> Auto-detected: {detected}
                            </span>
                          );
                        }
                        return null;
                      })()}
                      {apiKeys[selectedProvider] && (
                        <button 
                          onClick={() => handleRevoke(selectedProvider)}
                          className="text-[8px] font-black text-red-400 uppercase tracking-widest hover:text-red-300 flex items-center gap-1 bg-red-500/10 px-2 py-1 rounded-lg"
                        >
                          <Lock className="w-2.5 h-2.5" /> Revoke
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <input  
                      type={(selectedProvider === "ollama" || showKey) ? "text" : "password"}
                      value={apiKeys[selectedProvider] || ""}
                      onChange={(e) => handleKeyChange(selectedProvider, e.target.value)}
                      placeholder={selectedProvider === "ollama" ? "http://localhost:11434" : `Enter ${selectedProvider} API key...`}
                      className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-white/20 focus:bg-white/[0.04] transition-all font-mono"
                    />
                    {selectedProvider !== "ollama" && (
                      <button 
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                      >
                        {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    )}
                  </div>
                  <p className="text-[9px] text-slate-700 font-medium flex items-center gap-1.5">
                    <Lock className="w-3 h-3" /> Encrypted in-memory. Persisted in local secure vault only.
                  </p>
                </div>

                {/* Info Banner */}
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-violet-500/5 to-blue-500/5 border border-white/[0.04]">
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                      <Zap className="text-violet-400 w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-white mb-0.5">Advanced Mission Reasoning</h5>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-medium">API keys enable the autonomous reasoning stage for complex attack chain identification.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "keys" && (
          <motion.div 
            key="keys"
            initial={{ opacity: 0, y: 8 }} 
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {/* Credential Vault */}
            <div className="bg-black border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.04] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-white/10">
                  <Key className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-xs font-black text-white uppercase tracking-widest">Credential Vault</h2>
                  <p className="text-[10px] text-slate-600 mt-0.5">Overview of all provisioned API credentials</p>
                </div>
              </div>
              <div className="divide-y divide-white/[0.03]">
                {providers.map((provider) => {
                  const hasKey = !!apiKeys[provider.id];
                  return (
                    <div key={provider.id} className="px-6 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                      <div className="flex items-center gap-3">
                        <span className="text-sm">{provider.icon}</span>
                        <div>
                          <div className="text-sm font-bold text-white tracking-tight">{provider.name}</div>
                          <div className="text-[8px] text-slate-600 uppercase tracking-widest">{provider.model}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasKey ? (
                          <>
                            <span className="text-[8px] font-black text-green-400 uppercase tracking-widest bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-400" /> Connected
                            </span>
                            <button 
                              onClick={() => handleRevoke(provider.id)}
                              className="text-[8px] font-black text-red-400 uppercase tracking-widest hover:bg-red-500/10 px-2 py-1 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                              Revoke
                            </button>
                          </>
                        ) : (
                          <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest bg-white/[0.03] px-2.5 py-1 rounded-full">
                            Not Configured
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-black border border-red-500/10 rounded-2xl overflow-hidden">
              <div className="px-6 py-3 border-b border-red-500/[0.06] flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <h3 className="text-[9px] font-black text-red-400 uppercase tracking-[0.2em]">Danger Zone</h3>
              </div>
              <div className="p-5 flex flex-wrap gap-2">
                <button 
                  onClick={handleClearAll}
                  className="py-2.5 px-5 rounded-xl border border-red-500/20 text-red-400 text-[9px] font-black hover:bg-red-500/10 transition-all active:scale-95 uppercase tracking-widest flex items-center gap-2"
                >
                  <Trash2 size={12} /> Purge All Credentials
                </button>
                <button className="py-2.5 px-5 rounded-xl border border-white/5 text-slate-600 text-[9px] font-black hover:bg-white/5 transition-all active:scale-95 uppercase tracking-widest">
                  Reset Environment Cache
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SettingItem({ title, description, control }: any) {
  return (
    <div className="flex items-center justify-between gap-6 py-1">
      <div className="max-w-md">
        <h4 className="text-[10px] font-black text-white mb-0.5 tracking-widest uppercase">{title}</h4>
        <p className="text-[10px] text-slate-600 font-medium leading-relaxed">{description}</p>
      </div>
      <div className="shrink-0">
        {control}
      </div>
    </div>
  );
}
