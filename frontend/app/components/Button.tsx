"use client";

import { cn } from "@/lib/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "neutral";
  loading?: boolean;
}

export default function Button({
  children,
  className,
  variant = "primary",
  loading,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-brand-accent text-brand-bg hover:shadow-lg hover:shadow-brand-accent/20 active:scale-[0.98]",
    secondary: "bg-white/5 backdrop-blur-md text-brand-text border border-white/10 hover:bg-white/10 active:scale-[0.98]",
    danger: "bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600/20 active:scale-[0.98]",
    neutral: "bg-brand-hover text-brand-secondary hover:text-brand-text active:scale-[0.98]",
  };

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-8 py-3 text-xs font-bold tracking-widest uppercase transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform",
        variants[variant],
        "pill-shadow border-t border-white/10", // Artificial glassy highlight
        className
      )}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="animate-pulse">Authorizing...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}
