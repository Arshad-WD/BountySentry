import Link from "next/link";
import Card from "@/app/components/Card";
import Badge from "@/app/components/Badge";

interface BountyProps {
  id: string;
  projectName: string;
  rewardEth: string;
  status: "Open" | "Closed";
}

export default function BountyCard({ id, projectName, rewardEth, status }: BountyProps) {
  return (
    <Link href={`/bounties/${id}`} className="group block">
      <Card className="p-10 flex flex-col h-full group-hover:border-brand-text transition-standard">
        <div className="flex items-start justify-between mb-8">
          <Badge variant={status === "Open" ? "success" : "neutral"}>{status}</Badge>
          <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest">#{id}</span>
        </div>
        
        <h3 className="text-xl font-bold text-brand-text group-hover:underline underline-offset-8 mb-4">
          {projectName}
        </h3>
        
        <div className="mt-auto pt-8 border-t border-brand-border">
          <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-[0.2em] mb-1">Max Reward</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-black text-brand-text tracking-tighter">{rewardEth} ETH</p>
            <span className="text-xs font-bold text-brand-accent">View →</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
