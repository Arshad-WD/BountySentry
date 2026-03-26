import { ethers } from "ethers";
import { ENV } from "@/config/env";
import ValidatorReputationABI from "@/abis/ValidatorReputation.json";
import ReportRegistryABI from "@/abis/ReportRegistry.json";

export async function getValidatorReputation(address: string, provider: ethers.Provider) {
    try {
        const contract = new ethers.Contract(ENV.REPUTATION_ADDRESS, ValidatorReputationABI.abi, provider);
        const score = await contract.reputation(address);
        return Number(score);
    } catch (err) {
        console.error("Failed to fetch validator reputation:", err);
        return 0;
    }
}

export async function getAllValidators(provider: ethers.Provider) {
    try {
        const reputationContract = new ethers.Contract(ENV.REPUTATION_ADDRESS, ValidatorReputationABI.abi, provider);
        const registryContract = new ethers.Contract(ENV.REGISTRY_ADDRESS, ReportRegistryABI.abi, provider);

        // Discover validator addresses from ReportValidated events
        // and ReputationUpdated events
        const currentBlock = await provider.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 10000);

        const [validatedLogs, reputationLogs] = await Promise.all([
            registryContract.queryFilter(registryContract.filters.ReportValidated(), fromBlock),
            reputationContract.queryFilter(reputationContract.filters.ReputationUpdated(), fromBlock)
        ]);

        const validatorAddresses = new Set<string>();

        // Add deployer/owner (often initial validator)
        const owner = await reputationContract.owner();
        validatorAddresses.add(owner);

        validatedLogs.forEach(log => {
            const event = log as ethers.EventLog;
            validatorAddresses.add(event.args.validator);
        });

        reputationLogs.forEach(log => {
            const event = log as ethers.EventLog;
            validatorAddresses.add(event.args.validator);
        });

        // Fetch reputation and validation stats for each discovered validator
        const validators = await Promise.all(
            Array.from(validatorAddresses).map(async (address) => {
                const [score, stats] = await Promise.all([
                    reputationContract.reputation(address),
                    // In a real app we'd fetch actual vote counts from our own subgraph or indexer
                    // For now we count them from the events we fetched
                    Promise.resolve(validatedLogs.filter(l => (l as ethers.EventLog).args.validator === address).length)
                ]);

                return {
                    address,
                    reputation: Number(score),
                    validations: stats,
                    // Mock some earnings based on validations
                    earnings: (stats * 0.05).toFixed(2)
                };
            })
        );

        return validators.sort((a, b) => b.reputation - a.reputation);
    } catch (err) {
        console.error("Failed to fetch all validators:", err);
        return [];
    }
}

export async function grantReputation(signer: ethers.Signer, validatorAddress: string) {
    const contract = new ethers.Contract(ENV.REPUTATION_ADDRESS, ValidatorReputationABI.abi, signer);
    return await contract.grantReputation(validatorAddress);
}
