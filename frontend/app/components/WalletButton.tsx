"use client";

import { useWeb3 } from "@/app/context/Web3Context";
import Button from "./Button";

export default function WalletButton() {
  const { address, connect, loading, isConnected, isCorrectNetwork, switchNetwork } = useWeb3();

  if (isConnected && address) {
    if (!isCorrectNetwork) {
        return (
            <Button 
                onClick={switchNetwork} 
                variant="danger" 
                className="px-6 py-2 h-9 text-[10px] flex items-center gap-2"
            >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                Switch to Local
            </Button>
        );
    }

    return (
      <div className="flex items-center gap-3 bg-white/5 pl-4 pr-1 py-1 rounded-full border border-white/5 backdrop-blur-sm">
        <div className="text-right hidden sm:block">
          <p className="text-[10px] font-bold text-brand-text/50 uppercase tracking-widest leading-none mb-1">Authenticated</p>
          <p className="text-[10px] text-brand-text font-mono leading-none">
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        </div>
        <div className="h-8 w-8 rounded-full bg-brand-accent flex items-center justify-center text-brand-bg font-black text-[10px] ring-2 ring-brand-bg shadow-lg shadow-brand-accent/20">
          {address.slice(2, 4).toUpperCase()}
        </div>
      </div>
    );
  }

  return (
    <Button onClick={connect} loading={loading} variant="primary" className="px-6 py-2 h-9 text-[10px]">
      Connect Access
    </Button>
  );
}
