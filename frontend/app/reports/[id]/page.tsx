"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getReport, validateReport } from "@/services/registry.service";
import Button from "@/app/components/Button";
import Card from "@/app/components/Card";
import { useWeb3 } from "@/app/context/Web3Context";
import { Skeleton } from "@/app/components/Skeleton";
import { handleTxError } from "@/lib/errors";
import { MockIPFS } from "@/lib/storage";

import { useToast } from "@/app/context/ToastContext";

export default function ReportDetails() {
  const { addToast } = useToast();
  const { id } = useParams();
  const { signer, provider, isConnected, connect, address } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
        if (!provider || !id) return;
        try {
            const data: any = await getReport(provider, Number(id));
            
            // Try to fetch real content from MockIPFS
            const rawContent = await MockIPFS.get(data.ipfsHash);
            if (rawContent) {
                try {
                  const parsed = JSON.parse(rawContent);
                  data.details = parsed.fileContent;
                  data.summary = parsed.summary;
                  data.fileType = parsed.fileType;
                  data.fileName = parsed.fileName;
                  data.hasFile = parsed.hasFile;
                } catch {
                  data.details = rawContent;
                }
            }
            
            setReport(data);
        } catch (err) {
            console.error(err);
        }
    };
    fetchReport();
  }, [id, provider]);

  const handleVote = async (approve: boolean) => {
    if (!signer) {
        addToast("Authorize access first.", "warning");
        return;
    }
    setLoading(true);
    try {
      const tx = await validateReport(signer, Number(id), approve);
      await tx.wait();
      addToast("Vote recorded in global consensus.", "success");
    } catch (err) {
      handleTxError(err, "Validation failure", addToast);
    } finally {
      setLoading(false);
    }
  };

  if (!report) return <div className="max-w-4xl mx-auto pt-20"><Skeleton className="h-96 rounded-[3rem]" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header */}
      <div className="space-y-6">
        <div className="flex justify-between items-start">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    report.status === "PENDING" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                    report.status === "ACCEPTED" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                    "bg-red-500/10 text-red-500 border-red-500/20"
                    }`}>
                    {report.status}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Report #{report.id}</span>
                </div>
                <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">{report.projectName}</h1>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Researcher</p>
                <p className="text-xs font-mono text-brand-accent break-all max-w-[200px]">{report.reporter}</p>
            </div>
        </div>
        
        <Card className="px-8 py-5 flex items-center gap-6 border-white/5 bg-white/[0.02] backdrop-blur-md h-fit">
            <div className="text-right">
                <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-[0.2em] mb-1">Consensus State</p>
                <p className="text-2xl font-black text-brand-text tracking-tighter">{report.approvals} A / {report.rejections} R</p>
            </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* researcher summary */}
          {report.summary && (
            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Submission Summary</h3>
              <Card className="p-8 bg-white/[0.02] border-white/5">
                <p className="text-sm text-slate-300 leading-relaxed font-medium">{report.summary}</p>
              </Card>
            </section>
          )}

          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Technical Findings</h3>
            <Card className="p-8 bg-black/40 border-white/5 font-mono text-xs leading-relaxed text-brand-muted min-h-[200px] whitespace-pre-wrap overflow-hidden">
              {report.fileType && report.fileType.startsWith("image/") ? (
                <div className="space-y-4">
                  <img src={report.details} alt="Evidence" className="max-w-full rounded-lg border border-white/10" />
                  <p className="text-[10px] uppercase tracking-widest text-brand-secondary">Image Evidence: {report.fileName}</p>
                </div>
              ) : report.fileType === "application/pdf" ? (
                <div className="flex flex-col items-center justify-center py-10 gap-6">
                  <div className="w-16 h-16 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-white mb-1">{report.fileName}</p>
                    <p className="text-[10px] text-brand-muted uppercase tracking-widest">Portable Document Format</p>
                  </div>
                  <a 
                    href={report.details} 
                    download={report.fileName}
                    className="px-6 py-3 rounded-full bg-brand-accent text-brand-bg text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
                  >
                    Download PDF Evidence
                  </a>
                </div>
              ) : (
                report.details
              )}
            </Card>
          </section>

          <div className="space-y-4">
              <p className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] pl-1">Immutable IPFS Source</p>
              <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-between group hover:border-brand-accent/30 transition-all">
                  <span className="text-xs font-bold font-mono text-brand-accent truncate max-w-sm">{report.ipfsHash}</span>
                  <button className="text-[10px] font-black text-brand-accent uppercase tracking-widest border-b-2 border-transparent group-hover:border-brand-accent pb-0.5 transition-all">Verify Proof</button>
              </div>
          </div>
        </div>

        {/* Validation Console */}
        <aside className="space-y-8">
          <Card className="p-10 space-y-10 border-brand-accent/20 bg-brand-accent/[0.01] shadow-2xl shadow-brand-accent/5">
            <div className="text-center space-y-2">
              <h3 className="text-[10px] font-black text-brand-text uppercase tracking-[0.3em]">Validation Console</h3>
              <p className="text-[10px] text-brand-secondary font-bold uppercase tracking-widest">Stake Required: {report.stakeRequired} ETH</p>
            </div>

            <div className="space-y-4">
              {!isConnected ? (
                <Button onClick={connect} className="w-full py-4 text-[10px] tracking-[0.3em] font-black uppercase">
                  Authorize Access
                </Button>
              ) : address?.toLowerCase() === report.reporter.toLowerCase() ? (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Self-Validation Guard</p>
                    <p className="text-[9px] text-amber-500/80 font-bold mt-1">Reporters cannot validate their own findings.</p>
                </div>
              ) : (
                <>
                  <Button onClick={() => handleVote(true)} loading={loading} className="w-full py-4 text-[10px] tracking-[0.3em] font-black uppercase bg-emerald-600 hover:bg-emerald-700 border-emerald-600">
                    Approve Finding
                  </Button>
                  <Button onClick={() => handleVote(false)} loading={loading} variant="secondary" className="w-full py-4 text-[10px] tracking-[0.3em] font-black uppercase">
                    Reject Finding
                  </Button>
                </>
              )}
            </div>

            <div className="pt-6 border-t border-white/5 space-y-2">
              <p className="text-[10px] font-black text-brand-secondary uppercase tracking-widest">Consensus Rules</p>
              <ul className="text-[10px] text-brand-muted leading-relaxed space-y-1 font-medium">
                <li>• Validators stake ETH to vote</li>
                <li>• Majority consensus triggers payout</li>
                <li>• Incorrect votes lose stake</li>
              </ul>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
