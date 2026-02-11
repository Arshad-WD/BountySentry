# Testing and Running Guide for V5 Vulnerability Discovery Platform

This guide explains how to set up the local blockchain environment, deploy the smart contracts, and run the frontend application to test the full "Vulnerability Discovery" workflow.

## Prequisites

- **Node.js** (v18+)
- **Git**
- **Metamask** browser extension installed.

---

## 🚀 Step 1: Start Local Blockchain

We use Hardhat to run a local Ethereum node (`localhost:8545`).

1. Open a new terminal.
2. Navigate to the DAO directory:
   ```bash
   cd "d:\MAJOR PROJECT\V5\V5-Frontend_Backend\DAO"
   ```
3. Start the node:
   ```bash
   npx hardhat node
   ```
   *Keep this terminal running. It will display a list of 20 accounts with 10000 ETH each. Copy the Private Key of Account #0 and Account #1 for later use.*

---

## 📜 Step 2: Deploy Smart Contracts

In a **new** terminal:

1. Navigate to the DAO directory:
   ```bash
   cd "d:\MAJOR PROJECT\V5\V5-Frontend_Backend\DAO"
   ```
2. Deploy the contracts to the local node:
   ```bash
   npx hardhat ignition deploy ignition/modules/Deploy.ts --network localhost
   ```
3. **Important**: The output will show the deployed addresses for `ValidatorReputation`, `BountyVault`, and `ReportRegistry`.
   
   Example Output:
   ```
   Deployed Addresses:
   ValidatorReputation: 0x5FbDB2315678afecb367f032d93F642f64180aa3
   BountyVault: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
   ReportRegistry: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
   ```

---

## ⚙️ Step 3: Configure Frontend

1. Navigate to the Frontend directory:
   ```bash
   cd "d:\MAJOR PROJECT\V5\V5-Frontend_Backend\frontend"
   ```
2. Open `config/env.ts` and verify the addresses match the deployment output from Step 2.
   - If they are different, update `env.ts` with the new addresses.
   - *Note: On Hardhat Localhost, addresses are usually deterministic and shouldn't change unless you change the contracts.*

---

## 💻 Step 4: Run the Application

1. In the frontend directory, install dependencies (if not already done):
   ```bash
   npm install
   ```
   *(Note: Using `npm install --legacy-peer-deps` or `-f` might be needed if there are conflicts).*

2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` (or the port shown) in your browser.

---

## 🦊 Step 5: Configure Metamask

1. Click the Metamask icon in your browser.
2. **Add Network**:
   - Network Name: `Hardhat Localhost`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`
3. **Import Account**:
   - Click "Import Account" (or "Add Account" -> "Import Account").
   - Paste the **Private Key** of Account #0 (from the `npx hardhat node` terminal).
   - You should see ~10000 ETH.

---

## 🕵️ How to Test the Workflow

Since the application is now fully decentralized and uses real blockchain interactions, you start with a blank state. You must create data to see it.

### 1. Create a Bounty (As Protocol Admin)
1. Navigate to **Post a Bounty** (`/bounties/create`).
2. Fill in the details:
   - **Project Identifier**: e.g., "Uniswap V4 Core"
   - **Audit Specifications**: e.g., "Check for reentrancy in pool manager."
   - **Stake Capital**: e.g., `1.0` (This will be deducted from your Metamask account).
3. Click **Execute & Lock Final**.
4. Confirm the transaction in Metamask.
5. Once confirmed, you will be redirected to the **Active Catalog** where you can see your new bounty. Note the **Bounty ID** (likely `1` or a timestamp-based ID).

### 2. Submit a Vulnerability Report (As Researcher)
1. Go to **Submit Report** (`/submit`).
2. Enter the **Bounty Identifier** of the bounty you just created.
3. Enter an **IPFS Evidence Hash** (e.g., `QmTestHash123...`).
4. Click **Execute Submission**.
5. Confirm the transaction.

### 3. Review & Validate (As Validator/DAO)
1. Go to **Security Research** (`/reports`).
2. You should see your new report with status `PENDING`.
3. Click **Review Findings** to see the details.
4. **Validation**:
   - As the deployer (Account #0), you have the required reputation.
   - Click **Confirm Integrity** (Approve) or **Reject Claim**.
   - Confirm the transaction.
   - Note: The contract requires **2 approvals** to reach `ACCEPTED` status. You may need to validate again from a different account (after granting it reputation via console) OR you can modify `ReportRegistry.sol` to lower the threshold to 1 for easier testing.

### 4. Finalize & Pay (As Admin)
1. Once a report is `ACCEPTED` (2 approvals), go to **Admin Panel** (`/admin`).
2. You will see "Resolved Reports" count increase.
3. Enter the **Resolution ID** (the Report ID, e.g., `0`) and **Gas Compensation**.
4. Click **Execute Settlement**.
   - This releases the reward to the researcher.
   - This refunds the validators' stakes + reputation reward.

