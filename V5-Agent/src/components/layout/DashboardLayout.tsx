"use client";

import Sidebar from "./Sidebar";
import { motion } from "framer-motion";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="lg:pl-72 min-h-screen relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-10 lg:px-10">
          {children}
        </div>
      </main>
    </div>
  );
}
