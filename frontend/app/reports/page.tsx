"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/app/components/Card";
import Badge from "@/app/components/Badge";
import { Skeleton } from "@/app/components/Skeleton";
import Button from "@/app/components/Button";
import { useWeb3 } from "@/app/context/Web3Context";
import { getReports } from "@/services/registry.service";

export default function ReportsList() {
  const { provider, isConnected, connect } = useWeb3();
  const [reports, setReports] = useState<any[] | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
        if (!provider) return;
        try {
            const data = await getReports(provider);
            setReports(data);
        } catch (err) {
            console.error(err);
        }
    };
    fetchReports();
  }, [provider]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ACCEPTED": return "success";
      case "REJECTED": return "danger";
      case "PENDING": return "warning";
      default: return "neutral";
    }
  };

  return (
    <div className="space-y-12">
       <div className="max-w-2xl px-1">
        <h2 className="text-4xl font-black text-brand-text uppercase tracking-tight mb-4">
          Reports Registry
        </h2>
        <p className="text-brand-secondary text-sm font-medium leading-relaxed">
          Track the validation status of vulnerability submissions. DAO members review and vote on these reports to trigger secured rewards.
        </p>
      </div>

      <Card className="overflow-hidden border-white/5 bg-white/[0.01] backdrop-blur-md relative">
        {!isConnected && (
           <div className="absolute inset-0 z-10 bg-brand-bg/60 backdrop-blur-md flex items-center justify-center p-8">
              <div className="max-w-md text-center space-y-8 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 mx-auto rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent shadow-2xl shadow-brand-accent/20">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Authorized Registry Only</h3>
                  <p className="text-[10px] text-brand-secondary font-bold uppercase tracking-widest leading-relaxed">
                    Accessing the global report registry requires an active secure session. Connect your node to proceed.
                  </p>
                </div>
                <Button onClick={connect} className="w-full py-4 text-[10px] font-black uppercase tracking-[0.3em]">Initialize Session</Button>
              </div>
           </div>
        )}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="px-8 py-5 text-[10px] font-black text-brand-secondary uppercase tracking-[0.3em]">Execution ID</th>
              <th className="px-8 py-5 text-[10px] font-black text-brand-secondary uppercase tracking-[0.3em]">Association</th>
              <th className="px-8 py-5 text-[10px] font-black text-brand-secondary uppercase tracking-[0.3em]">Current Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-brand-secondary uppercase tracking-[0.3em]">Consensus Weight</th>
              <th className="px-8 py-5 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {!reports && isConnected ? (
               [...Array(4)].map((_, i) => (
                <tr key={i}>
                  <td className="px-8 py-6"><Skeleton className="h-4 w-12" /></td>
                  <td className="px-8 py-6"><Skeleton className="h-4 w-32 mb-2" /><Skeleton className="h-3 w-20" /></td>
                  <td className="px-8 py-6"><Skeleton className="h-6 w-20 rounded-full" /></td>
                  <td className="px-8 py-6"><Skeleton className="h-4 w-40" /></td>
                  <td className="px-8 py-6"></td>
                </tr>
               ))
            ) : reports && reports.length > 0 ? (
              reports.map((r) => (
                <tr key={r.id} className="group hover:bg-white/5 transition-all duration-300">
                  <td className="px-8 py-6 font-mono text-sm text-brand-text">#{r.id}</td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-brand-text block mb-0.5">Bounty {r.bountyId}</span>
                    <span className="text-[10px] text-brand-secondary font-bold tracking-wider uppercase opacity-60">{r.reporter}</span>
                  </td>
                  <td className="px-8 py-6">
                    <Badge variant={getStatusVariant(r.status)}>{r.status}</Badge>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="text-[10px] font-black text-brand-text uppercase tracking-widest">{r.approvals} A / {r.rejections} R</div>
                      <div className="flex-1 max-w-[100px] h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className="h-full bg-brand-accent shadow-[0_0_10px_rgba(var(--brand-accent-rgb),0.5)] transition-all duration-1000" 
                            style={{ width: `${(r.approvals / (r.approvals + r.rejections || 1)) * 100}%` }}
                          />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Link href={`/reports/${r.id}`} className="inline-flex items-center gap-2 text-[10px] font-black text-brand-accent uppercase tracking-[0.2em] border-b-2 border-transparent hover:border-brand-accent pb-1 transition-all">
                      Review Findings
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
                <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                         <p className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.4em] italic opacity-40">
                             No protocol events discovered in the current sequence.
                         </p>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
