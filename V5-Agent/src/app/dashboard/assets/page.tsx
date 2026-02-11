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
  Zap
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function AssetsPage() {
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<any[]>([]);

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
      
      // Derive unique assets from scans
      if (Array.isArray(scans)) {
        const uniqueAssetsMap = new Map();
        scans.forEach((scan: any) => {
          if (!uniqueAssetsMap.has(scan.url)) {
            uniqueAssetsMap.set(scan.url, {
              id: scan.id,
              url: scan.url,
              type: scan.url.includes("github.com") ? "Repository" : "Endpoint",
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

  /* 
  // Loop Fix: Auto-sync disabled. Use manual refresh.
  useEffect(() => {
    fetchAssets();
  }, []); 
  */

  useEffect(() => {
     // Only fetch once on mount, but handle errors gracefully without retry loop
     fetchAssets();
  }, []);

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Perimeter Assets</h1>
          <p className="text-slate-500 text-sm font-medium">Manage and monitor verified system entry points.</p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => fetchAssets()} 
            disabled={loading}
            className="secondary-button text-xs flex items-center gap-2"
          >
            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} /> Sync
          </button>
          <button className="primary-button text-xs flex items-center gap-2">
            <Plus size={14} /> Provision New Asset
          </button>
        </div>
      </header>

      <div className="bg-black border border-white/10 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Filter assets by domain or repository identifier..." 
              className="w-full bg-black border border-white/10 rounded px-10 py-2.5 text-sm focus:outline-none focus:border-white transition-colors placeholder:text-slate-700"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Asset Identity</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Category</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Integrity</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Last Audit</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <RefreshCcw className="w-5 h-5 animate-spin mx-auto mb-4 text-white/20" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Scanning Perimeter...</span>
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-500 text-sm font-medium">
                    No verified perimeter assets detected. Initialize a mission to provision assets.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <AssetRow key={asset.id} asset={asset} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function AssetRow({ asset }: any) {
  return (
    <tr className="group hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-0">
      <td className="px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
            {asset.type === "Repository" ? <Github size={14} /> : <Globe size={14} />}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors tracking-tight">{asset.url}</span>
            <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest mt-0.5">Asset ID: {asset.id.substring(0, 8)}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-5">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{asset.type}</span>
      </td>
      <td className="px-6 py-5">
        <div className="flex items-center gap-2">
          <ShieldCheck size={12} className="text-green-500" />
          <span className="text-[10px] font-bold text-green-500/80 uppercase tracking-widest">{asset.status}</span>
        </div>
      </td>
      <td className="px-6 py-5 text-[10px] font-medium text-slate-500 whitespace-nowrap">
        {new Date(asset.lastMission).toLocaleDateString()}
      </td>
      <td className="px-6 py-5 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 hover:bg-white/10 rounded transition-colors text-slate-500 hover:text-white" title="Re-scan Asset">
            <Zap size={14} />
          </button>
          <a href={asset.url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 rounded transition-colors text-slate-500 hover:text-white">
            <ArrowUpRight size={14} />
          </a>
          <button className="p-2 hover:bg-white/10 rounded transition-colors text-slate-500 hover:text-red-500">
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}
