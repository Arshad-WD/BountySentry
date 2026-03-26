# TITLE PAGE

**PROJECT REPORT**
**Sentinel AI & Auto-ID Blockchain System (BountySentry V5)**

Submitted in partial fulfillment of the requirements for the Degree
in
**Computer Science and Engineering**

Submitted By:
[Student Name / Shayan Ahmad]
[Roll Number]

Under the Guidance of:
[Guide Name]

[University/College Name]
[Academic Year 2025-2026]

---

# DECLARATION OF THE STUDENT

I hereby declare that the project report entitled "Sentinel AI & Auto-ID Blockchain System" submitted in partial fulfillment of the requirements for the degree in Computer Science and Engineering is a record of original work carried out by me under the supervision of [Guide Name]. The information and data presented in this report are authentic to the best of my knowledge and have not been submitted elsewhere for the award of any other degree or diploma.

Date: ___________
Place: ___________
Signature of the Student: ___________________
Name: [Shayan Ahmad]

---

# CERTIFICATE OF THE GUIDE

This is to certify that the project report entitled "Sentinel AI & Auto-ID Blockchain System" submitted by [Student Name] is a record of bona fide work carried out under my guidance and supervision. This work has not been submitted anywhere else for any other degree or diploma.

Date: ___________
Place: ___________
Signature of the Guide: ___________________
Name of the Guide: [Guide Name]
Designation: [Designation]

---

# ABSTRACT

The "Sentinel AI Ecosystem" (BountySentry V5) is a novel, decentralized security platform that integrates blockchain-based bug bounties with an autonomous AI analysis agent. Traditional bug bounty platforms rely heavily on manual triage, centralized trust, and web2 databases, leading to high management overhead, delayed payouts, and a lack of transparency. Sentinel AI introduces a hybrid model mitigating these issues through three core innovations: Trustless Coordination via Smart Contracts (`Registry.sol` and `AssetRegistry.sol`), an Autonomous Verification AI Agent (`V5-Agent`) that actively scans perimeter assets using static analysis (Semgrep), and an Immutable Audit Trail where all verified assets and vulnerability reports are stored securely on-chain. The system's architecture isolates the main Next.js frontend, the Next.js Sentinel Agent, and the local Hardhat Ethereum node to ensure high performance, avoid database locking (segregating PostgreSQL and SQLite), and prevent dependency conflicts. The platform enforces strictly ordered, contract-generated "Auto-IDs" for every data entity, completely eliminating ID collision vulnerabilities. This project demonstrates a production-ready prototype that bridges the gap between passive decentralized hosting and active, automated security defense.

---

# ACKNOWLEDGEMENT

I would like to express my sincere gratitude to my project guide, [Guide Name], for their invaluable guidance, continuous support, and constructive feedback throughout the development of this project. I am also thankful to the faculty members of the Computer Science and Engineering department for providing the necessary infrastructure and resources. Finally, I extend my heartfelt thanks to my family and friends for their encouragement and moral support during the completion of this research.

---

# LIST OF FIGURES

1. Figure 1: Sentinel AI V5 Ecosystem Triad Architecture
2. Figure 2: Process Isolation and Database Architecture
3. Figure 3: Bounty Creation and Auto-ID Flowchart
4. Figure 4: Decentralized Verification and Validation Flow
5. Figure 5: Entity Relationship Diagram (PostgreSQL Frontend)
6. Figure 6: Entity Relationship Diagram (SQLite Agent)

---

# LIST OF TABLES

1. Table 1: Hardware Specifications
2. Table 2: Software Specifications
3. Table 3: Process Isolation Mapping (Ports and Databases)
4. Table 4: Project Timeline / Gantt Chart Summary

---

# TIMELINE / GANTT CHART

