import { ethers, Signer, Provider } from "ethers";
import BountyVaultAbi from "@/abis/BountyVault.json";
import BountyRegistryAbi from "@/abis/BountyRegistry.json";
import { ENV } from "@/config/env";
import { MockIPFS } from "@/lib/storage";

export async function createBounty(
    signer: Signer,
    rewardEth: string,
    projectName: string,
    description: string
) {
    const vault = new ethers.Contract(ENV.VAULT_ADDRESS, BountyVaultAbi.abi, signer);

    // Get the current bounty count to use as the new bounty ID
    const bountyCountVal = await vault.bountyCount();
    console.log("Current Bounty Count (Next ID):", bountyCountVal.toString());

    const valueWei = ethers.parseEther(rewardEth);
    console.log("Locking Reward:", rewardEth, "ETH", "(", valueWei.toString(), "Wei )");

    // Create bounty with the bounty ID and ETH value
    // Explicitly adding gasLimit to avoid estimation errors on local nodes
    const tx = await vault.lockReward(bountyCountVal, {
        value: valueWei,
        gasLimit: 500000
    });

    console.log("Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt.hash);

    // Store metadata in MockIPFS (in production, use real IPFS)
    await MockIPFS.save(`bounty-${bountyCountVal}`, JSON.stringify({ projectName, description }));

    return { tx, receipt, bountyId: Number(bountyCountVal) };
}

export async function getBountyReward(provider: Provider, bountyId: number) {
    const vault = new ethers.Contract(ENV.VAULT_ADDRESS, BountyVaultAbi.abi, provider);
    const reward = await vault.getReward(bountyId);
    return ethers.formatEther(reward);
}

export async function getBounties(provider: any) {
    const vault = new ethers.Contract(ENV.VAULT_ADDRESS, BountyVaultAbi.abi, provider);

    // Safety check
    try {
        const code = await provider.getCode(ENV.VAULT_ADDRESS);
        if (!code || code === "0x") {
            console.warn("Vault contract not found at", ENV.VAULT_ADDRESS);
            return [];
        }
    } catch (err) {
        console.error("Error checking vault contract:", err);
        return [];
    }

    try {
        const count = await vault.bountyCount();
        console.log("Bounty count from blockchain:", count.toString());
        const bounties = [];

        for (let i = 0; i < count; i++) {
            const b = await vault.bounties(i);
            // b: [creator, reward, isOpen]

            // Try to fetch metadata from MockIPFS
            let projectName = `Protocol #${i}`;
            let description = "";

            try {
                const metadata = await MockIPFS.get(`bounty-${i}`);
                if (metadata) {
                    const parsed = JSON.parse(metadata);
                    projectName = parsed.projectName || projectName;
                    description = parsed.description || "";
                }
            } catch {
                // Use default if metadata not found
            }

            bounties.push({
                id: i.toString(),
                projectName,
                description,
                rewardEth: ethers.formatEther(b[1]),
                status: b[2] ? "Open" : "Closed",
                creator: b[0]
            });
        }

        return bounties;
    } catch (err) {
        console.error("Error fetching bounties:", err);
        return [];
    }
}

export async function getBounty(provider: any, bountyId: number) {
    const vault = new ethers.Contract(ENV.VAULT_ADDRESS, BountyVaultAbi.abi, provider);
    const b = await vault.bounties(bountyId);

    // Try to fetch metadata from MockIPFS
    let projectName = `Protocol #${bountyId}`;
    let description = "This authorized security challenge is governed by the V5 Decentralized DAO.";

    try {
        const metadata = await MockIPFS.get(`bounty-${bountyId}`);
        if (metadata) {
            const parsed = JSON.parse(metadata);
            projectName = parsed.projectName || projectName;
            description = parsed.description || description;
        }
    } catch {
        // Use defaults
    }

    return {
        id: bountyId.toString(),
        projectName,
        description,
        scope: `Target Contract: ${ENV.VAULT_ADDRESS}\\nNetwork: Localhost/Sepolia`,
        rewardEth: ethers.formatEther(b[1]),
        status: b[2] ? "Open" : "Closed",
        posted: "Verified On-Chain",
        creator: b[0],
        rules: [
            "Critical vulnerabilities only.",
            "PoC required for validation.",
            "One reward per finding.",
            "DAO decision is final."
        ]
    };
}
