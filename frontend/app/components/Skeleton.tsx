"use client";

import { cn } from "@/lib/cn";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-brand-hover/50", className)}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-[2rem] border border-brand-border bg-brand-bg/50 p-8 space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-20 w-full" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
}

export function StatSkeleton() {
    return (
        <div className="rounded-[1.5rem] border border-brand-border bg-brand-bg/50 p-6 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-16" />
        </div>
    );
}
