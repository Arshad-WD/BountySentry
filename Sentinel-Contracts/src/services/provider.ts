import { JsonRpcProvider, Wallet } from "ethers";
import { ENV } from "../config/env.js";

export const provider = new JsonRpcProvider(ENV.RPC_URL);

export const signer = new Wallet(
  ENV.PRIVATE_KEY,
  provider
);
