"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import WalletButton from "./WalletButton";
import { useState, useEffect } from "react";

const AGENT_URL = process.env.NEXT_PUBLIC_AGENT_URL || "http://localhost:3000";

const navLinks = [
  { href: "/", label: "Work" },
  { href: "/bounties", label: "Bounties" },
  { href: "/submit", label: "Submit" },
  { href: "/my-submissions", label: "My Submissions" },
  { href: "/reports", label: "Reports" },
  { href: "/validators", label: "Validators" },
  { href: "/admin", label: "Admin" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <div className="fixed top-6 left-0 right-0 z-50 px-4 pointer-events-none flex justify-center">
      <nav className="glass-panel rounded-full h-14 flex items-center p-1.5 gap-2 pointer-events-auto shadow-2xl shadow-indigo-500/10 max-w-[calc(100vw-2rem)] overflow-hidden">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 px-4 py-2 rounded-full hover:bg-white/5 transition-all group shrink-0">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-brand-accent to-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
            V5
          </div>
          <span className="font-display font-bold text-sm tracking-widest uppercase text-white hidden sm:block">Protocol</span>
        </Link>

        <div className="h-6 w-px bg-white/10 mx-1 shrink-0" />

        {/* Center Links - Scrollable on mobile */}
        <div className="flex items-center overflow-x-auto no-scrollbar mask-gradient-x">
          {navLinks.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap shrink-0",
                  active 
                    ? "text-white bg-white/10 shadow-inner" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                {link.label}
              </Link>
            );
          })}
          
          <div className="h-4 w-px bg-white/10 mx-2 shrink-0" />
          
          {/* AI Scanner — External Link */}
          <a
            href={AGENT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="relative rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 text-indigo-400 hover:text-white hover:bg-indigo-500/20 border border-transparent hover:border-indigo-500/20 flex items-center gap-2 group shrink-0 whitespace-nowrap"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Scanner
          </a>
        </div>

        <div className="h-6 w-px bg-white/10 mx-1 shrink-0" />

        {/* Right Section */}
        <div className="px-1 shrink-0">
          <WalletButton />
        </div>
      </nav>
    </div>
  );
}
