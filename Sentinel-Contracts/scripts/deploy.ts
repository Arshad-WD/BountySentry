import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy ValidatorReputation
  const Reputation = await ethers.getContractFactory("ValidatorReputation");
  const reputation = await Reputation.deploy();
  await reputation.waitForDeployment();
  const reputationAddress = await (reputation as any).getAddress();
  console.log("ValidatorReputation deployed to:", reputationAddress);

  // 2. Deploy BountyVault (using deployer as treasury for now)
  const Vault = await ethers.getContractFactory("BountyVault");
  const vault = await Vault.deploy(deployer.address);
  await vault.waitForDeployment();
  const vaultAddress = await (vault as any).getAddress();
  console.log("BountyVault deployed to:", vaultAddress);

  // 3. Deploy BountyRegistry
  const BountyRegistryFactory = await ethers.getContractFactory("BountyRegistry");
  const bountyRegistry = await BountyRegistryFactory.deploy();
  await bountyRegistry.waitForDeployment();
  const bountyRegistryAddress = await (bountyRegistry as any).getAddress();
  console.log("BountyRegistry deployed to:", bountyRegistryAddress);

  // 4. Deploy ReportRegistry
  const Registry = await ethers.getContractFactory("ReportRegistry");
  const registry = await Registry.deploy(vaultAddress, reputationAddress);
  await registry.waitForDeployment();
  const registryAddress = await (registry as any).getAddress();
  console.log("ReportRegistry deployed to:", registryAddress);

  // 5. Setup Wiring
  console.log("Wiring contracts...");

  // Set registry in reputation
  await (await (reputation as any).setRegistry(registryAddress)).wait();
  console.log("Registry set in Reputation contract.");

  // Transfer ownership of Vault to Registry (so registry can release rewards)
  await (await (vault as any).transferOwnership(registryAddress)).wait();
  console.log("BountyVault ownership transferred to ReportRegistry.");

  console.log("Deployment complete!");

  console.log("Registry:", registryAddress);

  // Save to JSON for frontend sync
  const fs = require("fs");
  const path = require("path");
  const addresses = {
    REPUTATION: reputationAddress,
    VAULT: vaultAddress,
    BOUNTY_REGISTRY: bountyRegistryAddress,
    REGISTRY: registryAddress,
  };
  const outputPath = path.join(__dirname, "../../frontend/config/deployed-addresses.json");
  fs.writeFileSync(outputPath, JSON.stringify(addresses, null, 2));
  console.log("\nAddresses saved to:", outputPath);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
