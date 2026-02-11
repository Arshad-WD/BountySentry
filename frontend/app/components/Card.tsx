"use client";

import { cn } from "@/lib/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className, ...props }: CardProps) {
  return (
    <section
      className={cn(
        "glass-card p-0 overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}
