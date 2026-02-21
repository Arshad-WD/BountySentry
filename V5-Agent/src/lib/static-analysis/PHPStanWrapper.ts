/**
 * PHPStanWrapper - PHP static analysis integration
 * Detects: SQL injection, XSS, type errors, security misconfigurations in PHP
 * Requires: composer global require phpstan/phpstan OR npx phpstan
 * Language: PHP (.php)
 */

import { VulnerabilityReasoning } from "../agents/AgentSystem";
import { StaticAnalyzer, StaticAnalysisConfig } from "./StaticAnalyzer";
import { isToolAvailable, runTool } from "./ToolRunner";
import { hasFilesWithExtension } from "./GosecWrapper";

export class PHPStanWrapper implements StaticAnalyzer {
    name = "phpstan";

    async isAvailable(): Promise<boolean> {
        return isToolAvailable("phpstan");
    }

    async scan(config: StaticAnalysisConfig): Promise<VulnerabilityReasoning[]> {
        if (!hasFilesWithExtension(config.targetPath, [".php"])) {
            console.log("[phpstan] No .php files found, skipping.");
            return [];
        }

        const result = await runTool(
            "phpstan",
            "phpstan",
            ["analyse", config.targetPath, "--error-format=json", "--no-progress", "--level=5"],
            config.targetPath,
            60000
        );

        if (!result.parsed) return [];

        const findings: VulnerabilityReasoning[] = [];
        const files = result.parsed.files || {};
        let idx = 0;

        for (const [filePath, fileData] of Object.entries<any>(files)) {
            for (const message of (fileData.messages || [])) {
                if (idx >= 20) break;

                // Filter for security-relevant findings
                const msg = (message.message || "").toLowerCase();
                const isSecurityRelevant =
                    msg.includes("sql") || msg.includes("inject") || msg.includes("xss") ||
                    msg.includes("exec") || msg.includes("eval") || msg.includes("shell") ||
                    msg.includes("password") || msg.includes("unescaped") || msg.includes("unsafe") ||
                    msg.includes("deprecated") || msg.includes("vulnerability") ||
                    msg.includes("file_get_contents") || msg.includes("include") || msg.includes("require");

                findings.push({
                    id: `PHP-${idx}`,
                    category: isSecurityRelevant ? mapPHPCategory(message.message) : "A05:2021-Security Misconfiguration",
                    issue: `PHP Issue: ${message.message?.substring(0, 100) || "Unknown"}`,
                    description: message.message || "Static analysis issue in PHP code.",
                    severity: isSecurityRelevant ? "High" : "Medium",
                    evidence: `File: ${filePath}:${message.line || "?"}\nTip: ${message.tip || "N/A"}`,
                    remediation: message.tip || "Review PHP code for security best practices.",
                });
                idx++;
            }
        }

        return findings;
    }
}

function mapPHPCategory(message: string): string {
    const m = (message || "").toLowerCase();
    if (m.includes("sql") || m.includes("inject") || m.includes("exec") || m.includes("eval")) return "A03:2021-Injection";
    if (m.includes("xss") || m.includes("unescaped") || m.includes("echo")) return "A03:2021-Injection";
    if (m.includes("password") || m.includes("auth")) return "A07:2021-Auth Failures";
    if (m.includes("file") || m.includes("include") || m.includes("path")) return "A01:2021-Broken Access Control";
    return "A05:2021-Security Misconfiguration";
}
