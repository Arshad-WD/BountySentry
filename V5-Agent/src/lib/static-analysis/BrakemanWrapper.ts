/**
 * BrakemanWrapper - Ruby on Rails security scanner
 * Detects: SQL injection, XSS, command injection, mass assignment, CSRF issues in Rails apps
 * Requires: gem install brakeman
 * Language: Ruby (.rb, .erb)
 */

import { VulnerabilityReasoning } from "../agents/AgentSystem";
import { StaticAnalyzer, StaticAnalysisConfig } from "./StaticAnalyzer";
import { isToolAvailable, runTool } from "./ToolRunner";
import { hasFilesWithExtension } from "./GosecWrapper";

export class BrakemanWrapper implements StaticAnalyzer {
    name = "brakeman";

    async isAvailable(): Promise<boolean> {
        return isToolAvailable("brakeman");
    }

    async scan(config: StaticAnalysisConfig): Promise<VulnerabilityReasoning[]> {
        if (!hasFilesWithExtension(config.targetPath, [".rb", ".erb"])) {
            console.log("[brakeman] No .rb/.erb files found, skipping.");
            return [];
        }

        const result = await runTool(
            "brakeman",
            "brakeman",
            ["-p", config.targetPath, "-f", "json", "--no-pager", "-q", "--force"],
            config.targetPath,
            60000
        );

        if (!result.parsed) return [];

        const findings: VulnerabilityReasoning[] = [];
        const warnings = result.parsed.warnings || [];

        for (const [idx, warn] of warnings.slice(0, 20).entries()) {
            findings.push({
                id: `BRAKEMAN-${idx}`,
                category: mapBrakemanCategory(warn.warning_type),
                issue: `${warn.warning_type}: ${warn.message?.substring(0, 80) || "Rails security issue"}`,
                description: warn.message || "Security issue detected in Rails application.",
                severity: mapBrakemanSeverity(warn.confidence),
                evidence: `File: ${warn.file}:${warn.line || "?"}\nCode: ${warn.code || "N/A"}\nUser Input: ${warn.user_input || "N/A"}`,
                remediation: warn.link || "Follow Rails security best practices (guides.rubyonrails.org/security.html).",
            });
        }

        return findings;
    }
}

function mapBrakemanSeverity(confidence: string): "Low" | "Medium" | "High" | "Critical" {
    switch (confidence?.toLowerCase()) {
        case "high": return "Critical";
        case "medium": return "High";
        case "weak": return "Medium";
        default: return "Medium";
    }
}

function mapBrakemanCategory(warningType: string): string {
    const w = (warningType || "").toLowerCase();
    if (w.includes("sql") || w.includes("injection") || w.includes("command")) return "A03:2021-Injection";
    if (w.includes("xss") || w.includes("cross-site")) return "A03:2021-Injection";
    if (w.includes("mass assignment") || w.includes("attr")) return "A01:2021-Broken Access Control";
    if (w.includes("csrf") || w.includes("forgery")) return "A01:2021-Broken Access Control";
    if (w.includes("redirect") || w.includes("open")) return "A01:2021-Broken Access Control";
    if (w.includes("session") || w.includes("cookie")) return "A07:2021-Auth Failures";
    if (w.includes("file") || w.includes("path")) return "A01:2021-Broken Access Control";
    return "A05:2021-Security Misconfiguration";
}
