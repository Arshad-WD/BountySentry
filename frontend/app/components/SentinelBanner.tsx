"use client";

import Card from "./Card";

const AGENT_URL = process.env.NEXT_PUBLIC_AGENT_URL || "http://localhost:3000";

export default function SentinelBanner() {
  return (
    <a
      href={AGENT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <Card className="relative overflow-hidden p-0 border-brand-border hover:border-brand-accent/40 transition-all duration-500">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0c0a09] opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.1),transparent_50%)]" />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-10 px-8 py-8 sm:py-6">
          {/* Shield icon */}
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center backdrop-blur-sm group-hover:border-indigo-400/30 group-hover:bg-indigo-500/10 transition-all duration-500">
              <svg
                className="w-7 h-7 text-indigo-400 group-hover:text-indigo-300 transition-colors duration-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>
            {/* Pulse ring */}
            <div className="absolute -inset-1 rounded-2xl border border-indigo-500/20 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>

          {/* Text */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/80">
                Sentinel AI
              </span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-green-400">
                  Online
                </span>
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight mb-1">
              Autonomous Security Scanner
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              AI-powered vulnerability discovery &amp; reconnaissance.
              Scan websites and repos for security threats in minutes.
            </p>
          </div>

          {/* CTA */}
          <div className="shrink-0">
            <div className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] group-hover:bg-indigo-500/20 group-hover:border-indigo-400/30 transition-all duration-500">
              Launch Scanner
              <svg
                className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </div>
          </div>
        </div>
      </Card>
    </a>
  );
}
