"use client";

import Card from "@/app/components/Card";
import Badge from "@/app/components/Badge";

export default function SecurityPage() {
  const audits = [
    { date: "Feb 2026", auditor: "Sentinel Core", scope: "V5 Smart Contracts", status: "PASSED", result: "0 Critical, 0 High Issues" },
    { date: "Jan 2026", auditor: "Internal Team", scope: "Vault Logic", status: "VERIFIED", result: "Formal Verification Complete" },
  ];

  return (
    <div className="space-y-16 animate-in fade-in duration-1000">
      <div className="max-w-3xl space-y-6">
        <Badge>Trust & Integrity</Badge>
        <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
          Security<br />Architecture
        </h2>
        <p className="text-brand-secondary text-sm font-medium leading-relaxed max-w-xl">
          All platform funds are locked in immutable smart contracts. Sentinel V5 uses multi-layered cryptographic verification to ensure payouts are only triggered by verified consensus.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-12 space-y-8 bg-emerald-500/[0.01] border-emerald-500/20">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                   </svg>
                </div>
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Vault Security</h3>
            </div>
            <p className="text-sm text-brand-secondary leading-relaxed font-medium">
                The BountyVault contract and ReportRegistry utilize a two-step verification flow. Rewards are only unlocked when Validators reach a cryptographically proofed consensus on report validity. Zero manual intervention is possible outside of governance proposals.
            </p>
            <ul className="space-y-3">
                {['Time-locked withdrawals for governance', 'Multi-validator consensus required', 'Re-entrancy protection active'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-[10px] font-black text-white/60 uppercase tracking-widest">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {item}
                    </li>
                ))}
            </ul>
        </Card>

        <Card className="p-12 space-y-8 bg-brand-accent/[0.01] border-brand-accent/20">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-4.44-2.03c1.713-3.147 3.326-6.447 3.498-10.474a.672.672 0 00-.672-.651H3.866a.672.672 0 00-.672.651c.172 4.027 1.785 7.327 3.498 10.474m7.744-2.03c1.713-3.147 3.326-6.447 3.498-10.474a.672.672 0 00-.672-.651H13.1a.672.672 0 00-.672.651c.172 4.027 1.785 7.327 3.498 10.474M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                </div>
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Privacy Standards</h3>
            </div>
            <p className="text-sm text-brand-secondary leading-relaxed font-medium">
                Sentinel V5 prioritizes hunter anonymity. Reports are hashed client-side before submission. Technical details are stored in encrypted form, ensuring that proprietary vulnerability data remains secure until fixed and disclosed by project owners.
            </p>
            <ul className="space-y-3">
                {['Client-side SHA-256 hashing', 'Encrypted data transmission', 'Post-fix disclosure mechanism'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-[10px] font-black text-white/60 uppercase tracking-widest">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
                        {item}
                    </li>
                ))}
            </ul>
        </Card>
      </div>

      <div className="space-y-8">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Audit Logs</h3>
        <div className="space-y-4">
            {audits.map((audit, i) => (
                <Card key={i} className="p-8 bg-white/[0.01] border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-8">
                        <div className="text-center min-w-[80px]">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Date</p>
                            <p className="text-xs font-bold text-white">{audit.date}</p>
                        </div>
                        <div className="h-8 w-px bg-white/5" />
                        <div>
                            <p className="text-[10px] font-black text-brand-accent uppercase tracking-widest mb-1">{audit.auditor}</p>
                            <p className="text-sm font-black text-white uppercase tracking-tight">{audit.scope}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-8">
                         <div className="text-right">
                             <p className="text-xs font-bold text-white mb-1">{audit.result}</p>
                             <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{audit.status}</p>
                         </div>
                         <button className="px-6 py-3 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5">
                             Report
                         </button>
                    </div>
                </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
