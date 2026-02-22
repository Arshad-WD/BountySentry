"use client";

import Card from "@/app/components/Card";
import Badge from "@/app/components/Badge";

export default function DocsPage() {
  const sections = [
    {
      title: "Core Protocol",
      items: [
        { title: "Introduction", description: "Learn about the Sentinel V5 decentralized bug bounty ecosystem." },
        { title: "Consensus Mechanism", description: "How validators reach agreement on vulnerability validity." },
        { title: "Reward Distribution", description: "The science behind automated payouts and gas compensation." },
      ]
    },
    {
      title: "Hunters Guide",
      items: [
        { title: "Submission Process", description: "Step-by-step guide to submitting your first on-chain report." },
        { title: "Proof of Concept", description: "Proper formatting for vulnerability evidence and hashes." },
        { title: "Reputation System", description: "Building your hunter trust score for higher rewards." },
      ]
    },
    {
      title: "Validator Guide",
      items: [
        { title: "Node Setup", description: "Requirements for running an active V5 consensus node." },
        { title: "Voting Rules", description: "Ethical guidelines and technical steps for report validation." },
        { title: "Stake & Slashing", description: "Understanding the game theory of validator incentives." },
      ]
    }
  ];

  return (
    <div className="space-y-16 animate-in fade-in duration-1000">
      <div className="max-w-3xl space-y-6">
        <Badge>Documentation</Badge>
        <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
          Technical<br />Protocols
        </h2>
        <p className="text-brand-secondary text-sm font-medium leading-relaxed max-w-xl">
          Complete technical specifications for the Sentinel V5 ecosystem. Explore our decentralized architecture, game-theoretic incentives, and cryptographic security standards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-8">
            <h3 className="text-[10px] font-black text-brand-accent uppercase tracking-[0.4em] pb-4 border-b border-brand-accent/20">
              {section.title}
            </h3>
            <div className="space-y-4">
              {section.items.map((item, i) => (
                <Card key={i} className="p-6 bg-white/[0.01] border-white/5 hover:border-brand-accent/20 hover:bg-brand-accent/[0.01] transition-all group cursor-pointer">
                  <h4 className="text-sm font-black text-white uppercase tracking-tight mb-2 group-hover:text-brand-accent transition-colors">{item.title}</h4>
                  <p className="text-[10px] text-brand-secondary font-medium leading-relaxed">{item.description}</p>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Card className="p-16 bg-brand-accent/[0.02] border-brand-accent/20 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-brand-accent/10 transition-all duration-1000" />
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
            <div className="space-y-4">
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Need custom integration?</h3>
                <p className="text-sm text-brand-secondary font-medium max-w-md">Our developer API allows for custom dashboard integrations and automated submission pipelines.</p>
            </div>
            <button className="px-10 py-5 bg-brand-accent text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-brand-accent/20">
                View API Docs
            </button>
         </div>
      </Card>
    </div>
  );
}
