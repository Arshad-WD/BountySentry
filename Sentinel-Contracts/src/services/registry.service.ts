import { Contract } from "ethers";
import { signer } from "./provider.js";
import { calculateGasCost } from "./gas.service.js";
import { ENV } from "../config/env.js";

import ReportRegistryAbi from "../../abis/ReportRegistry.json";

export const registry = new Contract(
  ENV.REGISTRY_ADDRESS,
  ReportRegistryAbi,
  signer
);

export async function finalizeReport(reportId: number) {
  // resolve voting
  const resolveTx = await registry.resolveReport(reportId);
  await resolveTx.wait();

  // finalize once with gas measurement
  const finalizeTx = await registry.finalizeReport(reportId, 0);
  const receipt = await finalizeTx.wait();

  if (!receipt) {
    throw new Error("Finalize failed");
  }

  const gasCost = calculateGasCost(receipt, finalizeTx);

  // final payout with real gas cost
  const payoutTx =
    await registry.finalizeReport(reportId, gasCost);

  await payoutTx.wait();
}
