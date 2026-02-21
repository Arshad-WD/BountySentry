import {
    validateTarget,
    performRecon,
    reasonVulnerabilities,
    generateSecurityReport,
    performRepoRecon,
    reasonRepoVulnerabilities,
    VulnerabilityReasoning
} from "./agents/AgentSystem";
import { prisma } from "./db";
import { SemgrepWrapper } from "./static-analysis/SemgrepWrapper";
import { PatternScanner } from "./static-analysis/PatternScanner";
import { BanditWrapper } from "./static-analysis/BanditWrapper";
import { NpmAuditWrapper } from "./static-analysis/NpmAuditWrapper";
import { RetireJsWrapper } from "./static-analysis/RetireJsWrapper";
import { NjsscanWrapper } from "./static-analysis/NjsscanWrapper";
import { GosecWrapper } from "./static-analysis/GosecWrapper";
import { SpotBugsWrapper } from "./static-analysis/SpotBugsWrapper";
import { PHPStanWrapper } from "./static-analysis/PHPStanWrapper";
import { BrakemanWrapper } from "./static-analysis/BrakemanWrapper";
import { PipAuditWrapper } from "./static-analysis/PipAuditWrapper";
import { StaticAnalyzer } from "./static-analysis/StaticAnalyzer";
import { cloneRepository, cleanupRepository } from "./git-utils";

export type ScanMode = "static" | "dynamic" | "full";
export type ScanEngine = "codeql" | "sentinelx";

interface ScanConfig {
    scanId: string;
    llmConfig?: { provider: string; key: string; allKeys?: Record<string, string> };
    useStaticAnalysis?: boolean;
    scanMode?: ScanMode;
    scanEngine?: ScanEngine;
}

/**
 * Run all available static analysis tools in parallel with 60s timeouts.
 * Each tool that fails or isn't installed is silently skipped.
 * Supports: Python, JavaScript/TypeScript, Go, Java/Kotlin, PHP, Ruby/Rails
 */
