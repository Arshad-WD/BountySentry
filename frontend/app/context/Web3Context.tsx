"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ethers } from "ethers";
import { useToast } from "./ToastContext";

interface Web3ContextType {
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  address: string | null;
  network: string | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  loading: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  address: null,
  network: null,
  isConnected: false,
  isCorrectNetwork: false,
  loading: true,
  connect: async () => {},
  disconnect: () => {},
  switchNetwork: async () => {},
});

const SEPOLIA_CHAIN_ID = "0xaa36a7"; // Sepolia
const LOCALHOST_CHAIN_ID = "0x7a69";   // Hardhat Node (31337)

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToast } = useToast();
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [loading, setLoading] = useState(true);

  const initRef = useRef(false);

  // Define disconnect first
  const disconnect = useCallback(() => {
    setAddress(null);
    setSigner(null);
    setNetwork(null);
    setIsCorrectNetwork(false);
  }, []);

  const checkNetwork = useCallback(async (p: ethers.BrowserProvider) => {
    try {
        const net = await p.getNetwork();
        const chainIdHex = "0x" + net.chainId.toString(16);
        const isCorrect = chainIdHex === SEPOLIA_CHAIN_ID || chainIdHex === LOCALHOST_CHAIN_ID;
        setIsCorrectNetwork(isCorrect);
        console.log(`[Web3] Network: ${net.name} (${chainIdHex}), Correct: ${isCorrect}`);
        return isCorrect;
    } catch (e) {
        console.error("[Web3] Network check failed", e);
        return false;
    }
  }, []);

  const init = useCallback(async (p: ethers.BrowserProvider) => {
    try {
        const accounts = await p.send("eth_accounts", []);
        
        if (accounts.length > 0) {
            const s = await p.getSigner();
            const addr = await s.getAddress();
            const net = await p.getNetwork();
            await checkNetwork(p);
            
            setSigner(s);
            setAddress(addr);
            setNetwork(net.name === "unknown" ? `Chain ${net.chainId}` : net.name);
            console.log(`[Web3] Connected: ${addr}`);
        } else {
            disconnect();
        }
    } catch (err) {
        console.error("[Web3] Init error:", err);
    } finally {
        setLoading(false);
    }
  }, [checkNetwork, disconnect]);

  // Initial provider setup
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
        const p = new ethers.BrowserProvider((window as any).ethereum);
        setProvider(p);
        init(p);
    } else {
        setLoading(false);
    }
  }, [init]);

  // Event Listeners
  useEffect(() => {
    const ethereum = (window as any).ethereum;
    if (!ethereum || !provider) return;

    const handleAccountsChanged = (accounts: string[]) => {
        console.log("[Web3] Accounts changed", accounts);
        if (accounts.length === 0) {
            disconnect();
            addToast("Wallet disconnected", "warning");
        } else {
            init(provider);
            addToast("Account switched", "info");
        }
    };

    const handleChainChanged = () => {
        console.log("[Web3] Chain changed, reloading...");
        window.location.reload();
    };

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);

    return () => {
        if (ethereum.removeListener) {
            ethereum.removeListener("accountsChanged", handleAccountsChanged);
            ethereum.removeListener("chainChanged", handleChainChanged);
        }
    };
  }, [provider, init, disconnect, addToast]);

  const connect = useCallback(async () => {
    if (!provider) {
        addToast("MetaMask is not installed.", "warning");
        return;
    }

    setLoading(true);
    try {
      await provider.send("eth_requestAccounts", []);
      await init(provider);
      addToast("Wallet connected successfully", "success");
    } catch (err) {
      console.error("[Web3] Connect error:", err);
      addToast("Failed to connect wallet", "error");
    } finally {
      setLoading(false);
    }
  }, [provider, init, addToast]);

  const switchNetwork = useCallback(async () => {
    if (!(window as any).ethereum) return;
    
    try {
        await (window as any).ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: LOCALHOST_CHAIN_ID }],
        });
        addToast("Switched to Hardhat Local", "success");
    } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
            try {
                await (window as any).ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [
                        {
                            chainId: LOCALHOST_CHAIN_ID,
                            chainName: "Hardhat Localhost",
                            rpcUrls: ["http://127.0.0.1:8545"],
                            nativeCurrency: {
                                name: "Ethereum",
                                symbol: "ETH",
                                decimals: 18,
                            },
                        },
                    ],
                });
                addToast("Hardhat Local network added", "success");
            } catch (addError) {
                console.error("[Web3] Failed to add network", addError);
                addToast("Failed to add Hardhat network", "error");
            }
        } else {
            console.error("[Web3] Failed to switch network", switchError);
            addToast("Failed to switch network. Please switch manually in MetaMask.", "error");
        }
    }
  }, [addToast]);

  const contextValue = useMemo(() => ({
    provider,
    signer,
    address,
    network,
    isConnected: !!address,
    isCorrectNetwork,
    loading,
    connect,
    disconnect,
    switchNetwork,
  }), [provider, signer, address, network, isCorrectNetwork, loading, connect, disconnect, switchNetwork]);

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
