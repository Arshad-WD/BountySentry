"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getBounty } from "@/services/bounty.service";
import Card from "@/app/components/Card";
import Button from "@/app/components/Button";
import Badge from "@/app/components/Badge";
import { useWeb3 } from "@/app/context/Web3Context";
import { Skeleton } from "@/app/components/Skeleton";

export default function BountyDetails() {
  const { id } = useParams();
  const { provider, isConnected, connect } = useWeb3();
  const [bounty, setBounty] = useState<any>(null);

  useEffect(() => {
    const fetchBounty = async () => {
        if (!provider || !id) return;
        try {
            const data = await getBounty(provider, Number(id));
            setBounty(data);
        } catch (err) {
            console.error(err);
        }
    };
    fetchBounty();
  }, [id, provider]);

  if (!bounty) {
    return (
        <div className="max-w-5xl mx-auto space-y-12 px-1">
            <div className="space-y-4">
                <Skeleton className="h-6 w-32 rounded-full" />
                <Skeleton className="h-12 w-2/3" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-12">
                    <Skeleton className="h-20 w-full rounded-2xl" />
                    <Skeleton className="h-64 w-full rounded-[2rem]" />
                </div>
                <Skeleton className="h-96 w-full rounded-[2rem]" />
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 px-1 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-white/5">
        <div className="space-y-4">
          <Badge variant="success">{bounty.status}</Badge>
          <h2 className="text-5xl font-black text-brand-text tracking-tighter uppercase leading-none">{bounty.projectName}</h2>
          <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-[0.3em]">Protocol Block: {bounty.id} · Secured {bounty.posted}</p>
        </div>
        
        <div className="text-right">
          <p className="text-[10px] font-black text-brand-secondary uppercase tracking-widest mb-1">Guaranteed Payout</p>
          <p className="text-5xl font-black text-brand-text tracking-tighter">{bounty.rewardEth} ETH</p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-16">
          {/* Description */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-black text-brand-text uppercase tracking-[0.4em]">Audit Directive</h3>
            <p className="text-brand-secondary leading-relaxed text-lg font-medium max-w-2xl">
              {bounty.description}
            </p>
          </section>

          {/* Scope */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-black text-brand-text uppercase tracking-[0.4em]">Resource Access</h3>
            <pre className="p-10 bg-white/[0.01] border border-white/5 text-brand-text rounded-[2.5rem] shadow-inner font-mono text-xs leading-relaxed overflow-x-auto overflow-hidden">
              {bounty.scope}
            </pre>
          </section>

          {/* Rules */}
          <section className="space-y-10">
            <h3 className="text-[10px] font-black text-brand-text uppercase tracking-[0.4em]">Operational Constraints</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bounty.rules.map((rule: string, i: number) => (
                <div key={i} className="group flex gap-5 p-6 rounded-[2rem] bg-white/[0.01] border border-white/5 hover:border-brand-accent/30 hover:bg-white/[0.02] transition-all duration-300">
                  <div className="h-2 w-2 rounded-full bg-brand-accent mt-2 shrink-0 shadow-[0_0_8px_rgba(var(--brand-accent-rgb),0.5)]" />
                  <p className="text-[11px] font-bold uppercase tracking-wider text-brand-secondary leading-relaxed group-hover:text-brand-text">{rule}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Actions */}
        <aside className="space-y-8">
          <Card className="p-10 space-y-8 border-brand-accent/20 bg-brand-accent/[0.01] shadow-2xl shadow-brand-accent/5 backdrop-blur-md">
            <h3 className="text-[10px] font-black text-brand-text uppercase tracking-[0.3em] text-center">Submission Gateway</h3>
            <p className="text-[10px] text-brand-secondary font-bold uppercase tracking-widest text-center leading-relaxed opacity-60">
              Validated vulnerabilities are paid immediately upon DAO settlement. Zero-knowledge proof required.
            </p>
            {!isConnected ? (
                <Button onClick={connect} className="w-full h-14 shadow-2xl">Authorize Access</Button>
            ) : (
                <Link href="/submit" className="block">
                    <Button className="w-full h-14 shadow-2xl">Execute Reporting</Button>
                </Link>
            )}
          </Card>

          <Card className="p-10 space-y-6 border-white/5 bg-white/[0.01] backdrop-blur-md">
            <h3 className="text-[10px] font-black text-brand-text uppercase tracking-[0.3em]">Protocol Health</h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest leading-none">Settled Payouts</span>
                <span className="text-sm font-black text-brand-text">14.2 ETH</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest leading-none">Resolved Claims</span>
                <span className="text-sm font-black text-brand-text">8 Units</span>
                </div>
                <div className="flex justify-between items-center py-3">
                <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest leading-none">Avg Settlement</span>
                <span className="text-sm font-black text-brand-text">98h 12m</span>
                </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
