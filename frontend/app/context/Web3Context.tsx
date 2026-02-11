"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { ethers } from "ethers";

interface Web3ContextType {
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  address: string | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  loading: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  address: null,
  isConnected: false,
  isCorrectNetwork: false,
  loading: true,
  connect: async () => {},
  disconnect: () => {},
});

const SEPOLIA_CHAIN_ID = "0xaa36a7"; // Sepolia
const LOCALHOST_CHAIN_ID = "0x7a69";   // Hardhat Node (31337)

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Initialize Provider ONCE on mount
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
        const p = new ethers.BrowserProvider((window as any).ethereum);
        setProvider(p);
    } else {
        setLoading(false);
    }
  }, []);

  // Memoize checkNetwork
  const checkNetwork = useCallback(async (p: ethers.BrowserProvider) => {
    try {
        const network = await p.getNetwork();
        const chainIdHex = "0x" + network.chainId.toString(16);
        const isCorrect = chainIdHex === SEPOLIA_CHAIN_ID || chainIdHex === LOCALHOST_CHAIN_ID;
        setIsCorrectNetwork(isCorrect);
        return isCorrect;
    } catch (e) {
        console.error("Network check failed", e);
        return false;
    }
  }, []);

  const isInitializing = React.useRef(false);

  // 2. Init Logic - depends on stable provider
  const init = useCallback(async () => {
    if (!provider || isInitializing.current) return;
    isInitializing.current = true;
    
    try {
        const accounts = await provider.send("eth_accounts", []);
        
        if (accounts.length > 0) {
            const s = await provider.getSigner();
            const addr = await s.getAddress();
            await checkNetwork(provider);
            
            setSigner(s);
            setAddress(addr);
        } else {
            setAddress(null);
            setSigner(null);
        }
    } catch (err) {
        console.error("Web3 init error:", err);
    } finally {
        isInitializing.current = false;
        setLoading(false);
    }
  }, [provider, checkNetwork]);

  // 3. NO LISTENERS (Manual Mode)
  // We intentionally do NOT listen to 'accountsChanged' or 'chainChanged' 
  // to prevent Turbopack/HMR infinite loops.
  // User must refresh page to detect account changes.
  useEffect(() => {
    if (provider && (window as any).ethereum) {
        init();
        // Listeners removed for stability
    }
  }, [provider, init]);

  const connect = useCallback(async () => {
    if (provider) {
      setLoading(true);
      try {
        await provider.send("eth_requestAccounts", []);
        await init();
      } catch (err) {
        console.error("Connect error:", err);
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please install MetaMask!");
    }
  }, [provider, init]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setSigner(null);
    setIsCorrectNetwork(false);
  }, []);

  const contextValue = useMemo(() => ({
    provider,
    signer,
    address,
    isConnected: !!address,
    isCorrectNetwork,
    loading,
    connect,
    disconnect,
  }), [provider, signer, address, isCorrectNetwork, loading, connect, disconnect]);

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