async function runStaticToolsParallel(repoPath: string, scanId: string): Promise<VulnerabilityReasoning[]> {
    const allTools: StaticAnalyzer[] = [
        // Universal (multi-language)
        new SemgrepWrapper(),
        new PatternScanner(),
        // JavaScript / TypeScript
        new NpmAuditWrapper(),
        new RetireJsWrapper(),
        new NjsscanWrapper(),
        // Python
        new BanditWrapper(),
        new PipAuditWrapper(),
        // Go
        new GosecWrapper(),
        // Java / Kotlin
        new SpotBugsWrapper(),
        // PHP
        new PHPStanWrapper(),
        // Ruby / Rails
        new BrakemanWrapper(),
    ];

    // Check availability of all tools in parallel
    const availabilityChecks = await Promise.allSettled(
        allTools.map(async (tool) => ({
            tool,
            available: await tool.isAvailable(),
        }))
    );

    const availableTools = availabilityChecks
        .filter((r): r is PromiseFulfilledResult<{ tool: StaticAnalyzer; available: boolean }> =>
            r.status === "fulfilled" && r.value.available
        )
        .map((r) => r.value.tool);

    const toolNames = availableTools.map((t) => t.name).join(", ");
    await prisma.scan.update({
        where: { id: scanId },
        data: { logs: [`[PARALLEL] Launching ${availableTools.length} static analyzers: ${toolNames}`] },
    });

    // Run all available tools in parallel
    const scanPromises = availableTools.map(async (tool) => {
        try {
            console.log(`[STATIC:${tool.name}] Starting scan...`);
            const startTime = Date.now();
            const findings = await tool.scan({ targetPath: repoPath });
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`[STATIC:${tool.name}] Completed in ${elapsed}s — found ${findings.length} issues`);
            return { toolName: tool.name, findings, elapsed };
        } catch (error: any) {
            console.error(`[STATIC:${tool.name}] Failed:`, error.message);
            return { toolName: tool.name, findings: [] as VulnerabilityReasoning[], elapsed: "0" };
        }
    });

    const results = await Promise.allSettled(scanPromises);
    const allFindings: VulnerabilityReasoning[] = [];
    const toolLogs: string[] = [];

    for (const result of results) {
        if (result.status === "fulfilled") {
            const { toolName, findings, elapsed } = result.value;
            allFindings.push(...findings);
            toolLogs.push(`[${toolName}] ${findings.length} findings in ${elapsed}s`);
        }
    }

    await prisma.scan.update({
        where: { id: scanId },
        data: { logs: toolLogs },
    });

    // Deduplicate findings by issue title
    const seen = new Set<string>();
    const deduplicated = allFindings.filter((f) => {
        const key = `${f.issue}::${f.category}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    console.log(`[STATIC] Total: ${allFindings.length} findings, ${deduplicated.length} after dedup`);
    return deduplicated;
}

export async function runFullSecurityScan(
    scanId: string,
    llmConfig?: { provider: string; key: string; allKeys?: Record<string, string> },
    useStaticAnalysis: boolean = true,
    scanMode: ScanMode = "full",
    scanEngine: ScanEngine = "codeql"
) {
    try {
        // 1. Fetch scan target
        const scan = await prisma.scan.findUnique({
            where: { id: scanId },
        });

        if (!scan) throw new Error("Scan mission not found in database.");

        // 2. Pre-Scan Validation
        const validation = await validateTarget(scan.url, scan.consent);
        if (!validation.isValid) {
            await prisma.scan.update({
                where: { id: scanId },
                data: { status: "FAILED", updatedAt: new Date() },
            });
            throw new Error(validation.reason);
        }

        // Update status and initial log
        const engineLabel = scanEngine === "sentinelx" ? "SentinelX Engine" : "CodeQL Engine";
        const modeLabel = scanMode.charAt(0).toUpperCase() + scanMode.slice(1);
        await prisma.scan.update({
            where: { id: scanId },
            data: {
                status: "RUNNING",
                logs: [
                    `Target validated. Engine: ${engineLabel} | Mode: ${modeLabel}`,
                    "Initiating analysis pipeline...",
                ],
                updatedAt: new Date(),
            },
        });

        // Detect Target Type (URL vs GitHub)
        const isGithub = scan.url.includes("github.com");
        let issues: VulnerabilityReasoning[] = [];

        if (isGithub) {
            await prisma.scan.update({
                where: { id: scanId },
                data: {
                    logs: [
                        "Detected GitHub Repository. Launching Source Audit pipeline...",
                        "Mapping repository structure via raw content edge...",
                    ],
                },
            });

            // ===== DYNAMIC ANALYSIS (Recon + LLM Reasoning) =====
            let dynamicPromise: Promise<VulnerabilityReasoning[]> = Promise.resolve([]);
            if (scanMode === "dynamic" || scanMode === "full") {
                dynamicPromise = (async () => {
                    const recon = await performRepoRecon(scan.url);
                    await prisma.scan.update({
                        where: { id: scanId },
                        data: {
                            logs: [
                                `Recon complete: Found ${recon.foundFiles.length} key configuration files.`,
                                "Launching heuristic analysis...",
                            ],
                        },
                    });

                    if (llmConfig?.key) {
                        await prisma.scan.update({
                            where: { id: scanId },
                            data: {
                                logs: [`Engaging ${llmConfig.provider} Intelligence for context-aware source audit...`],
                            },
                        });
                    }

                    return reasonRepoVulnerabilities(recon, llmConfig);
                })();
            }

            // ===== STATIC ANALYSIS (All tools in parallel) =====
            let staticPromise: Promise<VulnerabilityReasoning[]> = Promise.resolve([]);
            if ((scanMode === "static" || scanMode === "full") && useStaticAnalysis) {
                staticPromise = (async () => {
                    let repoPath: string | null = null;
                    try {
                        await prisma.scan.update({
                            where: { id: scanId },
                            data: {
                                logs: [
                                    "Initiating Deep Static Analysis...",
                                    "Cloning repository for secure environment scan...",
                                ],
                            },
                        });

                        repoPath = await cloneRepository(scan.url);
                        const staticFindings = await runStaticToolsParallel(repoPath, scanId);

                        await prisma.scan.update({
                            where: { id: scanId },
                            data: {
                                logs: [
                                    `Static Analysis complete. ${staticFindings.length} security issues identified.`,
                                ],
                            },
                        });

                        return staticFindings;
                    } catch (error: any) {
                        console.error("Static Analysis Failed:", error);
                        await prisma.scan.update({
                            where: { id: scanId },
                            data: {
                                logs: [
                                    `Static Analysis Warning: ${error.message}. Continuing with other results.`,
                                ],
                            },
                        });
                        return [];
                    } finally {
                        if (repoPath) await cleanupRepository(repoPath);
                    }
                })();
            } else if (scanMode === "dynamic") {
                await prisma.scan.update({
                    where: { id: scanId },
                    data: { logs: ["Static Analysis skipped (Dynamic-only mode)."] },
                });
            }

            // Wait for both static and dynamic to complete in parallel
            const [dynamicIssues, staticIssues] = await Promise.all([dynamicPromise, staticPromise]);
            issues = [...dynamicIssues, ...staticIssues];

            // Store findings
            const recon = await performRepoRecon(scan.url);
            const findingPromises = issues.map(async (issue) => {
                const report = await generateSecurityReport(recon, issue);
                await prisma.finding.create({
                    data: {
                        scanId: scanId,
                        type: report.title,
                        severity: report.severity,
                        description: report.description,
                        evidence: report.evidence,
                        location: report.category,
                    },
                });
                return `[Finding] Identified ${report.title} (${report.severity}) in mission parameters.`;
            });

            const findingLogs = await Promise.all(findingPromises);
            await prisma.scan.update({
                where: { id: scanId },
                data: { logs: findingLogs },
            });
        } else {
            // ===== WEB URL PIPELINE =====
            await prisma.scan.update({
                where: { id: scanId },
                data: {
                    logs: [
                        "Probing Web Infrastructure headers and services...",
                        `Executing HEAD request to ${scan.url}`,
                    ],
                },
            });

            const recon = await performRecon(scan.url);
            await prisma.scan.update({
                where: { id: scanId },
                data: {
                    logs: [
                        `Infrastructure mapping complete. Analyzed ${Object.keys(recon.serverHeaders).length} headers.`,
                        "Scanned HTML surface for leaked secrets.",
                    ],
                },
            });

            if (llmConfig?.key) {
                await prisma.scan.update({
                    where: { id: scanId },
                    data: {
                        logs: [`Engaging ${llmConfig.provider} Intelligence for deep reasoning mission...`],
                    },
                });
            }

            issues = await reasonVulnerabilities(recon, llmConfig);

            // Store findings
            const findingPromises = issues.map(async (issue) => {
                const report = await generateSecurityReport(recon, issue);
                await prisma.finding.create({
                    data: {
                        scanId: scanId,
                        type: report.title,
                        severity: report.severity,
                        description: report.description,
                        evidence: report.evidence,
                        location: report.category,
                    },
                });
                return `[Finding] Identified ${report.title} (${report.severity}) via ${issue.id.startsWith("LLM") ? "Intelligence" : "Heuristics"}.`;
            });

            const findingLogs = await Promise.all(findingPromises);
            await prisma.scan.update({
                where: { id: scanId },
                data: { logs: findingLogs },
            });
        }

        // 4. Complete Scan Mission
        await prisma.scan.update({
            where: { id: scanId },
            data: {
                status: "COMPLETED",
                logs: [
                    `Analysis complete. ${issues.length} findings across ${scanMode} analysis.`,
                    "Persistence synchronized. Mission Success.",
                ],
                updatedAt: new Date(),
            },
        });

        return { success: true, count: issues.length };
    } catch (error: any) {
        console.error("Critical Scanner Failure:", error);
        await prisma.scan.update({
            where: { id: scanId },
            data: {
                status: "FAILED",
                logs: [`Critical Error: ${error.message || "Unknown Failure"}`],
                updatedAt: new Date(),
            },
        });
        throw error;
    }
}
