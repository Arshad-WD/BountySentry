import {
    validateTarget,
    performRecon,
    reasonVulnerabilities,
    generateSecurityReport,
    performRepoRecon,
    reasonRepoVulnerabilities
} from "./agents/AgentSystem";
import { prisma } from "./db";
import { SemgrepWrapper } from "./static-analysis/SemgrepWrapper";
import { PatternScanner } from "./static-analysis/PatternScanner";
import { cloneRepository, cleanupRepository } from "./git-utils";

export async function runFullSecurityScan(scanId: string, llmConfig?: { provider: string, key: string, allKeys?: Record<string, string> }, useStaticAnalysis: boolean = true) {
    try {
        // 1. Fetch scan target
        const scan = await prisma.scan.findUnique({
            where: { id: scanId }
        });

        if (!scan) throw new Error("Scan mission not found in database.");

        // 2. Pre-Scan Validation
        const validation = await validateTarget(scan.url, scan.consent);
        if (!validation.isValid) {
            await prisma.scan.update({
                where: { id: scanId },
                data: { status: "FAILED", updatedAt: new Date() }
            });
            throw new Error(validation.reason);
        }

        // Update status and initial log
        await prisma.scan.update({
            where: { id: scanId },
            data: {
                status: "RUNNING",
                logs: ["Target validated. Initiating heuristics engine..."],
                updatedAt: new Date()
            }
        });

        // Detect Target Type (URL vs GitHub)
        const isGithub = scan.url.includes("github.com");
        let issues: any[] = [];

        if (isGithub) {
            await prisma.scan.update({
                where: { id: scanId },
                data: { logs: ["Detected GitHub Repository. Launching Source Audit pipeline...", "Mapping repository structure via raw content edge..."] }
            });

            // 1. GitHub Repo API Pipeline (Fast Recon)
            const recon = await performRepoRecon(scan.url);
            await prisma.scan.update({
                where: { id: scanId },
                data: { logs: [`Recon complete: Found ${recon.foundFiles.length} key configuration files.`, "Launching heuristic secret scanner..."] }
            });

            if (llmConfig?.key) {
                await prisma.scan.update({
                    where: { id: scanId },
                    data: { logs: [`Engaging ${llmConfig.provider} Intelligence for context-aware source audit...`] }
                });
            }

            issues = await reasonRepoVulnerabilities(recon, llmConfig);

            // 2. Deep Static Analysis (Semgrep / Pattern Fallback)
            if (useStaticAnalysis) {
                let repoPath: string | null = null;
                try {
                    await prisma.scan.update({
                        where: { id: scanId },
                        data: { logs: ["Initiating Deep Static Analysis...", "Cloning repository for secure environment scan..."] }
                    });

                    repoPath = await cloneRepository(scan.url);

                    // Initialize Scanners
                    const semgrep = new SemgrepWrapper();
                    const patternScanner = new PatternScanner();
                    let staticFindings: any[] = [];

                    if (await semgrep.isAvailable()) {
                        await prisma.scan.update({
                            where: { id: scanId },
                            data: { logs: ["Semgrep Engine detected. Running advanced rule-based analysis..."] }
                        });
                        staticFindings = await semgrep.scan({ targetPath: repoPath });
                    } else {
                        await prisma.scan.update({
                            where: { id: scanId },
                            data: { logs: ["Semgrep not available (Serverless Environment). engaging Deep Pattern Scanner fallback..."] }
                        });
                        staticFindings = await patternScanner.scan({ targetPath: repoPath });
                    }

                    // Dedup and merge findings
                    issues = [...issues, ...staticFindings];

                    await prisma.scan.update({
                        where: { id: scanId },
                        data: { logs: [`Static Analysis complete. Identified ${staticFindings.length} additional security issues.`] }
                    });

                } catch (error: any) {
                    console.error("Static Analysis Failed:", error);
                    await prisma.scan.update({
                        where: { id: scanId },
                        data: { logs: [`Static Analysis Warning: ${error.message}. Continuing with API-based results.`] }
                    });
                } finally {
                    if (repoPath) await cleanupRepository(repoPath);
                }
            } else {
                await prisma.scan.update({
                    where: { id: scanId },
                    data: { logs: ["Skipping Deep Static Analysis (User Disabled)."] }
                });
            }

            // Parallel Finding Generation
            const findingPromises = issues.map(async (issue) => {
                const report = await generateSecurityReport(recon, issue);
                await prisma.finding.create({
                    data: {
                        scanId: scanId,
                        type: report.title,
                        severity: report.severity,
                        description: report.description,
                        evidence: report.evidence,
                        location: report.category
                    }
                });
                return `[Finding] Identified ${report.title} (${report.severity}) in mission parameters.`;
            });

            const findingLogs = await Promise.all(findingPromises);
            await prisma.scan.update({
                where: { id: scanId },
                data: { logs: findingLogs }
            });
        } else {
            await prisma.scan.update({
                where: { id: scanId },
                data: { logs: ["Probing Web Infrastructure headers and services...", `Executing HEAD request to ${scan.url}`] }
            });

            // Web URL Pipeline
            const recon = await performRecon(scan.url);
            await prisma.scan.update({
                where: { id: scanId },
                data: { logs: [`Infrastructure mapping complete. Analyzed ${Object.keys(recon.serverHeaders).length} headers.`, "Scanned HTML surface for leaked secrets."] }
            });

            if (llmConfig?.key) {
                await prisma.scan.update({
                    where: { id: scanId },
                    data: { logs: [`Engaging ${llmConfig.provider} Intelligence for deep reasoning mission...`] }
                });
            }

            issues = await reasonVulnerabilities(recon, llmConfig);

            // Parallel Finding Generation
            const findingPromises = issues.map(async (issue) => {
                const report = await generateSecurityReport(recon, issue);
                await prisma.finding.create({
                    data: {
                        scanId: scanId,
                        type: report.title,
                        severity: report.severity,
                        description: report.description,
                        evidence: report.evidence,
                        location: report.category
                    }
                });
                return `[Finding] Identified ${report.title} (${report.severity}) via ${issue.id.startsWith('LLM') ? 'Intelligence' : 'Heuristics'}.`;
            });

            const findingLogs = await Promise.all(findingPromises);
            await prisma.scan.update({
                where: { id: scanId },
                data: { logs: findingLogs }
            });
        }

        // 4. Complete Scan Mission
        await prisma.scan.update({
            where: { id: scanId },
            data: {
                status: "COMPLETED",
                logs: ["Analysis engine finalized mission telemetry.", "Persistence synchronized. Mission Success."],
                updatedAt: new Date()
            }
        });

        return { success: true, count: issues.length };
    } catch (error: any) {
        console.error("Critical Scanner Failure:", error);
        await prisma.scan.update({
            where: { id: scanId },
            data: {
                status: "FAILED",
                logs: [`Critical Error: ${error.message || "Unknown Failure"}`],
                updatedAt: new Date()
            }
        });
        throw error;
    }
}
