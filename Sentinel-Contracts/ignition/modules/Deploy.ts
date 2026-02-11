import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DeployModule = buildModule("DeployModule", (m) => {
    // 1. Deploy Reputation
    const reputation = m.contract("ValidatorReputation");

    // 2. Deploy Vault (Treasury = deployer for now)
    // We use the first account as the treasury
    const treasury = m.getAccount(0);
    const vault = m.contract("BountyVault", [treasury]);

    // 3. Deploy Registry
    const registry = m.contract("ReportRegistry", [vault, reputation]);

    // 4. Set Registry address in Reputation contract (so it can call increase/decrease)
    m.call(reputation, "setRegistry", [registry]);

    // 5. Grant initial reputation to deployer so they can validate reports immediately
    m.call(reputation, "grantReputation", [treasury]);

    return { reputation, vault, registry };
});

export default DeployModule;
