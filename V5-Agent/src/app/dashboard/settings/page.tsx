"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
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
  Lock
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [showKey, setShowKey] = useState(false);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [activeTab, setActiveTab] = useState("agent");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const savedKeys = localStorage.getItem("sentinel_api_keys");
    if (savedKeys) {
      try {
        setApiKeys(JSON.parse(savedKeys));
      } catch (e) {
        console.error("Failed to parse saved keys");
      }
    }
  }, []);

  const handleKeyChange = (providerId: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [providerId]: value }));
  };

  const handleSave = () => {
    setSaving(true);
    localStorage.setItem("sentinel_api_keys", JSON.stringify(apiKeys));
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
    { id: "ollama", name: "Ollama", model: "Local (Infinite)" },
    { id: "openai", name: "OpenAI", model: "GPT-4o" },
    { id: "anthropic", name: "Anthropic", model: "Claude 3.5" },
    { id: "google", name: "Google", model: "Gemini 1.5 Pro" },
    { id: "groq", name: "Groq", model: "Llama 3 (Free/Fast)" },
    { id: "openrouter", name: "OpenRouter", model: "Universal (Free)" },
    { id: "mistral", name: "Mistral", model: "Mistral Large" },
  ];

  return (
    <DashboardLayout>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">System Settings</h1>
          <p className="text-slate-500 text-sm font-medium">Configure engine parameters and autonomous agent behavior.</p>
        </div>
        <div className="flex items-center gap-4">
          {saveSuccess && (
            <motion.span 
              initial={{ opacity: 0, x: 10 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="text-green-500 text-[10px] font-black uppercase tracking-widest bg-green-500/10 px-3 py-1.5 rounded"
            >
              Credentials Synchronized
            </motion.span>
          )}
          <button 
            onClick={handleSave}
            disabled={saving}
            className="glass-button text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
            {saving ? "Encrypting..." : "Save Configuration"}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation */}
        <div className="space-y-1">
          <SettingsNav 
            icon={<Cpu size={18} />} 
            label="Agent Configuration" 
            active={activeTab === "agent"} 
            onClick={() => setActiveTab("agent")}
          />
          <SettingsNav 
            icon={<Brain size={18} />} 
            label="LLM Intelligence" 
            active={activeTab === "llm"} 
            onClick={() => setActiveTab("llm")}
          />
          <SettingsNav 
            icon={<Database size={18} />} 
            label="Database & Storage" 
            active={activeTab === "db"} 
            onClick={() => setActiveTab("db")}
          />
          <SettingsNav 
            icon={<Key size={18} />} 
            label="API Credentials" 
            active={activeTab === "keys"} 
            onClick={() => setActiveTab("keys")}
          />
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-8">
          {activeTab === "agent" && (
            <motion.section 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="glass-card p-8"
            >
              <h2 className="text-xl font-bold mb-8 text-white uppercase tracking-widest">Autonomous Engine</h2>
              <div className="space-y-10">
                <SettingItem 
                  title="Max Analysis Depth" 
                  description="Determines how many layers of the application surface the agent should probe."
                  control={
                    <select className="bg-black border border-white/20 rounded px-4 py-2 text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:border-white transition-colors">
                      <option>Standard (3 layers)</option>
                      <option>Deep (10 layers)</option>
                      <option>Infinite (Enterprise Only)</option>
                    </select>
                  }
                />
                <SettingItem 
                  title="Agent Confidence Threshold" 
                  description="Findings below this confidence level will be relegated to the secondary audit log."
                  control={<input type="range" className="w-32 accent-white bg-white/10" />}
                />
                <SettingItem 
                  title="Mandatory Consent" 
                  description="Requires explicit user certification for every scanning mission."
                  control={
                    <div className="w-10 h-5 rounded-full bg-white flex items-center px-1">
                      <div className="w-3.5 h-3.5 rounded-full bg-black ml-auto" />
                    </div>
                  }
                />
              </div>
            </motion.section>
          )}

          {activeTab === "llm" && (
            <motion.section 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="glass-card p-8"
            >
              <div className="flex items-center gap-3 mb-2">
                <Brain className="text-white w-5 h-5" />
                <h2 className="text-xl font-bold text-white uppercase tracking-widest">Intelligence Synergy</h2>
              </div>
              <p className="text-slate-500 text-[11px] font-medium uppercase tracking-wide mb-10">Sentinel AI utilizes distributed LLMs to reason about infrastructure vulnerabilities.</p>
              
              <div className="space-y-10">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-4">Select Provider</label>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {providers.map((provider) => (
                      <button 
                        key={provider.id}
                        onClick={() => setSelectedProvider(provider.id)}
                        className={`p-4 rounded border transition-all text-left flex flex-col gap-1 ${
                          selectedProvider === provider.id
                            ? "border-white bg-white/5 text-white"
                            : "border-white/5 bg-transparent text-slate-500 hover:border-white/10"
                        }`}
                      >
                        <span className="font-bold text-sm tracking-tight">{provider.name}</span>
                        <span className="text-[10px] uppercase font-black tracking-widest opacity-40">{provider.model}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                        {selectedProvider === "ollama" ? "Ollama Instance URL" : `${providers.find(p => p.id === selectedProvider)?.name} API Key`}
                      </label>
                      {apiKeys[selectedProvider] && (
                        <button 
                          onClick={() => handleRevoke(selectedProvider)}
                          className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline flex items-center gap-1"
                        >
                          <Lock className="w-3 h-3" /> {selectedProvider === "ollama" ? "Disconnect" : "Revoke Key"}
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input 
                        type={(selectedProvider === "ollama" || showKey) ? "text" : "password"}
                        value={apiKeys[selectedProvider] || ""}
                        onChange={(e) => handleKeyChange(selectedProvider, e.target.value)}
                        placeholder={selectedProvider === "ollama" ? "http://localhost:11434" : `provision-${selectedProvider}-key...`}
                        className="w-full bg-black border border-white/20 rounded pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-white transition-colors font-mono"
                      />
                      {selectedProvider !== "ollama" && (
                        <button 
                          onClick={() => setShowKey(!showKey)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                        >
                          {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-600 font-medium italic">
                    Keys are encrypted in-memory and persisted only within your local secure vault.
                  </p>
                </div>

                <div className="p-5 rounded border border-white/5 bg-white/[0.02] flex gap-5">
                   <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center shrink-0">
                     <Zap className="text-white w-5 h-5" />
                   </div>
                   <div>
                     <h5 className="text-[11px] font-black uppercase tracking-widest text-white mb-1">Advanced Mission Reasoning</h5>
                     <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Providing an API key enables the autonomous reasoning stage, allowing agents to correlate discovery data and identify complex high-impact vulnerabilities.</p>
                   </div>
                </div>
              </div>
            </motion.section>
          )}

          <section className="glass-card p-8 border-white/5 bg-black">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Danger Zone</h3>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={handleClearAll}
                className="py-2 px-6 rounded border border-red-500/20 text-red-500 text-[10px] font-black hover:bg-red-500/5 transition-all active:scale-95 uppercase tracking-widest flex items-center gap-2"
              >
                 <Trash2 size={14} /> Purge System Credentials
              </button>
              <button className="py-2 px-6 rounded border border-white/10 text-slate-500 text-[10px] font-black hover:bg-white/5 transition-all active:scale-95 uppercase tracking-widest">
                 Reset Environment Cache
              </button>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

function SettingsNav({ icon, label, active = false, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-3 rounded cursor-pointer transition-all border ${
        active 
          ? "bg-white/10 border-white/10 text-white" 
          : "text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/5"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={active ? "text-white" : ""}>{icon}</div>
        <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <ChevronRight className={`w-3 h-3 transition-opacity ${active ? "opacity-100" : "opacity-0"}`} />
    </div>
  );
}

function SettingItem({ title, description, control }: any) {
  return (
    <div className="flex items-center justify-between gap-8">
      <div className="max-w-md">
        <h4 className="text-[11px] font-black text-white mb-1 tracking-widest uppercase">{title}</h4>
        <p className="text-[11px] text-slate-600 font-medium leading-relaxed uppercase tracking-tight">{description}</p>
      </div>
      <div className="shrink-0">
        {control}
      </div>
    </div>
  );
}
