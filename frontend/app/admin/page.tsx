"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { finalizeReport, getReports } from "@/services/registry.service";
import Button from "@/app/components/Button";
import Card from "@/app/components/Card";
import StatCard from "@/app/components/StatCard";
import { useWeb3 } from "@/app/context/Web3Context";
import { ENV } from "@/config/env";

export default function AdminPanel() {
  const { signer, provider, isConnected, connect, isCorrectNetwork } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [reportId, setReportId] = useState("");
  const [gasComp, setGasComp] = useState("0.05");
  const [stats, setStats] = useState({ resolved: "0", pending: "0", reserve: "0.00 ETH" });

  useEffect(() => {
    const fetchStats = async () => {
        if (!provider || !isCorrectNetwork) return;
        try {
            const reports = await getReports(provider);
            const resolved = reports.filter((r: any) => r.status === "ACCEPTED").length;
            const pending = reports.filter((r: any) => r.status === "PENDING").length;
            const balance = await provider.getBalance(ENV.VAULT_ADDRESS);
            
            setStats({
                resolved: resolved.toString(),
                pending: pending.toString(),
                reserve: `${ethers.formatEther(balance)} ETH`
            });
        } catch (err) {
            console.error("Admin stats error:", err);
        }
    };
    fetchStats();
  }, [provider]);

  const handleFinalize = async () => {
    if (!reportId || !signer) return;
    setLoading(true);
    try {
      const tx = await finalizeReport(signer, Number(reportId), gasComp);
      await tx.wait();
      alert("Resolution executed. Protocol state updated.");
    } catch (err: any) {
      console.error(err);
      if (err.code === "ACTION_REJECTED" || err.code === 4001) {
        alert("Execution Cancelled: You rejected the request in your wallet.");
      } else {
        alert("Execution failed. Protocol error or insufficient permissions.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      <div className="max-w-2xl px-1">
        <h2 className="text-4xl font-black text-brand-text uppercase tracking-tight mb-4">
          Protocol Settlement
        </h2>
        <p className="text-brand-secondary text-sm font-medium leading-relaxed">
          Execute the final block of report resolutions. This process coordinates fund releases from the BountyVault and handles gas compensations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard label="Resolved Reports" value={stats.resolved} />
        <StatCard label="Pending Action" value={stats.pending} />
        <StatCard label="Platform Reserve" value={stats.reserve} />
      </div>

      <div className="max-w-2xl px-1">
        <Card className="p-12 space-y-10 border-brand-accent/20 bg-white/[0.01] backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-accent to-transparent opacity-30" />
          
          <div className="flex items-center gap-4 mb-4">
            <div className="h-px flex-1 bg-white/5" />
            <h3 className="text-[10px] font-black text-brand-text/40 uppercase tracking-[0.4em] whitespace-nowrap">Execution Console</h3>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-brand-text/50 uppercase tracking-[0.2em] pl-1">Resolution ID</label>
              <input
                type="number"
                placeholder="0"
                className="w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-brand-text focus:border-brand-accent transition-all outline-none"
                value={reportId}
                onChange={(e) => setReportId(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-brand-text/50 uppercase tracking-[0.2em] pl-1">Gas Compensation</label>
              <input
                type="number"
                step="0.001"
                className="w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-brand-text focus:border-brand-accent transition-all outline-none"
                value={gasComp}
                onChange={(e) => setGasComp(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="space-y-1">
                <p className="text-[10px] font-black text-brand-accent uppercase tracking-[0.2em]">Authorized Execution</p>
                <p className="text-[10px] text-brand-secondary font-bold uppercase tracking-wider opacity-60">Consensus must reach majority status.</p>
            </div>
            {!isConnected ? (
              <Button onClick={connect} className="px-10 py-5 shadow-2xl">Authorize Admin</Button>
            ) : (
              <Button onClick={handleFinalize} loading={loading} className="px-10 py-5 shadow-2xl">
                Execute Settlement
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
