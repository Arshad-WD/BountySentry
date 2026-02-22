"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { finalizeReport, getReports, getReport } from "@/services/registry.service";
import { grantReputation } from "@/services/reputation.service";
import { handleTxError } from "@/lib/errors";
import Button from "@/app/components/Button";
import Card from "@/app/components/Card";
import Badge from "@/app/components/Badge";
import StatCard from "@/app/components/StatCard";
import { useWeb3 } from "@/app/context/Web3Context";
import { ENV } from "@/config/env";

import { useToast } from "@/app/context/ToastContext";

export default function CouncilConsole() {
  const { addToast } = useToast();
  const { signer, provider, isConnected, connect, isCorrectNetwork } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [reportId, setReportId] = useState("");
  const [gasComp, setGasComp] = useState("0.05");
  const [stats, setStats] = useState({ resolved: "0", pending: "0", reserve: "0.00 ETH" });
  const [pendingReports, setPendingReports] = useState<any[]>([]);
  const [grantAddress, setGrantAddress] = useState("");
  const [grantLoading, setGrantLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
        if (!provider || !isCorrectNetwork) return;
        try {
            const reports = await getReports(provider);
            const resolved = reports.filter((r: any) => r.status === "ACCEPTED").length;
            const pendingList = reports.filter((r: any) => r.status === "PENDING");
            const balance = await provider.getBalance(ENV.VAULT_ADDRESS);
            
            setPendingReports(pendingList);
            setStats({
                resolved: resolved.toString(),
                pending: pendingList.length.toString(),
                reserve: `${ethers.formatEther(balance)} ETH`
            });
        } catch (err) {
            console.error("Admin stats error:", err);
        }
    };
    fetchStats();
  }, [provider, isCorrectNetwork]);

  const handleFinalize = async () => {
    if (!reportId || !signer) return;
    setLoading(true);
    try {
      const tx = await finalizeReport(signer, Number(reportId), gasComp);
      await tx.wait();
      addToast("Resolution executed. Protocol state updated.", "success");
    } catch (err: any) {
      console.error(err);
      if (err.code === "ACTION_REJECTED" || err.code === 4001) {
        addToast("Execution Cancelled: You rejected the request in your wallet.", "warning");
      } else {
        addToast("Execution failed. Protocol error or insufficient permissions.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGrantReputation = async () => {
    if (!grantAddress || !signer) return;
    setGrantLoading(true);
    try {
      const tx = await grantReputation(signer, grantAddress);
      await tx.wait();
      addToast("Reputation granted to validator", "success");
      setGrantAddress("");
    } catch (err: any) {
      handleTxError(err, "Failed to grant reputation", addToast);
    } finally {
      setGrantLoading(false);
    }
  };

  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      <div className="max-w-2xl px-1">
        <Badge className="mb-6">Protocol Council</Badge>
        <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
          Council<br />Console
        </h2>
        <p className="text-brand-secondary text-sm font-medium leading-relaxed max-w-xl">
          Authorized execution environment for protocol guardians. Finalize validated reports and manage validator node citizenship.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard label="Resolved Reports" value={stats.resolved} />
        <StatCard label="Pending Action" value={stats.pending} />
        <StatCard label="Platform Reserve" value={stats.reserve} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settlement Console */}
        <div className="space-y-8">
          <Card className="p-12 space-y-10 border-brand-accent/20 bg-white/[0.01] backdrop-blur-xl relative overflow-hidden h-full">
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
                  placeholder="0.05"
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

        {/* Reputation Management */}
        <div className="space-y-8">
          <Card className="p-12 space-y-10 border-indigo-500/20 bg-white/[0.01] backdrop-blur-xl relative overflow-hidden h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px flex-1 bg-white/5" />
              <h3 className="text-[10px] font-black text-indigo-400/40 uppercase tracking-[0.4em] whitespace-nowrap">Node Authority</h3>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-indigo-400/50 uppercase tracking-[0.2em] pl-1">Validator Address</label>
              <input
                type="text"
                placeholder="0x..."
                className="w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-brand-text focus:border-indigo-500 transition-all outline-none font-mono"
                value={grantAddress}
                onChange={(e) => setGrantAddress(e.target.value)}
              />
            </div>

            <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-8">
              <div className="space-y-1">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Reputation Grant</p>
                  <p className="text-[10px] text-brand-secondary font-bold uppercase tracking-wider opacity-60">Grant node citizenship to a validator.</p>
              </div>
              <Button onClick={handleGrantReputation} loading={grantLoading} variant="secondary" className="px-10 py-5 border-indigo-500/30 hover:bg-indigo-500/10">
                Execute Grant
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Pending Reports List */}
      <div className="space-y-8">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Pending Settlement Queue</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingReports.length === 0 ? (
            <Card className="col-span-full p-16 text-center bg-white/[0.01] border-white/5 opacity-50 italic uppercase text-[10px] font-black tracking-widest">
              Queue clear. No pending resolutions.
            </Card>
          ) : (
            pendingReports.map(report => (
              <Card 
                key={report.id} 
                onClick={() => setReportId(report.id.toString())}
                className={`p-6 cursor-pointer transition-all ${
                  reportId === report.id.toString() 
                    ? 'border-brand-accent bg-brand-accent/5' 
                    : 'bg-white/[0.02] border-white/5 hover:border-brand-accent/30'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest">Report #{report.id}</span>
                    <span className="text-[10px] font-bold text-slate-500 tracking-wider group-hover:text-brand-accent transition-colors">
                      {report.approvals} A / {report.rejections} R
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white line-clamp-1">{report.projectName}</h4>
                  <div className="pt-3 border-t border-white/5">
                     <p className="text-[9px] font-mono text-slate-500 truncate">{report.reporter}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
