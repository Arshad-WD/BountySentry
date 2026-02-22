import { ethers, Signer } from "ethers";
import ReportRegistryAbi from "@/abis/ReportRegistry.json";
import { ENV } from "@/config/env";

export async function submitReport(signer: Signer, bountyId: number, ipfsHash: string) {
    const registry = new ethers.Contract(ENV.REGISTRY_ADDRESS, ReportRegistryAbi.abi, signer);
    return registry.submitReport(bountyId, ipfsHash);
}

export async function validateReport(signer: Signer, reportId: number, approve: boolean) {
    const registry = new ethers.Contract(ENV.REGISTRY_ADDRESS, ReportRegistryAbi.abi, signer);

    // Safety check: Verify contract exists
    const provider = signer.provider;
    if (!provider) {
        throw new Error("No provider available");
    }

    const code = await provider.getCode(ENV.REGISTRY_ADDRESS);
    if (!code || code === "0x") {
        throw new Error(`Contract not found at ${ENV.REGISTRY_ADDRESS}. Are you on the correct network?`);
    }

    const stake = await registry.VALIDATOR_STAKE();
    return registry.validateReport(reportId, approve, { value: stake });
}

export async function finalizeReport(signer: Signer, reportId: number, gasCompensation: string) {
    const registry = new ethers.Contract(ENV.REGISTRY_ADDRESS, ReportRegistryAbi.abi, signer);
    return registry.finalizeReport(reportId, ethers.parseEther(gasCompensation));
}

export async function getReports(provider: any) {
    const registry = new ethers.Contract(ENV.REGISTRY_ADDRESS, ReportRegistryAbi.abi, provider);

    // Safety check: Verify contract exists
    try {
        const code = await provider.getCode(ENV.REGISTRY_ADDRESS);
        if (!code || code === "0x") return [];
    } catch { return []; }

    const count = await registry.reportCount();
    const stakeRequired = await registry.VALIDATOR_STAKE();
    const reports = [];

    for (let i = 0; i < count; i++) {
        const r = await registry.reports(i);
        reports.push({
            id: i.toString(),
            bountyId: r[0],
            projectName: `Discovered Protocol #${r[0]}`,
            reporter: r[1],
            ipfsHash: r[2],
            status: r[3] === BigInt(0) ? "PENDING" : r[3] === BigInt(1) ? "ACCEPTED" : "REJECTED",
            approvals: Number(r[4]),
            rejections: Number(r[5]),
            stakeRequired: ethers.formatEther(stakeRequired),
            details: `Pending retrieval from IPFS: ${r[2]}`,
            summary: undefined
        });
    }

    return reports;
}

export async function getMyReports(provider: any, userAddress: string) {
    const allReports = await getReports(provider);
    // Filter to only reports submitted by this user
    return allReports.filter(report =>
        report.reporter.toLowerCase() === userAddress.toLowerCase()
    );
}

export async function getReport(provider: any, reportId: number) {
    const registry = new ethers.Contract(ENV.REGISTRY_ADDRESS, ReportRegistryAbi.abi, provider);
    const r = await registry.reports(reportId);
    const stake = await registry.VALIDATOR_STAKE();

    return {
        id: reportId.toString(),
        bountyId: r[0],
        projectName: `Discovered Protocol #${r[0]}`,
        reporter: r[1],
        ipfsHash: r[2],
        status: r[3] === BigInt(0) ? "PENDING" : r[3] === BigInt(1) ? "ACCEPTED" : "REJECTED",
        approvals: Number(r[4]),
        rejections: Number(r[5]),
        stakeRequired: ethers.formatEther(stake),
        details: `Full technical report is cryptographically stored on IPFS.\nHash: ${r[2]}`,
        summary: undefined // Will be populated from MockIPFS if available
    };
}
