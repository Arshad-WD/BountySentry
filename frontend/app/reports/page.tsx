"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/app/components/Card";
import Badge from "@/app/components/Badge";
import { Skeleton } from "@/app/components/Skeleton";
import { useWeb3 } from "@/app/context/Web3Context";
import { getReports } from "@/services/registry.service";

export default function ReportsList() {
  const { provider } = useWeb3();
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

      <Card className="overflow-hidden border-white/5 bg-white/[0.01] backdrop-blur-md">
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
            {!reports ? (
               [...Array(4)].map((_, i) => (
                <tr key={i}>
                  <td className="px-8 py-6"><Skeleton className="h-4 w-12" /></td>
                  <td className="px-8 py-6"><Skeleton className="h-4 w-32 mb-2" /><Skeleton className="h-3 w-20" /></td>
                  <td className="px-8 py-6"><Skeleton className="h-6 w-20 rounded-full" /></td>
                  <td className="px-8 py-6"><Skeleton className="h-4 w-40" /></td>
                  <td className="px-8 py-6"></td>
                </tr>
               ))
            ) : (
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
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