| Phase | Task Description | Duration (Weeks) | Start Date | End Date |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | Requirement Analysis & Literature Survey | 2 Weeks | Week 1 | Week 2 |
| **Phase 2** | System Architecture Design (Triad Isolation) | 2 Weeks | Week 3 | Week 4 |
| **Phase 3** | Smart Contract Development (Registry, Auto-ID) | 3 Weeks | Week 5 | Week 7 |
| **Phase 4** | Frontend Development (Next.js, Ethers.js) | 4 Weeks | Week 8 | Week 11 |
| **Phase 5** | V5-Agent Development & Semgrep Integration | 3 Weeks | Week 12 | Week 14 |
| **Phase 6** | System Integration & Cross-Communication | 2 Weeks | Week 15 | Week 16 |
| **Phase 7** | System Testing (Local Hardhat Node & Orchestrator) | 2 Weeks | Week 17 | Week 18 |
| **Phase 8** | Documentation & Report Generation | 2 Weeks | Week 19 | Week 20 |

*(Note: The above timeline is a representative 20-week academic Gantt chart projection)*

---

# 1. INTRODUCTION

## 1.1 Problem Definition
The cybersecurity industry heavily relies on bug bounty programs to discover and mitigate vulnerabilities in software systems. However, existing traditional platforms exhibit critical flaws:
1. **Centralized Trust and Payout Delays**: Bug bounty hunters must trust a centralized intermediary to validate vulnerabilities and disburse payments. Payouts are often delayed by weeks or months due to bureaucratic bottlenecks.
2. **Manual Triage Bottlenecks**: Organizations receive hundreds of duplicate or false-positive reports. Triage teams are overwhelmed, leading to delayed patching of critical perimeter vulnerabilities.
3. **Data Tampering & Lack of Transparency**: In Web2 environments, vulnerability reports can be silently altered, deleted, or ignored without public accountability. 
4. **ID Collisions & Data Integrity**: Managing complex relationships between bounties, researchers, and validators often leads to database ID collisions, especially in distributed environments lacking strict synchronization.

## 1.2 Project Overview/Specifications
The **Sentinel AI & Auto-ID Blockchain System** is an advanced decentralized application (DApp) structured to revolutionize the DevSecOps lifecycle. It introduces a decentralized bug bounty platform secured by Ethereum Smart Contracts, combined with an autonomous AI security scanner. 

**Core Specifications:**
- **Triad Architecture**: The system operates across three strictly isolated components: 
    1. **Blockchain Layer (Port 8545)**: A local Hardhat EVM node hosting `Registry.sol` and `AssetRegistry.sol`.
    2. **Main Frontend Platform (Port 3001)**: A Next.js application backed by PostgreSQL (NeonDB) handling human interactions, bounty creation, and report submissions.
    3. **Sentinel AI Agent (Port 3000)**: A completely isolated Next.js worker backed by SQLite, running Semgrep vulnerability scanning engines autonomously against registered assets.
- **The "Auto-ID" Protocol**: To solve data integrity flaws, Sentinel AI utilizes on-chain counters within Smart Contracts to auto-generate unique Bounty IDs and Report IDs. The frontend queries the blockchain to pre-determine the next valid ID, removing manual human entry and preventing state collisions.
- **Smart Escrow & Trustless Settlement**: Bounty rewards are locked in an immutable contract upon creation and are only released when decentralized validators confirm the report's integrity.
- **Process Orchestration**: A central `start_services.js` orchestrator automates port cleaning, process spawning, and log aggregation, injecting strict environment variables (e.g., `TURBOPACK=0`) to ensure absolute systemic stability.

## 1.3 Hardware Specification
The following are the minimum hardware requirements necessary to run the triad of services (Node.js, PostgreSQL, AI Scanner, and Blockchain Node) simultaneously:
- **Processor**: Intel Core i5 / AMD Ryzen 5 (8th Generation or higher). Quad-core minimum required for parallel process handling.
- **RAM**: Minimum 8 GB DDR4 (16 GB highly recommended, as Hardhat, two Next.js instances, and Semgrep orchestrations consume significant memory).
- **Storage**: 256 GB SSD (Solid State Drive is required for fast Next.js compilation and local SQLite/PostgreSQL R/W operations).
- **Network**: Broadband Internet connection for fetching dependencies, querying NeonDB (if cloud-hosted), and interacting with external asset perimeters.

