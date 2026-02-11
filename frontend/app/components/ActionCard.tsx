"use client";

import Card from "./Card";
import Link from "next/link";
import { cn } from "@/lib/cn";

interface ActionCardProps {
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: React.ReactNode;
}

export default function ActionCard({ title, description, href, cta, icon }: ActionCardProps) {
  return (
    <Link href={href} className="group block h-full">
      <Card className="h-full relative overflow-hidden group-hover:border-brand-accent/50 transition-all duration-700 glass-card">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="relative z-10 p-12 flex flex-col items-center text-center h-full">
          <div className="h-16 w-16 rounded-[2rem] bg-indigo-500/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent group-hover:scale-110 group-hover:bg-brand-accent group-hover:text-white group-hover:shadow-[0_0_30px_-5px_var(--brand-accent)] transition-all duration-700 mb-8">
            {icon}
          </div>
          
          <h3 className="text-2xl font-black text-brand-text mb-4 group-hover:text-white transition-colors tracking-tighter uppercase">{title}</h3>
          
          <p className="text-sm text-brand-muted/80 mb-10 leading-relaxed max-w-[260px] group-hover:text-brand-text/90 transition-colors font-medium">
            {description}
          </p>
          
          <div className="mt-auto flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-brand-accent group-hover:text-white transition-all pb-1 border-b border-transparent group-hover:border-white/30">
            {cta}
            <svg className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </div>
        </div>
      </Card>
    </Link>
  );
}
