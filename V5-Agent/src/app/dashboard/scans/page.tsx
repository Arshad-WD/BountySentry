"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Shield, 
  ExternalLink, 
  MoreVertical, 
  Trash2, 
  RefreshCcw,
  Search,
  Filter,
  ArrowUpRight,
  FileText
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function ScansPage() {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScans() {
      try {
        const response = await fetch("/api/scan");
        const data = await response.json();
        setScans(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to fetch scans", e);
      } finally {
        setLoading(false);
      }
    }
    fetchScans();
  }, []);

  return (
    <DashboardLayout>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Security Scans</h1>
          <p className="text-slate-500 text-sm">Review audit history and mission telemetry logs.</p>
        </div>

        <div className="flex gap-2">
          <button className="secondary-button text-xs flex items-center gap-2">
            <Filter className="w-3.5 h-3.5" /> Filter Missions
          </button>
          <button className="glass-button text-xs font-bold uppercase tracking-widest">
             Export Data
          </button>
        </div>
      </header>

      <div className="bg-black border border-white/10 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by mission ID or target URL..." 
              className="w-full bg-black border border-white/10 rounded px-10 py-2.5 text-sm focus:outline-none focus:border-white transition-colors placeholder:text-slate-700"
            />
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Mission Target</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Risk Assessment</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Telemetry Date</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <RefreshCcw className="w-5 h-5 animate-spin mx-auto mb-4 text-white/20" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Synchronizing...</span>
                  </td>
                </tr>
              ) : scans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-500 text-sm font-medium">
                    No active mission data found in perimeter logs.
                  </td>
                </tr>
              ) : (
                scans.map((scan) => (
                  <ScanRow key={scan.id} scan={scan} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ScanRow({ scan }: any) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const statusColors: any = {
    COMPLETED: "text-green-500 border-green-500/20 bg-green-500/5",
    RUNNING: "text-blue-400 border-blue-400/20 bg-blue-400/5 animate-pulse",
    FAILED: "text-red-500 border-red-500/20 bg-red-500/5",
    PENDING: "text-slate-500 border-white/10 bg-white/5",
  };

  const handleRetry = async () => {
    if (!confirm("Are you sure you want to retry this scan?")) return;
    
    setIsRetrying(true);
    try {
      const response = await fetch(`/api/scan/${scan.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "retry" }),
      });
      
      if (response.ok) {
        window.location.reload();
      } else {
        alert("Failed to retry scan");
      }
    } catch (error) {
      alert("Error retrying scan");
    } finally {
      setIsRetrying(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this scan? This action cannot be undone.")) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/scan/${scan.id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        window.location.reload();
      } else {
        alert("Failed to delete scan");
      }
    } catch (error) {
      alert("Error deleting scan");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <tr className="group hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-0">
      <td className="px-6 py-5">
        <div className="flex flex-col">
          <span className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors tracking-tight">{scan.url}</span>
          <span className="text-[10px] text-slate-600 font-mono mt-0.5">ID: {scan.id.substring(0, 12)}</span>
        </div>
      </td>
      <td className="px-6 py-5">
        <div className={`inline-flex items-center gap-2 px-2 py-1 rounded text-[9px] font-bold border uppercase tracking-widest ${statusColors[scan.status]}`}>
          {scan.status}
        </div>
      </td>
      <td className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">
         Assessments Pending
      </td>
      <td className="px-6 py-5 text-[10px] font-medium text-slate-500 whitespace-nowrap">
        {new Date(scan.createdAt).toLocaleDateString()} · {new Date(scan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
      </td>
      <td className="px-6 py-5 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {scan.status === "COMPLETED" && (
            <a 
              href={`/api/scan/${scan.id}/report`} 
              download 
              className="p-2 hover:bg-white/10 rounded transition-colors text-slate-500 hover:text-blue-400"
              title="Download Mission Report"
            >
              <FileText size={14} />
            </a>
          )}
          <button 
            onClick={handleRetry}
            disabled={isRetrying || scan.status === "RUNNING"}
            className="p-2 hover:bg-white/10 rounded transition-colors text-slate-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            title="Retry Scan"
          >
            <RefreshCcw size={14} className={isRetrying ? "animate-spin" : ""} />
          </button>
          <Link href={`/dashboard/scans/${scan.id}`} className="p-2 hover:bg-white/10 rounded transition-colors text-slate-500 hover:text-white" title="View Details">
            <ArrowUpRight size={14} />
          </Link>
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 hover:bg-white/10 rounded transition-colors text-slate-500 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete Scan"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}
