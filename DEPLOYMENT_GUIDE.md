# Deployment Guide: Sentinel Evolution V5

Your project is ready for professional deployment. Here is how to move from localhost to the real world.

## 1. Smart Contract Deployment (Sepolia Testnet)

To deploy your treasury and governance contracts to a public testnet:

1.  **Get a Private Key**: Export your private key from MetaMask (use a fresh dev account, never your main funds).
2.  **Get Sepolia ETH**: Use a faucet (e.g., Google Cloud Faucet, Alchemy Faucet).
3.  **Configure `.env`**: In `Sentinel-Contracts`, create a `.env` file:
    ```bash
    SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY"
    PRIVATE_KEY="YOUR_METAMASK_PRIVATE_KEY"
    ```
4.  **Deploy**:
    ```bash
    npx hardhat run scripts/deploy.ts --network sepolia
    ```
5.  **Copy Addresses**: Once deployed, update `frontend/config/env.ts` with the new Sepolia addresses.

## 2. Frontend Deployment (Vercel)

Vercel is the best choice for the Next.js frontend.

1.  **Push to GitHub**: (Already Done! Your latest code is in the repo).
2.  **Connect to Vercel**: 
    - Go to [vercel.com](https://vercel.com).
    - Import your `BountySentry` repository.
3.  **Environment Variables**: In Vercel Project Settings, add any vars from your `.env` if you have them.
4.  **Deploy**: Vercel will automatically detect Next.js and build it.

> [!IMPORTANT]
> **Storage Note**: The shared metadata API I built stores files in the `/data` folder. On Vercel, this folder is cleared every time you redeploy. 
> 
> **For a permanent production setup**, you should replace the file-saving logic in `app/api/ipfs/route.ts` with a database (like MongoDB Atlas or Supabase) which are both free and easy to integrate.

## 3. Distributed Verification
Once deployed:
- Anyone with the Vercel link can connect their MetaMask.
- The **Shared API** will ensure they see all technical summaries and evidence.
- The **Blockchain** will handle all real-time reward distributions.
