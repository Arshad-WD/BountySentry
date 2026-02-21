/**
 * NjsscanWrapper - Node.js specific SAST scanner
 * Detects: XSS, SSRF, injection, insecure patterns in JS/TS code
 * Requires: pip install njsscan
 */

import { VulnerabilityReasoning } from "../agents/AgentSystem";
import { StaticAnalyzer, StaticAnalysisConfig } from "./StaticAnalyzer";
import { isToolAvailable, runTool } from "./ToolRunner";

export class NjsscanWrapper implements StaticAnalyzer {
    name = "njsscan";

    async isAvailable(): Promise<boolean> {
        return isToolAvailable("njsscan");
    }

    async scan(config: StaticAnalysisConfig): Promise<VulnerabilityReasoning[]> {
        const result = await runTool(
            "njsscan",
            "njsscan",
            ["--json", config.targetPath],
            config.targetPath,
            60000
        );

        if (!result.parsed) {
            return [];
        }

        const findings: VulnerabilityReasoning[] = [];
        const scanResults = result.parsed;
        let idx = 0;

        // njsscan outputs nested categories
        for (const [category, issues] of Object.entries<any>(scanResults)) {
            if (category === "errors" || category === "njsscan_version") continue;

            for (const [ruleId, ruleData] of Object.entries<any>(issues || {})) {
                if (idx >= 20) break;

                const metadata = ruleData.metadata || {};
                const files = ruleData.files || [];

                const fileEvidence = files
                    .slice(0, 3)
                    .map((f: any) => `${f.file_path}:${f.match_position?.[0] || "?"}`)
                    .join("\n");

                findings.push({
                    id: `NJSSCAN-${idx}`,
                    category: mapNjsscanCategory(metadata.owasp || category),
                    issue: metadata.description || ruleId,
                    description: `${metadata.description || "Security issue detected"} (Severity: ${metadata.severity || "unknown"})`,
                    severity: mapNjsscanSeverity(metadata.severity),
                    evidence: `Rule: ${ruleId}\nFiles:\n${fileEvidence || "N/A"}`,
                    remediation: metadata.cwe || "Follow secure coding practices for Node.js applications.",
                });
                idx++;
            }
        }

        return findings;
    }
}

function mapNjsscanSeverity(severity: string): "Low" | "Medium" | "High" | "Critical" {
    switch (severity?.toUpperCase()) {
        case "ERROR": return "Critical";
        case "WARNING": return "High";
        case "INFO": return "Medium";
        default: return "Medium";
    }
}

function mapNjsscanCategory(owasp: string): string {
    if (!owasp) return "A03:2021-Injection";
    if (owasp.includes("A1") || owasp.includes("Injection")) return "A03:2021-Injection";
    if (owasp.includes("A2") || owasp.includes("Auth")) return "A07:2021-Auth Failures";
    if (owasp.includes("A3") || owasp.includes("XSS")) return "A03:2021-Injection";
    if (owasp.includes("A5") || owasp.includes("Misconfig")) return "A05:2021-Security Misconfiguration";
    if (owasp.includes("A6") || owasp.includes("Crypto")) return "A02:2021-Cryptographic Failures";
    return "A03:2021-Injection";
}
