"use client";

import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Shield, 
  AlertTriangle, 
  Globe, 
  Settings as SettingsIcon, 
  LogOut,
  ChevronRight,
  Menu,
  X,
  ArrowLeftCircle
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3001";

export default function Sidebar() {
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
    { name: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/dashboard" },
    { name: "Scans", icon: <Shield size={18} />, path: "/dashboard/scans" },
    { name: "Vulnerabilities", icon: <AlertTriangle size={18} />, path: "/dashboard/vulnerabilities" },
    { name: "Assets", icon: <Globe size={18} />, path: "/dashboard/assets" },
    { name: "Settings", icon: <SettingsIcon size={18} />, path: "/dashboard/settings" },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-72 bg-black border-r border-white/10 hidden lg:flex flex-col z-50">
      {/* Brand Section */}
      <div className="p-8 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center">
            <Shield className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white uppercase">Sentinel</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-white/10 text-white" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}

        {/* Back to Protocol DAO */}
        <div className="pt-4 mt-4 border-t border-white/5">
          <a
            href={FRONTEND_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium text-indigo-400 hover:text-white hover:bg-indigo-500/10 transition-colors group"
          >
            <ArrowLeftCircle size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Protocol
          </a>
        </div>
      </nav>

      {/* Footer Profile Section */}
      <div className="p-6 space-y-4">
        <div className="p-4 rounded-[1.5rem] bg-white/[0.03] border border-white/5 relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 h-10 rounded-full border border-blue-500/30 p-0.5 bg-gradient-to-tr from-blue-500 to-indigo-500">
               <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-black italic">OP</div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-tight">Operator-01</span>
              <span className="text-[10px] text-slate-500 font-bold">Level 4 Security</span>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="flex items-center justify-center gap-3 px-4 py-3 rounded-2xl text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all w-full border border-transparent hover:border-red-500/10 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut className={`w-4 h-4 group-hover:-translate-x-1 transition-transform ${isSigningOut ? 'animate-pulse' : ''}`} />
          <span className="font-bold text-xs uppercase tracking-widest leading-none">
            {isSigningOut ? "Terminating..." : "Terminate Session"}
          </span>
        </button>
      </div>
    </aside>
  );
}
