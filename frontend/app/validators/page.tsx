"use client";

import { useState, useEffect } from "react";
import { getAllValidators } from "@/services/reputation.service";
import { useWeb3 } from "@/app/context/Web3Context";
import Card from "@/app/components/Card";
import StatCard from "@/app/components/StatCard";
import { CardSkeleton, StatSkeleton } from "@/app/components/Skeleton";
import Badge from "@/app/components/Badge";

export default function ValidatorsPage() {
  const { provider, isConnected, isCorrectNetwork } = useWeb3();
  const [loading, setLoading] = useState(true);
  const [validators, setValidators] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalValidators: 0,
    avgReputation: 0,
    totalValidations: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!provider || !isCorrectNetwork) {
        setLoading(false);
        return;
      }

      try {
        const data = await getAllValidators(provider);
        setValidators(data);
        
        // Calculate stats
        const totalV = data.length;
        const totalR = data.reduce((acc, curr) => acc + curr.reputation, 0);
        const totalVal = data.reduce((acc, curr) => acc + curr.validations, 0);
        
        setStats({
          totalValidators: totalV,
          avgReputation: totalV > 0 ? Math.round(totalR / totalV) : 0,
          totalValidations: totalVal,
        });
      } catch (err) {
        console.error("Failed to load validators:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [provider, isCorrectNetwork]);

  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      {/* Header */}
      <div className="max-w-3xl space-y-6">
        <Badge>Validator Network</Badge>
        <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
          Active<br />Consensus Nodes
        </h2>
        <p className="text-brand-secondary text-sm font-medium leading-relaxed max-w-xl">
          Validators play a critical role in the V5 ecosystem by verifying reported vulnerabilities. Higher reputation scores signify consistent accuracy and commitment to the protocol.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <StatCard 
              label="Total Nodes" 
              value={stats.totalValidators.toString()} 
              subValue="Verified Validators" 
            />
            <StatCard 
              label="Avg. Reputation" 
              value={stats.avgReputation.toString()} 
              subValue="Network Trust Score" 
            />
            <StatCard 
              label="Resolutions" 
              value={stats.totalValidations.toString()} 
              subValue="Cumulative Consensus" 
            />
          </>
        )}
      </div>

      {/* Validators List */}
      <div className="space-y-6">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Node Registry</h3>
        
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : validators.length === 0 ? (
            <Card className="p-16 text-center bg-white/[0.02] border-white/5 opacity-40">
                <p className="text-brand-secondary text-sm font-bold uppercase tracking-widest italic animate-pulse">
                  {isConnected ? "No active validators discovered on-chain" : "Connect wallet to witness consensus network"}
                </p>
            </Card>
          ) : (
            validators.map((validator) => (
              <Card key={validator.address} className="p-8 group hover:bg-brand-accent/[0.02] hover:border-brand-accent/30 transition-all duration-500">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-brand-accent/20 to-indigo-500/20 border border-white/5 flex items-center justify-center text-brand-accent group-hover:scale-110 transition-transform duration-500">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-brand-secondary/60 uppercase tracking-widest">Validator Identity</p>
                      <p className="text-xs font-mono text-white opacity-80 break-all">{validator.address}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-12 text-center md:text-right">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Reputation</p>
                      <p className="text-2xl font-black text-brand-accent italic tracking-tighter">{validator.reputation}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Votes</p>
                      <p className="text-2xl font-black text-white italic tracking-tighter">{validator.validations}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Earnings</p>
                      <p className="text-2xl font-black text-emerald-500 italic tracking-tighter">{validator.earnings} ETH</p>
                    </div>
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