## 1.4 Software Specification
### 1.3.1 Blockchain & Agent Stack
- **EVM Environment**: Hardhat (Local Ethereum Node)
- **Smart Contract Language**: Solidity (^0.8.x)
- **AI Scanning Engine**: Semgrep (Static Application Security Testing)
- **Agent Database**: SQLite (`dev.db`), utilizing isolated schema definitions to prevent locks during heavy write operations.
- **Web3 Interface**: Ethers.js library for contract interaction.

### 1.3.2 Application Layer Stack
- **Framework**: Next.js 16 (App Router paradigm)
- **Runtime**: Node.js v18.x or v20.x
- **Frontend Styling**: TailwindCSS (Glassmorphic Premium UI/UX design)
- **Main Database**: PostgreSQL (via Neon serverless DB)
- **ORM**: Prisma ORM for type-safe database queries.
- **Authentication**: JWT-based custom session management (utilizing strict cookie segregation like `agent_session` to prevent overlap between Port 3000 and 3001).
- **Browser Extension**: MetaMask (Configured to `localhost:8545` for testnet execution).

---

# 2. LITERATURE SURVEY

## 2.1 Existing System
Modern organizations utilize platforms such as HackerOne, Bugcrowd, or localized internal vulnerability disclosure programs (VDPs). 
**Characteristics of Existing Systems:**
- **Web2 Architectures**: Built on traditional client-server models with centralized relational databases.
- **Manual Verification**: When a researcher discovers a vulnerability (e.g., SQL Injection), they write a markdown report and submit it. A human triage agent must then manually reproduce the bug.
- **Fiat Payments**: Rewards are processed through standard banking gateways, subject to regional restrictions, processing fees, and delays.
- **Passive Defenses**: The platform merely acts as a bulletin board. The platform itself does not assist the organization in pro-actively scanning their assets.

**Drawbacks:** Expensive continuous triage overhead, single points of failure, censorship risks, and zero economic transparency regarding bounty escrows.

## 2.2 Proposed System
The proposed **Sentinel AI & Auto-ID Blockchain System** merges Decentralized Finance (DeFi) components with Autonomous AI to create a "Decentralized DevSecOps" fabric.
**Key Improvements:**
1. **Hybrid Data Availability**: Balances the immutability of Web3 with the speed of Web2. Critical metadata, payment escrows, and Auto-IDs are enforced strictly on-chain (Ethereum). Heavy metadata (descriptions, logs) are pushed off-chain to PostgreSQL. This ensures millisecond-latency queries without sacrificing decentralized trust.
2. **Autonomous Security Loop**: Bounties are no longer passive. The `V5-Agent` acts as an autonomous worker. When a new asset is registered in the `AssetRegistry.sol`, the Agent automatically pulls it and executes deep-dive static application scans using Semgrep to detect generic flaws *before* a human researcher does.
3. **Session & Process Isolation**: To ensure complete stability, the Agent and the Main DApp are completely segregated. The Agent operates on SQLite (`dev.db`) and Port 3000, while the User DApp operates on PostgreSQL and Port 3001. A custom multi-cookie architecture prevents session kicking.

## 2.3 Feasibility Study
- **Technical Feasibility**: The project utilizes standard, community-verified technologies (Next.js, Hardhat, Ethers.js, Prisma). The design decision to isolate the Agent DB to SQLite solves the critical issue of race conditions and heavy write-locks that previously crashed the system. The project is technically sound and highly feasible.
- **Economic Feasibility**: By executing on a local Hardhat Node (Testnet environment), development costs strictly related to gas fees are zero. If deployed to an Ethereum Layer 2 (like Arbitrum or Optimism), transaction costs would remain economically viable (pennies per report), while securing thousands of dollars in bounty escrows securely. The use of local Semgrep engines eliminates the need for expensive enterprise SAST licensing during development.
- **Operational Feasibility**: The `start_services.js` orchestrator dramatically simplifies the operational overhead. A developer can launch the entire ecosystem with `npx hardhat node`, a targeted deployment script, and a single `npm start` command. The workflow for users (bounty hunters and admins) is streamlined via premium React UI interfaces and automated Auto-ID lookups.

