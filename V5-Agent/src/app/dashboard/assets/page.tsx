"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Globe, 
  Github, 
  ExternalLink, 
  Trash2, 
  RefreshCcw,
  Search,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Target,
  Link2,
  AlertTriangle,
  BarChart3
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AssetsPage() {
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  async function fetchAssets() {
    if (loading && assets.length > 0) return;
    
    setLoading(true);
    try {
        const fetchWithTimeout = async (url: string) => {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 5000);
            try {
              const res = await fetch(url, { signal: controller.signal });
              clearTimeout(id);
              return res;
            } catch (e) {
              clearTimeout(id);
              throw e;
            }
        };

      const response = await fetchWithTimeout("/api/scan");
      if (!response.ok) throw new Error("API Failed"); 
      
      let scans = [];
      try {
        scans = await response.json();
      } catch (e) {
        console.error("JSON Parse Error", e);
        scans = [];
      }
      
      if (Array.isArray(scans)) {
        const uniqueAssetsMap = new Map();
        scans.forEach((scan: any) => {
          if (!scan.url) return;
          if (!uniqueAssetsMap.has(scan.url)) {
            uniqueAssetsMap.set(scan.url, {
              id: scan.id,
              url: scan.url,
              type: scan.url?.includes("github.com") ? "Repository" : "Endpoint",
              status: "Verified",
              lastMission: scan.createdAt,
              findingsCount: scan.findings?.length || 0
            });
          }
        });
        setAssets(Array.from(uniqueAssetsMap.values()));
      }
    } catch (e) {
      console.error("Failed to fetch perimeter assets", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
     fetchAssets();
  }, []);

  const filteredAssets = assets.filter(a => !searchQuery || a.url?.toLowerCase().includes(searchQuery.toLowerCase()));
  const repoCount = assets.filter(a => a.type === "Repository").length;
  const endpointCount = assets.filter(a => a.type === "Endpoint").length;

  return (
    <>
      {/* Header */}
      <header className="relative mb-5 pb-5 border-b border-white/5">
        <div className="absolute -top-20 right-0 w-72 h-72 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-3">
              <Globe size={14} className="text-emerald-400" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Attack Surface</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-4xl font-bold tracking-tight text-white mb-2">
              Perimeter <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">Assets</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-slate-500 text-sm">
              Manage and monitor verified system entry points.
            </motion.p>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex gap-2">
            <button 
              onClick={() => fetchAssets()} 
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all disabled:opacity-40"
            >
              <RefreshCcw size={14} className={loading ? "animate-spin" : ""} /> Sync
            </button>
          </motion.div>
        </div>
      </header>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gradient-to-br from-slate-500/5 to-slate-500/[0.02] border border-white/[0.06] rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center text-slate-400">
            <Target size={16} />
          </div>
          <div>
            <div className="text-xl font-black text-white">{assets.length}</div>
            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Total Assets</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/5 to-purple-500/[0.02] border border-white/[0.06] rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center text-purple-400">
            <Github size={16} />
          </div>
          <div>
            <div className="text-xl font-black text-white">{repoCount}</div>
            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Repositories</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500/5 to-blue-500/[0.02] border border-white/[0.06] rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center text-blue-400">
            <Link2 size={16} />
          </div>
          <div>
            <div className="text-xl font-black text-white">{endpointCount}</div>
            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Endpoints</div>
          </div>
        </div>
      </motion.div>

      {/* Asset Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-black border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/[0.04] flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets by domain or repository..." 
              className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-11 py-2.5 text-sm focus:outline-none focus:border-white/20 transition-colors placeholder:text-slate-700"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.04]">
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Asset Identity</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Type</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Integrity</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Last Audit</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <RefreshCcw className="w-5 h-5 animate-spin mx-auto mb-4 text-white/10" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Scanning Perimeter...</span>
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-dashed border-white/10 flex items-center justify-center mx-auto mb-4">
                      <Globe className="w-6 h-6 text-slate-700" />
                    </div>
                    <p className="text-slate-500 text-sm font-bold mb-1">
                      {searchQuery ? "No matching assets" : "No assets detected"}
                    </p>
                    <p className="text-[10px] text-slate-600">
                      {searchQuery ? "Try a different search." : "Initialize a scan to provision assets."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset, idx) => (
                  <AssetRow key={asset.id} asset={asset} index={idx} onDelete={(id: string) => setAssets(assets.filter(a => a.id !== id))} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredAssets.length > 0 && (
          <div className="px-6 py-3 border-t border-white/[0.04] flex items-center justify-between">
            <span className="text-[10px] text-slate-600 font-bold">
              {filteredAssets.length} asset{filteredAssets.length !== 1 ? "s" : ""} registered
            </span>
          </div>
        )}
      </motion.div>
    </>
  );
}

function AssetRow({ asset, index, onDelete }: any) {
  const [isScanning, setIsScanning] = useState(false);

  const handleRescan = async () => {
    if (!confirm(`Re-scan ${asset.url}?`)) return;
    setIsScanning(true);
    try {
      const savedKeys = localStorage.getItem("sentinel_api_keys");
      const apiKeys = savedKeys ? JSON.parse(savedKeys) : {};
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: asset.url,
          type: asset.type === "Repository" ? "github" : "url",
          consent: true,
          allKeys: apiKeys,
        }),
      });
      if (response.ok) {
        alert("New scan initiated!");
        window.location.reload();
      } else {
        alert("Failed to initiate scan.");
      }
    } catch {
      alert("Error starting scan.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleDelete = () => {
    if (!confirm(`Remove ${asset.url} from your asset list?`)) return;
    onDelete(asset.id);
  };

  return (
    <motion.tr 
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="group hover:bg-white/[0.02] transition-colors"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border border-white/5 ${
            asset.type === "Repository" ? "bg-purple-500/10" : "bg-blue-500/10"
          }`}>
            {asset.type === "Repository" ? <Github size={14} className="text-purple-400" /> : <Globe size={14} className="text-blue-400" />}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors tracking-tight">{asset.url}</span>
            <span className="text-[10px] text-slate-700 font-mono mt-0.5">ID: {asset.id.substring(0, 10)}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
          asset.type === "Repository" 
            ? "text-purple-400 bg-purple-500/10 border border-purple-500/20" 
            : "text-blue-400 bg-blue-500/10 border border-blue-500/20"
        }`}>{asset.type}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 w-fit">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span className="text-[9px] font-black text-green-400 uppercase tracking-widest">{asset.status}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-[10px] font-medium text-slate-500 whitespace-nowrap">
        {new Date(asset.lastMission).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={handleRescan} disabled={isScanning} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-500 hover:text-white disabled:opacity-30" title="Re-scan">
            <Zap size={14} className={isScanning ? "animate-pulse" : ""} />
          </button>
          <a href={asset.url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-500 hover:text-white" title="Open">
            <ArrowUpRight size={14} />
          </a>
          <button onClick={handleDelete} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-500 hover:text-red-400" title="Remove">
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}
