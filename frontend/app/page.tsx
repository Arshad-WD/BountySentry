"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import StatCard from "@/app/components/StatCard";
import ActionCard from "@/app/components/ActionCard";
import Button from "@/app/components/Button";
import Card from "@/app/components/Card";
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
      <div className="relative text-center max-w-4xl mx-auto space-y-8 pt-20">
        {/* Decorative Core */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[120px] -z-10 animate-pulse-glow" />
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent/20 bg-brand-accent/5 backdrop-blur-md text-[10px] font-bold text-brand-accent uppercase tracking-[0.3em] mb-4 animate-float">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
            V5 Protocol Active
        </div>
        <h2 className="text-5xl sm:text-7xl md:text-9xl font-black text-brand-text tracking-tighter uppercase leading-[0.85] drop-shadow-2xl">
          Sentinel <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent via-indigo-500 to-brand-accent animate-gradient-x">Evolution</span>
        </h2>
        <p className="text-xl text-brand-muted leading-relaxed max-w-2xl mx-auto font-medium">
          The first decentralized security engine utilizing recursive on-chain consensus to protect the future of DeFi.
        </p>
      </div>

      {/* Sentinel AI Banner */}
      <div className="max-w-6xl mx-auto">
        <SentinelBanner />
      </div>

      {/* Metrics & Activity */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <StatCard 
                    label="Active Validators" 
                    value={metrics.validators} 
                    className="md:col-span-2"
                  />
              </>
          )}
        </div>

        {/* Live Delta */}
        <Card className="p-10 border-brand-accent/20 bg-brand-accent/[0.01] flex flex-col justify-between">
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-[10px] font-black text-brand-accent uppercase tracking-[0.4em]">Protocol Delta</h3>
                 <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-4">
                 {[1, 2, 3].map((i) => (
                    <div key={i} className="group cursor-pointer">
                       <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono text-brand-muted uppercase">Event_Seq_{i}42</span>
                          <span className="text-[8px] font-black text-emerald-500 uppercase px-1.5 py-0.5 bg-emerald-500/10 rounded">Verified</span>
                       </div>
                       <p className="text-xs font-bold text-brand-text group-hover:text-brand-accent transition-colors">Vulnerability Settlement Engine Processed</p>
                    </div>
                 ))}
              </div>
           </div>
           <Button variant="secondary" className="mt-10 py-4 text-[9px]">Connect Uplink</Button>
        </Card>
      </div>

      {/* Protocol Pipeline */}
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex items-center gap-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-muted whitespace-nowrap">
            Security Pipeline
          </h3>
          <div className="h-px w-full bg-gradient-to-r from-brand-border to-transparent" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Connecting Line (Desktop) */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-brand-accent/20 via-brand-accent/20 to-transparent -z-10 hidden md:block" />
          
          {[
            { step: "01", title: "Protocol Staking", desc: "Organizations lock bounty collateral in the immutable V5 Vault." },
            { step: "02", title: "Proof Submission", desc: "Security researchers submit cryptographically hashed reports." },
            { step: "03", title: "Consensus Cycle", desc: "Distributed validators reach agreement on vulnerability validity." },
            { step: "04", title: "Reward Trigger", desc: "On-chain settlement engine automates bounty distribution." },
          ].map((item, i) => (
            <Card key={i} className="p-10 bg-brand-card/30 border-brand-border relative group hover:border-brand-accent transition-all duration-500 hover:-translate-y-2">
               <div className="text-5xl font-black text-brand-accent/5 absolute -top-2 -right-2 italic group-hover:text-brand-accent transition-colors duration-700">
                 {item.step}
               </div>
               <div className="space-y-4">
                 <div className="h-10 w-10 rounded-xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent shadow-lg group-hover:scale-110 transition-transform">
                    {i + 1}
                 </div>
                 <h4 className="text-sm font-black text-brand-text uppercase tracking-tight">{item.title}</h4>
                 <p className="text-[10px] text-brand-muted font-bold leading-relaxed">{item.desc}</p>
               </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-8 max-w-6xl mx-auto pb-40">
        <div className="flex items-center gap-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-muted whitespace-nowrap">
            Operational Uplink
          </h3>
          <div className="h-px w-full bg-gradient-to-r from-brand-border to-transparent" />
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
          
          <ActionCard 
            title="Council Console" 
            description="Protocol guardians manage settlements and cross-chain reward orchestration." 
            href="/admin" 
            cta="Access Console"
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
          />
        </div>
      </div>
    </div>
  );
}
