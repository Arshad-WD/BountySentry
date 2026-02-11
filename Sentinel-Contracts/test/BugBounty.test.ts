import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import {
    BountyVault,
    ReportRegistry,
    ValidatorReputation
} from "../typechain-types";

describe("BugBounty System", function () {
    let vault: BountyVault;
    let registry: ReportRegistry;
    let reputation: ValidatorReputation;
    let owner: SignerWithAddress;
    let treasury: SignerWithAddress;
    let reporter: SignerWithAddress;
    let v1: SignerWithAddress;
    let v2: SignerWithAddress;
    let v3: SignerWithAddress;

    const BOUNTY_AMOUNT = ethers.parseEther("1");
    const STAKE = ethers.parseEther("0.01");

    beforeEach(async function () {
        [owner, treasury, reporter, v1, v2, v3] = await ethers.getSigners();

        // Deploy Reputation
        const ReputationFactory = await ethers.getContractFactory("ValidatorReputation");
        reputation = await ReputationFactory.deploy();

        // Deploy Vault
        const VaultFactory = await ethers.getContractFactory("BountyVault");
        vault = await VaultFactory.deploy(treasury.address);

        // Deploy Registry
        const RegistryFactory = await ethers.getContractFactory("ReportRegistry");
        registry = await RegistryFactory.deploy(await vault.getAddress(), await reputation.getAddress());

        // Setup: set registry in reputation
        await reputation.setRegistry(await registry.getAddress());

        // Transfer ownership of vault to registry to allow releaseReward
        await vault.transferOwnership(await registry.getAddress());

        // Give some reputation to validators
        // Note: In reality, there would be a process for this
        await reputation.transferOwnership(owner.address); // owner already has it
        // Wait, reputation's `increase` is onlyRegistry. 
        // For testing, we need to bypass or use the owner (initial rep)
    });

    it("Should allow a company to lock a bounty", async function () {
        await vault.connect(owner).lockReward(1, { value: BOUNTY_AMOUNT });
        const reward = await vault.getReward(1);
        expect(reward).to.equal(BOUNTY_AMOUNT);
    });

    it("Should allow a researcher to submit a report", async function () {
        await vault.connect(owner).lockReward(1, { value: BOUNTY_AMOUNT });
        await registry.connect(reporter).submitReport(1, "ipfs://hash");
        const report = await registry.reports(0);
        expect(report.reporter).to.equal(reporter.address);
    });

    describe("Validation Flow", function () {
        beforeEach(async function () {
            await vault.connect(owner).lockReward(1, { value: BOUNTY_AMOUNT });
            await registry.connect(reporter).submitReport(1, "ipfs://hash");

            // Grant reputation to v1, v2, v3
            await reputation.grantReputation(v1.address);
            await reputation.grantReputation(v2.address);
            await reputation.grantReputation(v3.address);
        });

        it("Should handle successful validation (2/3 approvals) and payout", async function () {
            const gasComp = ethers.parseEther("0.05");

            // v1 approves
            await registry.connect(v1).validateReport(0, true, { value: STAKE });
            // v2 approves
            await registry.connect(v2).validateReport(0, true, { value: STAKE });

            // Check status
            let report = await registry.reports(0);
            expect(report.status).to.equal(1); // ACCEPTED

            // Finalize
            const initialReporterBalance = await ethers.provider.getBalance(reporter.address);
            const initialTreasuryBalance = await ethers.provider.getBalance(treasury.address);

            // Finalize by owner
            await registry.connect(owner).finalizeReport(0, gasComp);

            // Check payout
            // platformFee = 1 ETH * 5% = 0.05 ETH
            // gasComp = 0.05 ETH
            // Payout = 1 - 0.05 - 0.05 = 0.9 ETH

            const finalReporterBalance = await ethers.provider.getBalance(reporter.address);
            expect(finalReporterBalance - initialReporterBalance).to.equal(ethers.parseEther("0.9"));

            const finalTreasuryBalance = await ethers.provider.getBalance(treasury.address);
            expect(finalTreasuryBalance - initialTreasuryBalance).to.equal(ethers.parseEther("0.05"));

            // v1 staked correctly, should get reputation increase
            expect(await reputation.reputation(v1.address)).to.equal(2);
        });

        it("Should handle rejection (2/3 rejections) and slash stakes", async function () {
            // v1 rejects
            await registry.connect(v1).validateReport(0, false, { value: STAKE });
            // v2 rejects
            await registry.connect(v2).validateReport(0, false, { value: STAKE });

            let report = await registry.reports(0);
            expect(report.status).to.equal(2); // REJECTED

            await registry.connect(owner).finalizeReport(0, 0);

            // v1 voted correctly (REJECT when status is REJECTED)
            expect(await reputation.reputation(v1.address)).to.equal(2);
        });

        it("Should slash dissenters", async function () {
            // v1 approves
            await registry.connect(v1).validateReport(0, true, { value: STAKE });
            // v2 rejects
            await registry.connect(v2).validateReport(0, false, { value: STAKE });
            // v3 rejects
            await registry.connect(v3).validateReport(0, false, { value: STAKE });

            // Status should be REJECTED (2 rejections)
            let report = await registry.reports(0);
            expect(report.status).to.equal(2); // REJECTED

            await registry.connect(owner).finalizeReport(0, 0);

            // v1 dissented (voted approve but status is REJECTED)
            expect(await reputation.reputation(v1.address)).to.equal(0);
            // v2, v3 voted correctly
            expect(await reputation.reputation(v2.address)).to.equal(2);
            expect(await reputation.reputation(v3.address)).to.equal(2);
        });
    });
});
