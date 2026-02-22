"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitReport } from "@/services/registry.service";
import { getBounties } from "@/services/bounty.service";
import Button from "@/app/components/Button";
import Card from "@/app/components/Card";
import { useWeb3 } from "@/app/context/Web3Context";
import { handleTxError } from "@/lib/errors";
import { MockIPFS } from "@/lib/storage";
import { Currency } from "@/lib/currency";
import { CardSkeleton } from "@/app/components/Skeleton";

import { useToast } from "@/app/context/ToastContext";

export default function SubmitReport() {
  const { addToast } = useToast();
  const { signer, provider, isConnected, connect, isCorrectNetwork, switchNetwork } = useWeb3();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newReportId, setNewReportId] = useState<number | null>(null);
  const [bounties, setBounties] = useState<any[] | null>(null);
  const [selectedBounty, setSelectedBounty] = useState<any | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [fileHash, setFileHash] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState({
    summary: "",
  });

  // Fetch bounties from blockchain
  useEffect(() => {
    const fetchBounties = async () => {
      if (!provider || !isCorrectNetwork) {
          if (isConnected && !isCorrectNetwork) {
              setBounties([]);
          }
          return;
      }
      try {
        const data = await getBounties(provider);
        console.log("Fetched bounties from blockchain:", data);
        setBounties(data.filter(b => b.status === "Open")); // Only show open bounties
      } catch (err) {
        console.error("Failed to load bounties:", err);
        setBounties([]);
      }
    };
    fetchBounties();
  }, [provider, isCorrectNetwork, isConnected]);

  // Handle file upload
  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      setFileContent(content);
      
      // Generate SHA-256 hash
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
      setFileHash(hashHex);
    };
    reader.readAsText(selectedFile);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signer) {
        addToast("Please connect your wallet first.", "warning");
        return;
    }
    if (!fileHash) {
        addToast("Please upload a report document.", "warning");
        return;
    }
    if (!selectedBounty) {
        addToast("Please select a target bounty.", "warning");
        return;
    }
    
    setLoading(true);
    try {
      // Store content in MockIPFS
      const ipfsData = JSON.stringify({
        summary: formData.summary,
        fileContent: fileContent
      });
      MockIPFS.save(fileHash, ipfsData);
      
      // Submit to blockchain
      const tx = await submitReport(signer, Number(selectedBounty.id), fileHash);
      const receipt = await tx.wait();
      
      // Extract report ID from event (ReportSubmitted)
      // The event is: ReportSubmitted(uint256 indexed reportId, uint256 indexed bountyId, address reporter, string ipfsHash)
      // reportId is the 1st parameter (index 0)
      let reportId = 0;
      try {
        const event = receipt?.logs.find((log: any) => log.fragment?.name === "ReportSubmitted");
        if (event) {
            reportId = Number(event.args[0]);
        }
      } catch (e) {
        console.error("Failed to extract report ID from receipt", e);
      }
      
      setNewReportId(reportId);
      addToast("Report submitted successfully!", "success");
      setSuccess(true);
    } catch (err: any) {
      handleTxError(err, "Report submission failed", addToast);
    } finally {
      setLoading(false);
    }
  };

  if (success && newReportId !== null) {
    return (
      <div className="max-w-2xl mx-auto pt-20 text-center space-y-12 animate-in zoom-in-95 duration-700">
        {/* Success Animation */}
        <div className="relative">
          <div className="h-32 w-32 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-500 shadow-2xl shadow-emerald-500/30 animate-pulse">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl -z-10 animate-pulse" />
        </div>

        {/* Success Message */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">Report Submitted!</h2>
            <p className="text-brand-secondary text-sm font-medium max-w-md mx-auto">
              Your vulnerability report has been recorded on-chain and is now pending validator review.
            </p>
          </div>

          {/* Report ID Display */}
          <Card className="p-8 bg-emerald-500/5 border-emerald-500/20 max-w-md mx-auto">
            <div className="space-y-3">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Report ID</p>
              <p className="text-6xl font-black text-emerald-500 tracking-tighter">#{newReportId}</p>
              <p className="text-xs text-brand-secondary font-medium">Auto-generated from blockchain</p>
            </div>
          </Card>

          {/* Report Details */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <Card className="p-6 bg-white/[0.02] border-white/5">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Target Bounty</p>
              <p className="text-xl font-black text-white tracking-tight">#{selectedBounty?.id}</p>
              <p className="text-xs text-slate-400 font-medium line-clamp-1">{selectedBounty?.projectName}</p>
            </Card>
            <Card className="p-6 bg-white/[0.02] border-white/5">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Status</p>
              <p className="text-xl font-black text-amber-500 tracking-tight uppercase">Pending</p>
              <p className="text-xs text-slate-400 font-medium">Awaiting validation</p>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button onClick={() => router.push(`/reports/${newReportId}`)} className="px-8">
            View Report
          </Button>
          <Button onClick={() => router.push("/my-submissions")} variant="secondary" className="px-8">
            My Submissions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pt-10 pb-20 relative">
      {!isConnected && (
         <div className="absolute inset-0 z-50 bg-brand-bg/60 backdrop-blur-md flex items-center justify-center p-8 rounded-[3rem]">
            <Card className="max-w-md w-full p-12 text-center space-y-8 border-brand-accent/20 bg-brand-accent/[0.02] shadow-2xl">
              <div className="w-20 h-20 mx-auto rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent shadow-2xl shadow-brand-accent/20">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">Secure Uplink Required</h3>
                <p className="text-[10px] text-brand-secondary font-bold uppercase tracking-[0.2em] leading-relaxed">
                  Cryptographic verification is required to submit vulnerabilities. Please connect your protocol wallet.
                </p>
              </div>
              <Button onClick={connect} className="w-full py-5 text-xs font-black uppercase tracking-[0.3em] shadow-2xl">Initialize Secure Link</Button>
            </Card>
         </div>
      )}
      {/* Header */}
      <div className="text-center mb-16 space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-[10px] font-black text-emerald-500 uppercase tracking-widest border border-emerald-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Secure Submission
        </div>
        <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-tight">
          Submit Vulnerability<br />Report
        </h2>
        <p className="text-brand-secondary text-sm font-medium max-w-xl mx-auto leading-relaxed">
          Report security vulnerabilities and earn rewards. Your submission will receive an auto-generated ID and be cryptographically verified.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Bounty Selection */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Select Target Bounty</h3>
            {bounties && bounties.length > 0 && (
              <span className="text-[10px] font-bold text-brand-accent uppercase tracking-wider">
                {bounties.length} open {bounties.length === 1 ? 'bounty' : 'bounties'}
              </span>
            )}
          </div>

          {!bounties ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : bounties.length === 0 ? (
            <Card className="p-16 text-center bg-white/[0.02] border-white/5">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-slate-500/10 border border-slate-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-black text-white uppercase tracking-tight">No Open Bounties</p>
                  <p className="text-sm text-brand-secondary">Check back later for new security challenges.</p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bounties.map((bounty) => (
                <Card
                  key={bounty.id}
                  onClick={() => setSelectedBounty(bounty)}
                  className={`p-6 cursor-pointer transition-all duration-300 ${
                    selectedBounty?.id === bounty.id
                      ? 'bg-brand-accent/10 border-brand-accent shadow-lg shadow-brand-accent/20'
                      : 'bg-white/[0.02] border-white/5 hover:border-brand-accent/30'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest">
                        Bounty #{bounty.id}
                      </span>
                      {selectedBounty?.id === bounty.id && (
                        <div className="w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <h4 className="text-sm font-black text-white tracking-tight line-clamp-2">{bounty.projectName}</h4>
                    <div className="pt-3 border-t border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Reward</p>
                      <p className="text-lg font-black text-brand-accent tracking-tight">{bounty.rewardEth} ETH</p>
                      <p className="text-[10px] font-bold text-brand-accent/60">{Currency.toUSD(bounty.rewardEth)}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* File Upload */}
        {selectedBounty && (
          <Card className="p-10 bg-white/[0.02] border-white/5">
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Upload Evidence
                </label>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
                    dragActive
                      ? 'border-brand-accent bg-brand-accent/5'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.pdf,.doc,.docx,.md"
                    onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                    className="hidden"
                  />
                  
                  {!file ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center">
                        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-white">Drag and drop your file here</p>
                        <p className="text-xs text-slate-400">or</p>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs px-6"
                        >
                          Browse Files
                        </Button>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Supported: TXT, PDF, DOC, DOCX, MD
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-white">{file.name}</p>
                        <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setFile(null);
                          setFileContent("");
                          setFileHash("");
                        }}
                        className="text-xs px-6"
                      >
                        Remove File
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Hash Display */}
              {fileHash && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    SHA-256 Hash
                  </label>
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-brand-accent break-all">
                    {fileHash}
                  </div>
                  <p className="text-[10px] text-brand-secondary/60 font-medium">
                    This cryptographic hash will be stored on-chain as proof of your submission.
                  </p>
                </div>
              )}

              {/* Technical Summary */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Technical Summary
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Provide a brief summary of the vulnerability, impact, and steps to reproduce..."
                  className="w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-white focus:border-brand-accent transition-all outline-none resize-none placeholder:text-slate-600"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Submit Button */}
        {selectedBounty && (
          <div className="flex justify-center">
            {!isConnected ? (
              <Button onClick={connect} type="button" className="px-16 py-6 text-xs tracking-[0.3em] font-black uppercase shadow-2xl">
                Connect Wallet
              </Button>
            ) : !isCorrectNetwork ? (
              <Button onClick={switchNetwork} type="button" variant="danger" className="px-16 py-6 text-xs tracking-[0.3em] font-black uppercase shadow-2xl">
                Switch to Local Network
              </Button>
            ) : (
              <Button
                type="submit"
                className="px-16 py-6 text-xs tracking-[0.3em] font-black uppercase shadow-2xl"
                loading={loading}
                disabled={!file || !fileHash}
              >
                {loading ? "Submitting Report..." : "Submit Report On-Chain"}
              </Button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