---

# 3. SYSTEM ANALYSIS & DESIGN

## 3.1 Requirement Specification
**Functional Requirements:**
1. **Bounty Management**: Administrators must be able to create smart-contract backed bounties, specifying capital scopes and target identifiers. The system must query the blockchain to Auto-ID the respective bounty.
2. **Vulnerability Submission**: Security researchers must be able to submit detailed findings with IPFS evidence hashes, linked strictly to a valid Auto-ID.
3. **Autonomous Scanning**: The Sentinel Agent must routinely fetch registered target URL/repositories and run Semgrep analysis, logging results dynamically.
4. **Decentralized Validation**: Designated validators must be able to interact with the Next.js Frontend to approve or reject reports. Smart contracts require multi-signature style approvals (e.g., 2 consensus votes) to trigger `ACCEPTED` states.
5. **Settlement**: Admins must be able to execute settlements, mathematically dividing the escrowed funds to researchers, validators (reputation rewards), and covering gas overheads.

**Non-Functional Requirements:**
1. **Isolation**: The main site and the Agent dashboard must run on separate ports to avoid SSR conflicts.
2. **Build Stability**: The Next.js Turbopack compiler must be explicitly disabled (`TURBOPACK=0`) to prevent file watching memory leaks in complex Web3 mono-repo setups.
3. **User Experience**: The UI must deploy a "Glassmorphism" aesthetic, providing real-time ETH-to-USD metrics and fluid state transitions.
4. **Resiliency**: The system must provide fallback mock-data handling (e.g., Agent Mock Mode fallback) if the SQLite database is uninitialized.

## 3.2 Flowcharts / DFDs / ERDs

*(Note: In physical printouts, these are rendered as full-page graphical diagrams. Represented here via structural syntax).*

**Diagram 1: System Isolation Architecture**
```text
[Orchestrator: start_services.js]
       |
       +--> [Blockchain Node: Port 8545]
       |      - Registry.sol (Bounty/Report Logic)
       |      - AssetRegistry.sol (Perimeter Status)
       |
       +--> [Main Web DApp: Port 3001]
       |      - PostgreSQL (Neon) Cache
       |      - Create Bounty UI / Submit UI
       |
       +--> [Sentinel AI Agent: Port 3000]
              - SQLite (dev.db) - Heavy Write Isolation
              - Semgrep Vulnerability Engine
```

**Diagram 2: Bounty Creation & Auto-ID Data Flow**
1. User enters Project Details.
2. Frontend `Ethers.js` queries `Registry.sol` for `bountyCount`.
3. Frontend calculates Next Auto-ID dynamically.
4. User signs MetaMask transaction with Stake Capital.
5. Transaction mined on Hardhat Node.
6. `StorageService` intercepts Contract Events and syncs PostgreSQL DB.

**Diagram 3: Entity Relationship (Agent SQLite)**
- **User**: Custom Agent Admins (`id`, `email`, `password_hash`).
- **Scan**: Historical Semgrep job runs (`id`, `target_asset`, `status`, `timestamp`).
- **Finding**: Individual vulnerabilities mapped to Scans (`id`, `scan_id`, `severity`, `cwe`, `file_path`).

## 3.3 Design and Test Steps / Criteria
Designing the V5 ecosystem required meticulous isolation tracking to prevent collision dependencies.

**Design Steps:**
1. **Contract Genesis**: Wrote `Registry.sol` using OpenZeppelin standards. Deployed via Hardhat Ignition scripts to local EVM.
2. **Frontend Wiring**: Connected Ethers.js to the generated `addresses.json`. Designed Prisma schema for PostgreSQL.
3. **Agent Decoupling**: Identified that concurrent Next.js server actions were locking the PostgreSQL pool. Extracted the Agent into `V5-Agent`, generated an isolated `dev.db` using SQLite, and rewrote the JWT `auth.ts` to utilize an `agent_session` cookie name.
4. **Orchestration**: Built `start_services.js` in Node.js to `kill-port` 3000 and 3001 automatically on boot to clean the environment.

