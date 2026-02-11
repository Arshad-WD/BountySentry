"use client";

import Card from "@/app/components/Card";
import Button from "@/app/components/Button";
import Link from "next/link";

export default function SecurityPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="space-y-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-black text-red-400 uppercase tracking-widest mx-auto">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Active Shield
        </div>
        <h1 className="text-6xl font-black text-brand-text tracking-tighter uppercase italic">Vulnerability <br />Disclosure</h1>
        <p className="text-brand-secondary text-lg font-medium max-w-2xl mx-auto">
            Ensuring the integrity of the decentralized ecosystem through coordinated, ethical disclosure and algorithmic transparency.
        </p>
      </div>

      <div className="grid gap-8">
        <Card className="p-12 bg-white/[0.01] border-white/5 relative overflow-hidden group hover:border-red-500/20 transition-all duration-700">
           <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm1 10h-2v-2h2v2zm0-4h-2V9h2v4z"/></svg>
           </div>
           
           <h3 className="text-2xl font-black text-brand-text uppercase tracking-tighter mb-8">Responsible Disclosure Policy</h3>
           <div className="space-y-8 text-sm text-brand-secondary leading-relaxed font-medium">
             <p>As a community-driven protocol, we encourage independent security researchers to audit our codebase. We are committed to a fair, transparent, and algorithmic resolution for all valid findings.</p>
             
             <div className="grid md:grid-cols-2 gap-10 pt-4">
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-brand-text uppercase tracking-widest text-red-400">Reward Tiers</h4>
                    <ul className="space-y-3 opacity-80">
                        <li className="flex justify-between border-b border-white/5 pb-2"><span>Critical Findings</span> <span className="text-brand-text">1.0 - 5.0 ETH</span></li>
                        <li className="flex justify-between border-b border-white/5 pb-2"><span>High Risk</span> <span className="text-brand-text">0.5 - 1.0 ETH</span></li>
                        <li className="flex justify-between border-b border-white/5 pb-2"><span>Medium Complexity</span> <span className="text-brand-text">0.1 - 0.5 ETH</span></li>
                    </ul>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-brand-text uppercase tracking-widest text-red-400">Rules of Engagement</h4>
                    <ul className="space-y-2 text-[11px] list-disc pl-4 opacity-80">
                        <li>Do not exploit vulnerabilities for personal gain.</li>
                        <li>Maintain data privacy and system stability.</li>
                        <li>Follow the local SHA-256 digital record submission process.</li>
                        <li>Public disclosure is prohibited until DAO settlement.</li>
                    </ul>
                </div>
             </div>
           </div>
        </Card>

        <div className="text-center space-y-8 pt-10">
            <h3 className="text-3xl font-black text-brand-text tracking-tight uppercase">Ready to secure the protocol?</h3>
            <div className="flex justify-center gap-6">
                <Link href="/submit">
                    <Button className="px-12 py-5 text-xs font-black tracking-widest">SUBMIT FINDING</Button>
                </Link>
                <Link href="/bounties">
                    <Button variant="secondary" className="px-12 py-5 text-xs font-black tracking-widest border border-white/10 hover:border-brand-accent/50">VIEW CATALOG</Button>
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}
