"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { motion } from "framer-motion";
import { Menu, Shield } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md border-b border-white/10 z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center">
                <Shield className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white uppercase">Sentinel</span>
        </div>
        <button 
            onClick={() => setIsMobileOpen(true)}
            className="p-2 text-slate-400 hover:text-white transition-colors"
        >
            <Menu size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <Sidebar mobileOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
      
      {/* Main Content Area */}
      <main className="lg:pl-72 min-h-screen relative z-10 pt-20 lg:pt-0">
        <div className="mx-auto px-4 py-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
