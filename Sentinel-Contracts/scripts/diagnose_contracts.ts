import { ethers } from "hardhat";

async function main() {
    const provider = ethers.provider;
    const network = await provider.getNetwork();
    console.log("Connected to Network:", network.name, "with ChainId:", network.chainId);

    const addresses = {
        REPUTATION: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        VAULT: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
        BOUNTY_REGISTRY: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
        REGISTRY: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    };

    for (const [name, addr] of Object.entries(addresses)) {
        const code = await provider.getCode(addr);
        console.log(`${name} at ${addr}: ${code === "0x" ? "❌ EMPTY" : "✅ CONTRACT"}`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
