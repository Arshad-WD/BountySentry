"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBounties } from "@/services/bounty.service";
import Card from "@/app/components/Card";
import Button from "@/app/components/Button";
import { CardSkeleton } from "@/app/components/Skeleton";
import { useWeb3 } from "@/app/context/Web3Context";
import { Currency } from "@/lib/currency";

export default function BountiesList() {
  const { provider, isConnected, connect } = useWeb3();
  const router = useRouter();
  const [bounties, setBounties] = useState<any[] | null>(null);

  useEffect(() => {
    const fetchBounties = async () => {
        if (!provider) return;
        try {
            const data = await getBounties(provider);
            console.log("Fetched bounties from blockchain:", data);
            setBounties(data);
        } catch (err) {
            console.error("Error fetching bounties:", err);
            setBounties([]);
        }
    };
    fetchBounties();
  }, [provider]);

  return (
    <div className="space-y-12 pb-20">
      <div className="flex items-end justify-between gap-8">
        <div className="max-w-2xl px-1">
          <h2 className="text-5xl font-black text-brand-text uppercase tracking-tight mb-6 italic">
            Open Bounties
          </h2>
          <p className="text-brand-secondary text-sm leading-relaxed font-medium">
            Filter through on-chain security challenges. Each reward listed is cryptographically locked in the platform vault. Discover critical vulnerabilities to earn high-yield payouts.
          </p>
        </div>
        
        <Button 
          onClick={() => router.push("/bounties/create")}
          className="px-8 py-4 text-xs tracking-[0.3em] font-black uppercase whitespace-nowrap"
        >
          + Create Bounty
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {!isConnected ? (
          <Card className="col-span-full p-20 text-center bg-white/[0.02] border-white/5 space-y-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent">
               <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
               </svg>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Access Restricted</h3>
              <p className="text-brand-secondary text-sm max-w-md mx-auto font-medium">
                Please connect your wallet to synchronize with the Sentinel mainnet and view active security challenges.
              </p>
            </div>
            <Button onClick={connect} className="px-12 py-4 shadow-2xl">Initialize Connection</Button>
          </Card>
        ) : !bounties ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : bounties.length === 0 ? (
          <Card className="col-span-full p-20 text-center bg-white/[0.02] border-white/5">
            <p className="text-brand-secondary text-sm font-bold uppercase tracking-widest italic animate-pulse">
              No active security challenges found on the current network.
            </p>
          </Card>
        ) : (
          bounties.map((b) => (
            <Card key={b.id} className="p-8 bg-white/[0.02] border-white/5 hover:border-brand-accent/30 transition-all duration-500 cursor-pointer group" onClick={() => router.push(`/bounties/${b.id}`)}>
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest">Bounty #{b.id}</span>
                    <h3 className="text-xl font-black text-brand-text tracking-tight uppercase group-hover:text-brand-accent transition-colors">{b.projectName}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    b.status === "Open" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-slate-500/10 text-slate-500 border border-slate-500/20"
                  }`}>
                    {b.status}
                  </span>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black text-brand-secondary uppercase tracking-widest mb-1">Locked Reward</p>
                    <div className="text-right">
                      <p className="text-xs font-black text-brand-text uppercase tracking-widest mb-1">{b.rewardEth} ETH</p>
                      <p className="text-[10px] font-bold text-brand-accent tracking-tighter">{Currency.toUSD(b.rewardEth)}</p>
                    </div>
                  </div>
                  <Button variant="secondary" className="text-[10px] px-6 h-9 group-hover:bg-brand-accent group-hover:text-white group-hover:border-brand-accent">
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
