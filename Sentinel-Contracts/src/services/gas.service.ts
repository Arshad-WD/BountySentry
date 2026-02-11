import { TransactionReceipt, TransactionResponse } from "ethers";

export function calculateGasCost(
  receipt: TransactionReceipt,
  tx: TransactionResponse
): bigint {
  if (tx.gasPrice == null) {
    throw new Error("gasPrice missing on transaction");
  }

  return receipt.gasUsed * tx.gasPrice;
}
