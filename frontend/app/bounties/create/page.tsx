"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createBounty } from "@/services/bounty.service";
import { useWeb3 } from "@/app/context/Web3Context";
import Button from "@/app/components/Button";
import Card from "@/app/components/Card";
import { handleTxError } from "@/lib/errors";
import { Currency } from "@/lib/currency";

import { useToast } from "@/app/context/ToastContext";

export default function CreateBounty() {
  const { addToast } = useToast();
  const { signer, isConnected, connect, isCorrectNetwork, switchNetwork } = useWeb3();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newBountyId, setNewBountyId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState({
    projectName: "",
    rewardEth: "",
    description: "",
  });

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
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signer) {
        addToast("Please connect your wallet first.", "warning");
        return;
    }
    
    setLoading(true);
    try {
      const { tx, bountyId } = await createBounty(
        signer,
        formData.rewardEth,
        formData.projectName,
        formData.description
      );
      
      console.log("Bounty created with ID:", bountyId);
      setNewBountyId(bountyId);
      addToast("Bounty created successfully!", "success");
      setSuccess(true);
    } catch (err: any) {
      handleTxError(err, "Bounty creation failed", addToast);
    } finally {
      setLoading(false);
    }
  };

  if (success && newBountyId !== null) {
    return (
      <div className="max-w-2xl mx-auto pt-20 text-center space-y-12 animate-in zoom-in-95 duration-700">
        {/* Success Animation */}
        <div className="relative">
          <div className="h-32 w-32 bg-brand-accent/10 border-2 border-brand-accent/30 rounded-full flex items-center justify-center mx-auto text-brand-accent shadow-2xl shadow-brand-accent/30 animate-pulse">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-brand-accent/5 rounded-full blur-3xl -z-10 animate-pulse" />
        </div>

        {/* Success Message */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">Bounty Created!</h2>
            <p className="text-brand-secondary text-sm font-medium max-w-md mx-auto">
              Your security challenge has been locked on-chain and is now visible to researchers worldwide.
            </p>
          </div>

          {/* Bounty ID Display */}
          <Card className="p-8 bg-brand-accent/5 border-brand-accent/20 max-w-md mx-auto">
            <div className="space-y-3">
              <p className="text-[10px] font-black text-brand-accent uppercase tracking-[0.3em]">Bounty ID</p>
              <p className="text-6xl font-black text-brand-accent tracking-tighter">#{newBountyId}</p>
              <p className="text-xs text-brand-secondary font-medium">Auto-generated from blockchain</p>
            </div>
          </Card>

          {/* Bounty Details */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <Card className="p-6 bg-white/[0.02] border-white/5">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Reward</p>
              <p className="text-2xl font-black text-white tracking-tight">{formData.rewardEth} ETH</p>
              <p className="text-xs text-brand-accent font-bold">{Currency.toUSD(formData.rewardEth)}</p>
            </Card>
            <Card className="p-6 bg-white/[0.02] border-white/5">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Status</p>
              <p className="text-2xl font-black text-emerald-500 tracking-tight uppercase">Open</p>
              <p className="text-xs text-slate-400 font-medium">Accepting reports</p>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button onClick={() => router.push(`/bounties/${newBountyId}`)} className="px-8">
            View Bounty
          </Button>
          <Button 
            onClick={() => {
              setSuccess(false);
              setNewBountyId(null);
              setFormData({ projectName: "", rewardEth: "", description: "" });
            }} 
            variant="secondary"
            className="px-8"
          >
            Create Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pt-10 pb-20">
      {/* Header */}
      <div className="text-center mb-16 space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-accent/10 text-[10px] font-black text-brand-accent uppercase tracking-widest border border-brand-accent/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
          </span>
          Auto-Generated IDs
        </div>
        <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-tight">
          Create Security<br />Bounty
        </h2>
        <p className="text-brand-secondary text-sm font-medium max-w-xl mx-auto leading-relaxed">
          Lock ETH rewards on-chain to incentivize security researchers. Your bounty will receive an auto-generated ID from the blockchain.
        </p>
      </div>

      {/* Form */}
      <Card className="p-12 bg-white/[0.02] border-white/5 relative overflow-hidden backdrop-blur-3xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-brand-accent/10 blur-[100px] -mr-20 -mt-20" />
        
        <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
          {/* Project Name */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">
              Project Name
            </label>
            <input
              required
              type="text"
              placeholder="e.g. DeFi Protocol Alpha"
              className="w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-5 text-sm text-white focus:border-brand-accent transition-all outline-none placeholder:text-slate-600"
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
            />
          </div>

          {/* Reward Amount */}
          <div className="space-y-3">
            <div className="flex justify-between items-end pl-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Reward Amount (ETH)
              </label>
              {formData.rewardEth && (
                <span className="text-[10px] font-bold text-brand-accent animate-pulse uppercase tracking-wider">
                  ≈ {Currency.toUSD(formData.rewardEth)}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                required
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className="w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-5 pr-16 text-sm text-white focus:border-brand-accent transition-all outline-none placeholder:text-slate-600"
                value={formData.rewardEth}
                onChange={(e) => setFormData({ ...formData, rewardEth: e.target.value })}
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-500 uppercase">
                ETH
              </div>
            </div>
            <p className="text-[10px] text-brand-secondary/60 leading-relaxed font-medium px-1">
              Minimum: 0.01 ETH • Funds will be locked in the vault until a valid report is accepted.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">
              Challenge Description
            </label>
            <textarea
              required
              rows={6}
              placeholder="Describe the scope, target contracts, and what you're looking for researchers to find..."
              className="w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-sm text-white focus:border-brand-accent transition-all outline-none resize-none placeholder:text-slate-600"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <p className="text-[10px] text-brand-secondary/60 leading-relaxed font-medium px-1">
              Be specific about the scope and rules. This will be stored on IPFS and linked to your bounty.
            </p>
          </div>

          {/* File Upload (Optional) */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">
              Scope Documents (Optional)
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                dragActive
                  ? 'border-brand-accent bg-brand-accent/5'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.md"
                onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                className="hidden"
              />
              
              {!file ? (
                <div className="space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-white/5 flex items-center justify-center">
                    <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">Drag and drop scope documents</p>
                    <p className="text-[10px] text-slate-400">or</p>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[10px] px-4 py-2"
                    >
                      Browse Files
                    </Button>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">
                    PDF, DOC, DOCX, TXT, MD
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">{file.name}</p>
                    <p className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setFile(null)}
                    className="text-[10px] px-4 py-2"
                  >
                    Remove File
                  </Button>
                </div>
              )}
            </div>
            <p className="text-[10px] text-brand-secondary/60 leading-relaxed font-medium px-1">
              Upload smart contracts, scope definitions, or reference materials for researchers.
            </p>
          </div>

          {/* Info Box */}
          <Card className="p-6 bg-brand-accent/5 border-brand-accent/20">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-brand-accent uppercase tracking-wider">Auto-Generated ID</p>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Your bounty will receive a unique ID automatically from the blockchain. No manual input required.
                </p>
              </div>
            </div>
          </Card>

          {/* Submit Button */}
          <div className="pt-6">
            {!isConnected ? (
              <Button onClick={connect} type="button" className="w-full py-6 text-xs tracking-[0.3em] font-black uppercase shadow-2xl">
                Connect Wallet
              </Button>
            ) : !isCorrectNetwork ? (
              <Button onClick={switchNetwork} type="button" variant="danger" className="w-full py-6 text-xs tracking-[0.3em] font-black uppercase shadow-2xl">
                Switch to Local Network
              </Button>
            ) : (
              <Button type="submit" className="w-full py-6 text-xs tracking-[0.3em] font-black uppercase shadow-2xl" loading={loading}>
                {loading ? "Creating Bounty..." : "Lock Bounty On-Chain"}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
