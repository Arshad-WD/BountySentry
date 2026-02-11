"use client";

import Card from "@/app/components/Card";

export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="space-y-4 text-center">
        <h1 className="text-6xl font-black text-brand-text tracking-tighter uppercase italic">Protocol <br />Documentation</h1>
        <p className="text-brand-secondary text-lg font-medium max-w-2xl mx-auto">
          The technical foundation of V5: A decentralized discovery platform powered by cryptographic consensus.
        </p>
      </div>

      <div className="grid gap-12">
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-[10px] font-black text-brand-accent uppercase tracking-[0.5em] whitespace-nowrap">01 Architectural Flow</h2>
            <div className="h-px w-full bg-brand-accent/10" />
          </div>
          <Card className="p-10 bg-white/[0.01] border-white/5 backdrop-blur-xl">
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="h-8 w-8 rounded-lg bg-brand-accent/20 flex items-center justify-center text-brand-accent font-bold text-xs shrink-0">1</div>
                <div>
                  <h4 className="text-sm font-black text-brand-text uppercase mb-2">Bounty Initialization</h4>
                  <p className="text-xs text-brand-secondary leading-relaxed">Protocols commit ETH capital to the <code>BountyVault.sol</code> contract. Reward is algorithmically locked and immutable until settlement.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="h-8 w-8 rounded-lg bg-brand-accent/20 flex items-center justify-center text-brand-accent font-bold text-xs shrink-0">2</div>
                <div>
                  <h4 className="text-sm font-black text-brand-text uppercase mb-2">Cryptographic Reporting</h4>
                  <p className="text-xs text-brand-secondary leading-relaxed">Researchers submit findings. Documents are hashed locally (SHA-256) and the "digital fingerprint" is pushed to <code>ReportRegistry.sol</code>.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="h-8 w-8 rounded-lg bg-brand-accent/20 flex items-center justify-center text-brand-accent font-bold text-xs shrink-0">3</div>
                <div>
                  <h4 className="text-sm font-black text-brand-text uppercase mb-2">Consensus Validation</h4>
                  <p className="text-xs text-brand-secondary leading-relaxed">Decentralized validators stake capital to verify findings. Achieving majority consensus triggers the automated payout mechanism.</p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-[10px] font-black text-brand-text uppercase tracking-[0.5em] whitespace-nowrap">02 Node Operations</h2>
            <div className="h-px w-full bg-white/5" />
          </div>
          <Card className="p-10 border-white/5 bg-black/20 font-mono text-xs leading-relaxed space-y-4">
            <p className="text-brand-accent"># Protocol Launch Sequence</p>
            <div className="space-y-2 opacity-80">
                <p>$ git clone v5-protocol</p>
                <p>$ cd DAO && npx hardhat node</p>
                <p>$ npx hardhat ignition deploy modules/Deploy.ts --network localhost</p>
            </div>
            <div className="pt-4 mt-4 border-t border-white/5">
                <p className="text-brand-secondary select-all">Vault Address: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512</p>
                <p className="text-brand-secondary select-all">Registry Address: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0</p>
            </div>
          </Card>
        </section>
      </div>
      
      <div className="p-10 rounded-[3rem] border border-brand-accent/20 bg-brand-accent/[0.02] text-center">
         <p className="text-[10px] font-black text-brand-accent uppercase tracking-widest mb-2">Alpha v5.0.1</p>
         <p className="text-xs text-brand-secondary italic">"In algorithms we trust, in discovery we thrive."</p>
      </div>
    </div>
  );
}