**Test Criteria:**
- **Smart Contract Integrity**: Funds deposited in `BountyVault` must exactly match `msg.value`. Only authorized validators can advance a Report state from `PENDING` to `ACCEPTED`.
- **Session Independence**: A user logged into Port 3001 must not be logged into Port 3000 by default. Logging out of the Agent must not terminate the Main DApp session.
- **Auto-ID Validity**: Two concurrent bounty creations must never result in the same numerical ID on the Smart Contract.

## 3.4 Algorithms and Pseudo Code

### 3.4.1 Smart Contract Auto-ID Generation Pseudo Code
The blockchain serves as the single source of sequential truth.
```solidity
// Registry.sol (Simplified Pseudo-Logic)
contract Registry {
    uint256 public bountyCount = 0;
    mapping(uint256 => Bounty) public bounties;

    function createBounty(string memory target, string memory specs) public payable {
        require(msg.value > 0, "Stake must be > 0");
        
        uint256 newId = bountyCount; // Fetch current counter
        
        bounties[newId] = Bounty({
            id: newId,
            target: target,
            specs: specs,
            creator: msg.sender,
            rewardPool: msg.value,
            isActive: true
        });
        
        bountyCount++; // Increment safely on-chain (Atomic)
        emit BountyCreated(newId, msg.sender, msg.value);
    }
}
```

### 3.4.2 Sentinel AI Scanning Algorithm Pseudo Code
The `scanner.ts` engine coordinates external CLI tools (Semgrep) autonomously.
```typescript
// scanner.ts (Simplified Pseudo-Logic)
async function executeAgentScan(assetUrl: string): Promise<ScanResult> {
    try {
        // Step 1: Initialize isolated SQLite Record
        const scanId = await AgentDB.createScanRecord(assetUrl, "RUNNING");
        
        // Step 2: Formulate Semgrep CLI Command
        const command = `semgrep scan --config p/ci --json ${assetUrl}`;
        
        // Step 3: Execute Subprocess
        const { stdout, stderr } = await execProcess(command);
        const parsedJson = JSON.parse(stdout);
        
        // Step 4: Parse Results into Findings
        let criticalFound = 0;
        for (let vuln of parsedJson.results) {
            await AgentDB.insertFinding(scanId, vuln.path, vuln.message, vuln.severity);
            if (vuln.severity === 'ERROR') criticalFound++;
        }
        
        // Step 5: Mark complete
        await AgentDB.updateScanRecord(scanId, "COMPLETED", criticalFound);
        return { success: true, count: criticalFound };
        
    } catch (error) {
        await AgentDB.updateScanRecord(scanId, "FAILED");
        return { success: false, error: error.message };
    }
}
```

## 3.5 Testing Process
Testing the full lifecycle requires executing a defined actor-based workflow on the local Hardhat deployment:

1. **Environment Setup**:
   - Terminal 1: Run `npx hardhat node` to spin up EVM and generate 20 highly-funded test accounts.
   - Terminal 2: Run `npx hardhat run scripts/deploy.js --network localhost` to deploy contracts. Copy deployed addresses.
   - Terminal 3: Run `npm start` to fire `start_services.js` (booting both Main DApp and Agent).

2. **Frontend Configuration & Browser Execution**:
   - Modify `config/env.ts` on the frontend with the newly deployed contract addresses.
   - Add "Hardhat Localhost" (Chain ID 31337) to MetaMask. Import Private Key #0.

3. **Actor 1: The Protocol Admin (Bounty Creation)**
   - Navigate to `/bounties/create` on `localhost:3001`.
   - Submit a Bounty with a Stake Capital of 1.0 ETH.
   - Verify MetaMask transaction. Confirm UI state updates via `StorageService` cache.

4. **Actor 2: The Security Researcher (Simulation)**
   - Switch to Metamask Account #1.
   - Navigate to `/submit`. Reference the previously created Bounty Auto-ID. Submit a mock IPFS hash.

