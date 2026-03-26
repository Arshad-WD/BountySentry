import { ethers } from "ethers";
import { ENV } from "@/config/env";
import ReportRegistryABI from "@/abis/ReportRegistry.json";
import BountyVaultABI from "@/abis/BountyVault.json";

export async function getGovernanceStats(provider: ethers.BrowserProvider) {
    try {
        const vault = new ethers.Contract(ENV.VAULT_ADDRESS, BountyVaultABI.abi, provider);
        const registry = new ethers.Contract(ENV.REGISTRY_ADDRESS, ReportRegistryABI.abi, provider);

        const [treasury, platformFeeBps, reportCount, bountyCount, balance] = await Promise.all([
            vault.treasury(),
            vault.platformFeeBps(),
            registry.reportCount(),
            vault.bountyCount(),
            provider.getBalance(ENV.VAULT_ADDRESS)
        ]);

        return {
            treasury,
            platformFeeBps: Number(platformFeeBps),
            platformFeePercent: (Number(platformFeeBps) / 100).toFixed(1),
            reportCount: Number(reportCount),
            bountyCount: Number(bountyCount),
            vaultBalance: ethers.formatEther(balance),
            validatorStake: ethers.formatEther(await registry.VALIDATOR_STAKE())
        };
    } catch (err) {
        console.error("Failed to fetch governance stats:", err);
        return null;
    }
}

export async function getRecentDAOEvents(provider: ethers.BrowserProvider) {
    try {
        const registry = new ethers.Contract(ENV.REGISTRY_ADDRESS, ReportRegistryABI.abi, provider);
        const vault = new ethers.Contract(ENV.VAULT_ADDRESS, BountyVaultABI.abi, provider);

        // Fetch last 100 blocks of events
        const currentBlock = await provider.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 5000); // Look back ~5000 blocks

        const [resolvedEvents, submittedEvents, lockedEvents] = await Promise.all([
            registry.queryFilter(registry.filters.ReportResolved(), fromBlock),
            registry.queryFilter(registry.filters.ReportSubmitted(), fromBlock),
            vault.queryFilter(vault.filters.RewardLocked(), fromBlock)
        ]);

        const events = [
            ...resolvedEvents.map(e => ({ type: 'RESOLVED', id: e.transactionHash, block: e.blockNumber, data: (e as ethers.EventLog).args })),
            ...submittedEvents.map(e => ({ type: 'SUBMITTED', id: e.transactionHash, block: e.blockNumber, data: (e as ethers.EventLog).args })),
            ...lockedEvents.map(e => ({ type: 'LOCKED', id: e.transactionHash, block: e.blockNumber, data: (e as ethers.EventLog).args }))
        ].sort((a, b) => b.block - a.block).slice(0, 10);

        return events;
    } catch (err) {
        console.error("Failed to fetch DAO events:", err);
        return [];
    }
}
