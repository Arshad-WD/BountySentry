"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import StatCard from "@/app/components/StatCard";
import ActionCard from "@/app/components/ActionCard";
import { StatSkeleton } from "@/app/components/Skeleton";
import SentinelBanner from "@/app/components/SentinelBanner";
import { useWeb3 } from "@/app/context/Web3Context";
import { ENV } from "@/config/env";
import { getReports } from "@/services/registry.service";
import { Currency } from "@/lib/currency";

const AGENT_URL = process.env.NEXT_PUBLIC_AGENT_URL || "http://localhost:3000";

export default function Dashboard() {
  const { provider, isCorrectNetwork, address } = useWeb3();
  const [metrics, setMetrics] = useState<any | null>(null);

  // Manual Refresh Mode
  const fetchData = async () => {
      // Use address as the primary signal for "connected"
      if (!address || !isCorrectNetwork || !provider) {
          setMetrics({
              rewards: "0.00 ETH",
              resolved: "0",
              validators: "0"
          });
          return; 
      }

      try {
        const balance = await provider.getBalance(ENV.VAULT_ADDRESS);
        const reports = await getReports(provider);
        const resolvedCount = reports.filter((r: any) => r.status === "ACCEPTED").length;

        const balanceEth = ethers.formatEther(balance);
        setMetrics({
          rewards: `${balanceEth} ETH`,
          rewardsUsd: Currency.toUSD(balanceEth),
          resolved: resolvedCount.toString(),
          validators: "12" 
        });
      } catch (err) {
        console.error("Failed to fetch dashboard metrics:", err);
      }
    };

    // Only fetch once on mount if connected, but do NOT depend on address changes
    useEffect(() => {
        if (address && isCorrectNetwork) {
            fetchData();
        }
    }, []); // Empty dependency array = NO LOOPS

  return (
    <div className="space-y-20 animate-in fade-in duration-1000 bg-grid-pattern min-h-screen pb-20">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto space-y-8 pt-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-md text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em] mb-4 animate-float">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Authorized Protocol Access
        </div>
        <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase leading-[0.9] drop-shadow-2xl">
          Vulnerability <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x">Discovery</span>
        </h2>
        <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium">
          A decentralized bug bounty platform for organizations to secure critical infrastructure and for researchers to earn institutional rewards.
        </p>
      </div>

      {/* Sentinel AI Banner */}
      <div className="max-w-6xl mx-auto">
        <SentinelBanner />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {!metrics ? (
            <>
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
            </>
        ) : (
            <>
                <StatCard label="Platform Rewards" value={metrics.rewards} subValue={metrics.rewardsUsd} />
                <StatCard label="Resolved Reports" value={metrics.resolved} />
                <StatCard label="Active Validators" value={metrics.validators} />
            </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 whitespace-nowrap">
            Operational Workflows
          </h3>
          <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ActionCard 
            title="Post a Bounty" 
            description="Organizations create security challenges by locking ETH rewards on-chain." 
            href="/bounties/create" 
            cta="Register Bounty"
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <ActionCard 
            title="Security Research" 
            description="Browse active bounties from top protocols and submit your findings." 
            href="/bounties" 
            cta="Explore Work"
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
          />
          <ActionCard 
            title="Submit Report" 
            description="Found a critical vulnerability? Submit your report hash for DAO validation." 
            href="/submit" 
            cta="File Report"
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          />
          
          {/* External Action Card - Manually styled to match ActionCard */}
          <a href={AGENT_URL} target="_blank" rel="noopener noreferrer" className="group block h-full">
            <div className="glass-card h-full relative overflow-hidden group-hover:border-indigo-500/50 transition-all duration-500 p-0">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               
               <div className="relative z-10 p-10 flex flex-col items-center text-center h-full">
                 <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-[0_0_20px_-5px_var(--brand-accent)] transition-all duration-500 mb-6">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                 </div>
                 
                 <h3 className="text-xl font-bold text-white mb-3">AI Scanner</h3>
                 <p className="text-sm text-slate-400 mb-8 leading-relaxed max-w-[240px] group-hover:text-white/80 transition-colors">
                   Launch autonomous security scans on any target.
                 </p>
                 
                 <div className="mt-auto flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-400 group-hover:text-white transition-all pb-1 border-b border-transparent group-hover:border-white/30">
                   Launch Sentinel
                   <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                   </svg>
                 </div>
               </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
