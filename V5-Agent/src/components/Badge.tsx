"use client";

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'error';
}

const Badge: React.FC<BadgeProps> = ({ children, className = "", variant = 'default' }) => {
  const baseStyles = "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all";
  
  const variants = {
    default: "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white",
    outline: "bg-transparent border-white/20 text-white/60",
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-500",
    error: "bg-rose-500/10 border-rose-500/20 text-rose-500",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
