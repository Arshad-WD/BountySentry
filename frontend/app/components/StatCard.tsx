"use client";

import Card from "./Card";

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  className?: string;
}

export default function StatCard({ label, value, subValue, className }: StatCardProps) {
  return (
    <Card className={`p-8 bg-white/[0.02] border-white/5 relative overflow-hidden group transition-all duration-700 hover:border-brand-accent/30 ${className || ''}`}>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <div className="w-16 h-16 rounded-full border border-brand-accent animate-pulse" />
      </div>
      
      <div className="relative z-10 space-y-2">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.3em]">{label}</p>
        <div className="flex flex-col">
            <p className="text-4xl font-black text-brand-text tracking-tighter uppercase italic">{value}</p>
            {subValue && <p className="text-xs font-bold text-brand-accent tracking-widest uppercase">{subValue}</p>}
        </div>
      </div>
    </Card>
  );
}
