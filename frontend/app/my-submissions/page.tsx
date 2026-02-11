"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyReports } from "@/services/registry.service";
import Card from "@/app/components/Card";
import Button from "@/app/components/Button";
import { CardSkeleton } from "@/app/components/Skeleton";
import { useWeb3 } from "@/app/context/Web3Context";
import { MockIPFS } from "@/lib/storage";

export default function MySubmissions() {
  const { provider, address, isConnected, connect } = useWeb3();
  const router = useRouter();
  const [reports, setReports] = useState<any[] | null>(null);

  useEffect(() => {
    const fetchMyReports = async () => {
        if (!provider || !address) return;
        try {
            const data = await getMyReports(provider, address);
            
            // Enrich with MockIPFS data
            const enriched = data.map(report => {
              const rawContent = MockIPFS.get(report.ipfsHash);
              if (rawContent) {
                try {
                  const parsed = JSON.parse(rawContent);
                  return { ...report, summary: parsed.summary };
                } catch {
                  return report;
                }
              }
              return report;
            });
            
            setReports(enriched);
        } catch (err) {
            console.error(err);
        }
    };
    fetchMyReports();
  }, [provider, address]);

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto pt-20 text-center space-y-8">
        <div className="space-y-4">
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">My Submissions</h2>
          <p className="text-slate-400 text-sm font-medium">Connect your wallet to view your submitted reports.</p>
        </div>
        <Button onClick={connect} className="px-12 py-4">Connect Wallet</Button>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="max-w-2xl px-1">
        <h2 className="text-5xl font-black text-brand-text uppercase tracking-tight mb-6 italic">
          My Submissions
        </h2>
        <p className="text-brand-secondary text-sm leading-relaxed font-medium">
          Track all your submitted vulnerability reports. This is your private dashboard - only you can see these submissions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {!reports ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : reports.length === 0 ? (
          <Card className="p-16 text-center bg-white/[0.02] border-white/5">
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">No Submissions Yet</h3>
              <p className="text-brand-secondary text-sm max-w-md mx-auto">
                You haven't submitted any vulnerability reports. Start hunting for bugs and submit your first report!
              </p>
              <Button onClick={() => router.push("/submit")} className="mt-4">Submit Your First Report</Button>
            </div>
          </Card>
        ) : (
          reports.map((report) => (
            <Card 
              key={report.id} 
              className="p-8 bg-white/[0.02] border-white/5 hover:border-brand-accent/30 transition-all duration-500 cursor-pointer group"
              onClick={() => router.push(`/reports/${report.id}`)}
            >
              <div className="flex justify-between items-start gap-8">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      report.status === "PENDING" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                      report.status === "ACCEPTED" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                      "bg-red-500/10 text-red-500 border-red-500/20"
                    }`}>
                      {report.status}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Report #{report.id}</span>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-black text-brand-text tracking-tight uppercase group-hover:text-brand-accent transition-colors mb-2">
                      {report.projectName}
                    </h3>
                    {report.summary && (
                      <p className="text-sm text-slate-400 line-clamp-2 font-medium">{report.summary}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-6 text-[10px] text-brand-secondary font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500">{report.approvals} Approvals</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-red-500">{report.rejections} Rejections</span>
                    </div>
                  </div>
                </div>

                <Button variant="secondary" className="text-[10px] px-6 h-9 group-hover:bg-brand-accent group-hover:text-white group-hover:border-brand-accent">
                  View Details
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
