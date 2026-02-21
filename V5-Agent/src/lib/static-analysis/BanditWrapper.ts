/**
 * BanditWrapper - Python security linter integration
 * Detects: hardcoded passwords, SQL injection, shell injection, weak crypto
 * Requires: pip install bandit
 */

import { VulnerabilityReasoning } from "../agents/AgentSystem";
import { StaticAnalyzer, StaticAnalysisConfig } from "./StaticAnalyzer";
import { isToolAvailable, runTool } from "./ToolRunner";

export class BanditWrapper implements StaticAnalyzer {
    name = "Bandit";

    async isAvailable(): Promise<boolean> {
        return isToolAvailable("bandit");
    }

    async scan(config: StaticAnalysisConfig): Promise<VulnerabilityReasoning[]> {
        const result = await runTool(
            "Bandit",
            "bandit",
            ["-r", config.targetPath, "-f", "json", "-ll", "--quiet"],
            config.targetPath,
            60000
        );

        if (!result.success || !result.parsed) {
            return [];
        }

        const findings: VulnerabilityReasoning[] = [];
        const banditResults = result.parsed.results || [];

        for (const [idx, issue] of banditResults.entries()) {
            findings.push({
                id: `BANDIT-${idx}`,
                category: mapBanditCategory(issue.test_id),
                issue: issue.test_name || issue.issue_text,
                description: issue.issue_text || "Security issue detected by Bandit",
                severity: mapBanditSeverity(issue.issue_severity),
                evidence: `File: ${issue.filename}:${issue.line_number}\nCode: ${issue.code || "N/A"}`,
                remediation: issue.more_info || "Review and fix the identified security issue.",
            });
        }

        return findings;
    }
}

function mapBanditSeverity(severity: string): "Low" | "Medium" | "High" | "Critical" {
    switch (severity?.toUpperCase()) {
        case "HIGH": return "High";
        case "MEDIUM": return "Medium";
        case "LOW": return "Low";
        default: return "Medium";
    }
}

function mapBanditCategory(testId: string): string {
    if (!testId) return "A03:2021-Injection";
    if (testId.startsWith("B1")) return "A03:2021-Injection";
    if (testId.startsWith("B3")) return "A02:2021-Cryptographic Failures";
    if (testId.startsWith("B5")) return "A05:2021-Security Misconfiguration";
    if (testId.startsWith("B6")) return "A01:2021-Broken Access Control";
    return "A03:2021-Injection";
}
