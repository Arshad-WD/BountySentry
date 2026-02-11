import hre from "hardhat";
import { ENV } from "../src/config/env.js";

const { ethers } = hre;

async function main() {
  const registry = await ethers.getContractAt(
    "ReportRegistry",
    ENV.REGISTRY_ADDRESS
  );

  // resolve voting
  const resolveTx = await registry.resolveReport(1);
  await resolveTx.wait();

  // finalize once to measure gas
  const finalizeTx = await registry.finalizeReport(1, 0);
  const receipt = await finalizeTx.wait();

  if (!finalizeTx.gasPrice) {
    throw new Error("gasPrice missing");
  }

  const gasCost = receipt.gasUsed * finalizeTx.gasPrice;

  // final payout
  const payoutTx = await registry.finalizeReport(1, gasCost);
  await payoutTx.wait();

  console.log("✅ Gas-aware payout completed");
}

await main();
