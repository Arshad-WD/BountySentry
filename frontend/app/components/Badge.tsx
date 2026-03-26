"use client";

import { cn } from "@/lib/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "danger" | "warning" | "neutral";
  className?: string;
}

export default function Badge({ children, variant = "neutral", className }: BadgeProps) {
  const variants = {
    success: "bg-green-500/10 text-green-600 border-green-500/20",
    danger: "bg-red-500/10 text-red-600 border-red-500/20",
    warning: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    neutral: "bg-brand-hover text-brand-secondary border-brand-border",
  };

  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider", 
      variants[variant]
    )}>
      {children}
    </span>
  );
}
