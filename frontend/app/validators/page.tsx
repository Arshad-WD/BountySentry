"use client";

import Card from "@/app/components/Card";
import Badge from "@/app/components/Badge";
import { MOCK_VALIDATORS, VALIDATOR_STATS } from "./mockData";

export default function ValidatorsList() {
  return (
    <div className="space-y-12">
      <div className="max-w-2xl px-1">
        <h2 className="text-3xl font-extra-bold text-brand-text uppercase tracking-tight mb-4">
          Validator Network
        </h2>
        <p className="text-brand-secondary">
          The BugBounty DAO is powered by professional security researchers. Reputation score is earned through accurate vulnerability validation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {VALIDATOR_STATS.map((stat, idx) => (
          <Card key={idx} className={`p-8 text-center border-brand-border ${stat.hl ? "bg-brand-hover/50" : ""}`}>
            <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-[0.2em] mb-2">{stat.label}</p>
            <p className="text-3xl font-black text-brand-text">{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden border-brand-border">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-hover border-b border-brand-border">
              <th className="px-8 py-5 text-[10px] font-bold text-brand-secondary uppercase tracking-[0.25em]">Entity</th>
              <th className="px-8 py-5 text-[10px] font-bold text-brand-secondary uppercase tracking-[0.25em]">Reputation Score</th>
              <th className="px-8 py-5 text-[10px] font-bold text-brand-secondary uppercase tracking-[0.25em]">Validation Count</th>
              <th className="px-8 py-5 text-[10px] font-bold text-brand-secondary uppercase tracking-[0.25em]">Protocol Rank</th>
              <th className="px-8 py-5 text-right text-[10px] font-bold text-brand-secondary uppercase tracking-[0.25em]">Total Earnings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {MOCK_VALIDATORS.map((v) => (
              <tr key={v.address} className="hover:bg-brand-hover/40 transition-standard">
                <td className="px-8 py-6">
                  <span className="text-sm font-mono font-bold text-brand-text">{v.address}</span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-brand-text">{v.reputation}</span>
                    <div className="flex-1 min-w-[60px] h-1 bg-brand-border rounded-full overflow-hidden">
                        <div className="h-full bg-brand-accent" style={{ width: `${v.reputation}%` }} />
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-sm text-brand-secondary">{v.votes} Votes</td>
                <td className="px-8 py-6 text-sm">
                  <Badge variant={v.status === "Elite" ? "success" : v.status === "Active" ? "neutral" : "warning"}>
                    {v.status}
                  </Badge>
                </td>
                <td className="px-8 py-6 text-right font-mono text-sm font-bold text-brand-text">
                  {v.earnings} ETH
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
