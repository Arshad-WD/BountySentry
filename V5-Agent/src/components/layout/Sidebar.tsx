"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Shield, 
  AlertTriangle, 
  Globe, 
  Settings as SettingsIcon, 
  LogOut,
  ArrowLeftCircle,
  Zap,
  Activity
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3001";

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onClose = () => {} }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed", error);
      setIsSigningOut(false);
    }
  };

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard", accent: "from-blue-500 to-cyan-500", activeBg: "bg-blue-500/10", activeText: "text-blue-400" },
    { name: "Scans", icon: Shield, path: "/dashboard/scans", accent: "from-cyan-500 to-teal-500", activeBg: "bg-cyan-500/10", activeText: "text-cyan-400" },
    { name: "Vulnerabilities", icon: AlertTriangle, path: "/dashboard/vulnerabilities", accent: "from-red-500 to-orange-500", activeBg: "bg-red-500/10", activeText: "text-red-400" },
    { name: "Assets", icon: Globe, path: "/dashboard/assets", accent: "from-emerald-500 to-green-500", activeBg: "bg-emerald-500/10", activeText: "text-emerald-400" },
    { name: "Settings", icon: SettingsIcon, path: "/dashboard/settings", accent: "from-violet-500 to-purple-500", activeBg: "bg-violet-500/10", activeText: "text-violet-400" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className="p-6 pb-5">
        <Link href="/dashboard" className="flex items-center gap-3 group" onClick={onClose}>
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white to-slate-200 flex items-center justify-center shadow-lg shadow-white/10 group-hover:shadow-white/20 transition-all group-hover:scale-105">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-black" />
          </div>
          <div>
            <span className="text-[15px] font-black tracking-tight text-white uppercase block leading-none">Sentinel</span>
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.25em] leading-none">Security Platform</span>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto sidebar-scroll">
        <div className="px-3 mb-3">
          <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.3em]">Main Menu</span>
        </div>
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={onClose}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all group ${
                  isActive 
                    ? `${item.activeBg} text-white` 
                    : "text-slate-500 hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <motion.div 
                    layoutId="nav-indicator"
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-gradient-to-b ${item.accent}`}
                    transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                  />
                )}
                
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isActive 
                    ? `bg-gradient-to-br ${item.accent} shadow-lg` 
                    : "bg-white/[0.03] group-hover:bg-white/[0.06]"
                }`}>
                  <Icon size={15} className={isActive ? "text-white" : "text-slate-500 group-hover:text-white transition-colors"} />
                </div>
                <span className="font-bold">{item.name}</span>
                
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Separator */}
        <div className="mx-3 my-4 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* Back to Protocol */}
        <a
          href={FRONTEND_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-indigo-400/80 hover:text-indigo-300 hover:bg-indigo-500/5 transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/15 transition-colors">
            <ArrowLeftCircle size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span className="font-bold">Back to Protocol</span>
        </a>
      </nav>

      {/* System Status Card */}
      <div className="px-4 pb-3">
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.05] relative overflow-hidden group hover:border-white/[0.08] transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl border border-blue-500/20 p-0.5 bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/10">
               <div className="w-full h-full rounded-[10px] bg-black flex items-center justify-center text-[10px] font-black italic text-white">OP</div>
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-[13px] font-bold text-white truncate leading-tight">Operator</p>
               <div className="flex items-center gap-1.5 mt-0.5">
                 <span className="relative flex h-2 w-2">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                 </span>
                 <p className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em]">Active</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <div className="px-4 pb-5">
        <button 
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/15 transition-all text-[9px] font-black uppercase tracking-widest text-slate-600 group"
        >
           {isSigningOut ? (
             <span className="animate-pulse">Disconnecting...</span>
           ) : (
             <>
               <LogOut size={12} className="group-hover:rotate-12 transition-transform" />
               <span>Disconnect</span>
             </>
           )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-72 bg-black/90 backdrop-blur-2xl border-r border-white/[0.05] hidden lg:flex flex-col z-50">
        {/* Subtle ambient glow */}
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-blue-500/[0.02] to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-purple-500/[0.02] to-transparent pointer-events-none" />
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
              onClick={onClose} 
            />
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="absolute left-0 top-0 bottom-0 w-72 bg-black/95 backdrop-blur-2xl border-r border-white/[0.06] flex flex-col"
            >
              <SidebarContent />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
