/**
 * GosecWrapper - Go security linter integration 
 * Detects: SQL injection, command injection, weak crypto, hardcoded creds in Go code
 * Requires: go install github.com/securego/gosec/v2/cmd/gosec@latest
 * Language: Go (.go files)
 */

import { VulnerabilityReasoning } from "../agents/AgentSystem";
import { StaticAnalyzer, StaticAnalysisConfig } from "./StaticAnalyzer";
import { isToolAvailable, runTool } from "./ToolRunner";
import * as fs from "fs";
import * as path from "path";

export class GosecWrapper implements StaticAnalyzer {
    name = "gosec";

    async isAvailable(): Promise<boolean> {
        return isToolAvailable("gosec");
    }

    async scan(config: StaticAnalysisConfig): Promise<VulnerabilityReasoning[]> {
        // Only run if Go files exist
        if (!hasFilesWithExtension(config.targetPath, [".go"])) {
            console.log("[gosec] No .go files found, skipping.");
            return [];
        }

        const result = await runTool(
            "gosec",
            "gosec",
            ["-fmt=json", "-quiet", "./..."],
            config.targetPath,
            60000
        );

        if (!result.parsed) return [];

        const findings: VulnerabilityReasoning[] = [];
        const issues = result.parsed.Issues || result.parsed.issues || [];

        for (const [idx, issue] of issues.slice(0, 20).entries()) {
            findings.push({
                id: `GOSEC-${idx}`,
                category: mapGosecCategory(issue.rule_id || issue.cwe?.id),
                issue: issue.details || issue.what || "Go security issue",
                description: `${issue.details || "Security issue detected"} (Confidence: ${issue.confidence || "unknown"})`,
                severity: mapGoSeverity(issue.severity),
                evidence: `File: ${issue.file}:${issue.line}\nRule: ${issue.rule_id || "N/A"}\nCode: ${issue.code || "N/A"}`,
                remediation: issue.cwe ? `CWE-${issue.cwe.id}: ${issue.cwe.url || "Review Go security practices."}` : "Review and fix the identified security pattern.",
            });
        }

        return findings;
    }
}

function mapGoSeverity(severity: string): "Low" | "Medium" | "High" | "Critical" {
    switch (severity?.toUpperCase()) {
        case "HIGH": return "High";
        case "MEDIUM": return "Medium";
        case "LOW": return "Low";
        default: return "Medium";
    }
}

function mapGosecCategory(ruleId: string): string {
    if (!ruleId) return "A03:2021-Injection";
    // G1xx = Injection, G2xx = Crypto, G3xx = File, G4xx = Access, G5xx = Config
    const prefix = ruleId.substring(0, 2).toUpperCase();
    if (prefix === "G1" || ruleId.startsWith("G1")) return "A03:2021-Injection";
    if (prefix === "G2" || ruleId.startsWith("G2")) return "A02:2021-Cryptographic Failures";
    if (prefix === "G3" || ruleId.startsWith("G3")) return "A01:2021-Broken Access Control";
    if (prefix === "G4" || ruleId.startsWith("G4")) return "A01:2021-Broken Access Control";
    if (prefix === "G5" || ruleId.startsWith("G5")) return "A05:2021-Security Misconfiguration";
    return "A03:2021-Injection";
}

/**
 * Utility: Check if a directory contains files with given extensions (shallow + 1 level deep)
 */
export function hasFilesWithExtension(dirPath: string, extensions: string[]): boolean {
    try {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
                return true;
            }
            if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
                try {
                    const subEntries = fs.readdirSync(path.join(dirPath, entry.name), { withFileTypes: true });
                    for (const sub of subEntries) {
                        if (sub.isFile() && extensions.some(ext => sub.name.endsWith(ext))) {
                            return true;
                        }
                    }
                } catch { /* skip unreadable dirs */ }
            }
        }
    } catch { /* skip unreadable dirs */ }
    return false;
}
