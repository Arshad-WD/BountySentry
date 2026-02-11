import "dotenv/config";

export const ENV = {
  RPC_URL: process.env.SEPOLIA_RPC_URL!,
  PRIVATE_KEY: process.env.PRIVATE_KEY!,
  REGISTRY_ADDRESS: process.env.REGISTRY_ADDRESS!,
  VAULT_ADDRESS: process.env.VAULT_ADDRESS!,
};

if (!ENV.RPC_URL || !ENV.PRIVATE_KEY) {
  throw new Error("Missing environment variables");
}