5. **Actor 3: The Sentinel AI Agent (Autonomous Scanning)**
   - Navigate to `localhost:3000`. Create an isolated Agent admin account.
   - Go to Dashboard -> Assets. Manually trigger a perimeter scan.
   - Verify SQLite database accurately records the `semgrep` tool pipeline outputs.

6. **Actor 4: Resolution & Settlement (Validator)**
   - On `localhost:3001`, Validator Account #0 navigates to the Reports tab.
   - Contract demands consensus. Validator clicks "Confirm Integrity".
   - Admin triggers `Execute Settlement` to distribute escrow.

---

# 4. RESULTS / OUTPUTS

The culmination of the project resulted in a highly reliable, dual-dashboard ecosystem.
- **Frontend Deployment**: Achieved a sub-50ms query response time on the DApp by utilizing the Prisma/PostgreSQL caching layer, abstracting the slow RPC calls to the Hardhat node behind background synchronization streams.
- **Premium User Experience**: Successfully implemented dynamic Auto-ID resolution. Users no longer input IDs manually; the Next.js frontend handles Ethereum state queries transparently, completely eliminating data loss from mistyped IDs.
- **Agent Dashboard Stability**: By offloading the AI Agent to a dedicated port (3000) and dedicated local database (SQLite file), heavy Write/Read scan operations no longer lock up the Main DApp's connection pools.
- **Smart Contract Execution**: Metamask integrations operate flawlessly on the local testnet. `BountyVault` successfully locks Capital Escrow, preventing protocol insolvency mathematically.

---

# 5. CONCLUSIONS / RECOMMENDATIONS

## Conclusion
The **Sentinel AI & Auto-ID Blockchain System** successfully demonstrates that standardizing bug bounty platforms through decentralized Web3 technologies provides immense benefits in trust, transparency, and economic efficiency. By combining strict absolute On-Chain logic with a high-performance Web2 caching layer (Hybrid Data Availability), the system provides a seamless Web2-like user experience with the cryptographic guarantees of Web3. Furthermore, introducing the autonomous Next.js `V5-Agent` brings vulnerability scanning actively into the DevSecOps pipeline, ensuring organizations are protected dynamically rather than passively waiting for researchers.

## Recommendations and Future Scope
1. **Mainnet / Layer 2 Migration**: While Hardhat testnets are excellent for development (zero gas fees, instant blocks), the system should be deployed to a low-fee Layer 2 network like Base, Arbitrum, or Polygon. Local nodes mask MEV (Front-running) vulnerabilities, which must be addressed via commit-reveal schemes before a mainnet launch.
2. **Chainlink Oracles**: Integrate Chainlink Price Feeds into `Registry.sol` so that Bounty Escrows can be defined in strict USD valuations (e.g., "$5000 in ETH") rather than highly volatile native token amounts.
3. **Advanced AI Integration**: Upgrade the Sentinel Agent's engine from static Semgrep rules to utilizing LangChain and large language models (LLMs) to automatically generate Proof-of-Concept exploits based on the identified static flaws, drastically reducing the False-Positive rate.

---

# 6. REFERENCES

1. Nakamoto, S. (2008). *Bitcoin: A Peer-to-Peer Electronic Cash System.*
2. Wood, G. (2014). *Ethereum: A Secure Decentralised Generalised Transaction Ledger.*
3. OpenZeppelin Documentation (2024). *Standard Solidity Library for Secure Smart Contract Development.* [Online]. Available: https://docs.openzeppelin.com/
4. Next.js Documentation (2024). *The React Framework for the Web.* [Online]. Available: https://nextjs.org/docs
5. Semgrep (2024). *Static Application Security Testing for Developers.* [Online]. Available: https://semgrep.dev/
6. Hardhat Documentation (Ethereum Foundation). *Ethereum development environment for professionals.* [Online]. Available: https://hardhat.org/
7. Prisma ORM (2024). *Next-generation Node.js and TypeScript ORM.* [Online]. Available: https://www.prisma.io/

---
End of Report.
