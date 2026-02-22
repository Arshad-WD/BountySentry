"use client";

import { useState, useEffect } from "react";
import { getGovernanceStats, getRecentDAOEvents } from "@/services/governance.service";
import { useWeb3 } from "@/app/context/Web3Context";
import Card from "@/app/components/Card";
import StatCard from "@/app/components/StatCard";
import { StatSkeleton } from "@/app/components/Skeleton";
import Badge from "@/app/components/Badge";

export default function GovernancePage() {
  const { provider, isConnected, isCorrectNetwork } = useWeb3();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!provider || !isCorrectNetwork) {
        setLoading(false);
        return;
      }
      
      try {
        const [s, e] = await Promise.all([
          getGovernanceStats(provider),
          getRecentDAOEvents(provider)
        ]);
        setStats(s);
        setEvents(e);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [provider, isCorrectNetwork]);

  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      {/* Hero */}
      <div className="max-w-3xl space-y-6">
        <Badge>DAO Infrastructure</Badge>
        <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
          Governance &<br />Consensus
        </h2>
        <p className="text-brand-secondary text-sm font-medium leading-relaxed max-w-xl">
          The Sentinel platform is governed by a decentralized consensus model. Validators stake capital to verify vulnerability reports, ensuring integrity and trustless reward distribution.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {loading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : stats ? (
          <>
            <StatCard label="Vault Reserve" value={`${stats.vaultBalance} ETH`} subValue="Locked Rewards" />
            <StatCard label="Report Volume" value={stats.reportCount.toString()} subValue="Total Submissions" />
            <StatCard label="DAO Fee" value={`${stats.platformFeePercent}%`} subValue="Platform Revenue" />
            <StatCard label="Stake Req." value={`${stats.validatorStake} ETH`} subValue="Validator Minimum" />
          </>
        ) : (
          <Card className="col-span-4 p-8 text-center bg-white/[0.02] border-white/5">
            <p className="text-brand-secondary text-sm font-bold uppercase tracking-widest italic animate-pulse">
              Connect to supported network to view DAO status
            </p>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* DAO Rules */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Protocol Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-8 space-y-4 bg-white/[0.02] border-white/5 hover:border-brand-accent/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent group-hover:bg-brand-accent group-hover:text-brand-bg transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-black text-white uppercase tracking-tight">Validator Threshold</h4>
                </div>
                <p className="text-xs text-brand-secondary leading-relaxed font-medium">
                  Majority consensus (2/3 approvals) is required for report acceptance. This prevents single-node malicious actors from triggering payouts.
                </p>
              </Card>

              <Card className="p-8 space-y-4 bg-white/[0.02] border-white/5 hover:border-brand-accent/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-brand-bg transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-black text-white uppercase tracking-tight">Financial Sashing</h4>
                </div>
                <p className="text-xs text-brand-secondary leading-relaxed font-medium">
                  Incorrect validator votes result in full stake slashing. Slashed funds are redirected to the protocol treasury for platform maintenance.
                </p>
              </Card>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Governance Treasury</h3>
            <Card className="p-10 border-brand-accent/20 bg-brand-accent/[0.02] relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 blur-[60px]" />
               <div className="flex flex-col md:flex-row items-center gap-10">
                 <div className="space-y-2 text-center md:text-left">
                   <p className="text-[10px] font-black text-brand-accent uppercase tracking-widest italic">Current Managed Address</p>
                   {stats ? (
                     <p className="text-xs font-mono text-white opacity-80 break-all">{stats.treasury}</p>
                   ) : (
                     <p className="text-xs font-mono text-slate-600 italic">Not Connected</p>
                   )}
                 </div>
                 <div className="h-px w-full md:h-12 md:w-px bg-white/5" />
                 <div className="text-center md:text-left">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Fee Model</p>
                    <p className="text-xl font-black text-white italic tracking-tighter uppercase">Protocol Flat 5%</p>
                 </div>
               </div>
            </Card>
          </section>
        </div>

        {/* Live Activity */}
        <aside className="space-y-6">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">On-Chain Activity</h3>
          <Card className="bg-white/[0.01] border-white/5 divide-y divide-white/5">
            {loading ? (
              <div className="p-10 flex flex-col items-center gap-4 opacity-40">
                <svg className="w-8 h-8 animate-spin text-brand-accent" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-[10px] font-black text-brand-accent uppercase tracking-widest">Scanning Blockchain...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="p-12 text-center opacity-40">
                <p className="text-[10px] font-black text-brand-secondary uppercase tracking-widest italic">No recent events found</p>
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="p-6 space-y-2 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-black uppercase tracking-wider ${
                      event.type === 'RESOLVED' ? 'text-emerald-400' :
                      event.type === 'SUBMITTED' ? 'text-amber-400' : 'text-indigo-400'
                    }`}>
                      {event.type}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">Block #{event.block}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{event.id}</p>
                </div>
              ))
            )}
          </Card>
          <p className="text-[9px] text-slate-500 font-medium text-center px-4 italic">
            Visualizing events from ReportRegistry & BountyVault contracts
          </p>
        </aside>
      </div>
    </div>
  );
}
