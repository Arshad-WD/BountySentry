/**
 * RetireJsWrapper - Known-vulnerable JavaScript library detector
 * Detects: Outdated/vulnerable frontend JS libraries
 * Requires: npx retire (auto-downloads via npx)
 */

import { VulnerabilityReasoning } from "../agents/AgentSystem";
import { StaticAnalyzer, StaticAnalysisConfig } from "./StaticAnalyzer";
import { runTool } from "./ToolRunner";

export class RetireJsWrapper implements StaticAnalyzer {
    name = "retire.js";

    async isAvailable(): Promise<boolean> {
        return true; // Uses npx, always available
    }

    async scan(config: StaticAnalysisConfig): Promise<VulnerabilityReasoning[]> {
        const result = await runTool(
            "retire.js",
            "npx",
            ["-y", "retire", "--path", config.targetPath, "--outputformat", "json", "--exitwith", "0"],
            config.targetPath,
            60000
        );

        if (!result.parsed && !result.output) {
            return [];
        }

        // retire.js may output JSON array directly
        let retireData: any[] = [];
        try {
            retireData = result.parsed || JSON.parse(result.output);
        } catch {
            return [];
        }

        if (!Array.isArray(retireData)) return [];

        const findings: VulnerabilityReasoning[] = [];
        let idx = 0;

        for (const entry of retireData) {
            if (idx >= 15) break;

            const results = entry.results || [];
            for (const lib of results) {
                for (const vuln of lib.vulnerabilities || []) {
                    findings.push({
                        id: `RETIRE-${idx}`,
                        category: "A06:2021-Vulnerable Components",
                        issue: `Vulnerable Library: ${lib.component}@${lib.version}`,
                        description: `${vuln.info?.[0] || "Known vulnerability"} found in ${lib.component} version ${lib.version}.`,
                        severity: mapRetireSeverity(vuln.severity),
                        evidence: `Component: ${lib.component}@${lib.version}\nFile: ${entry.file || "N/A"}\nCVE/Advisory: ${vuln.identifiers?.CVE?.[0] || vuln.identifiers?.summary || "N/A"}`,
                        remediation: `Upgrade ${lib.component} to a patched version. ${vuln.info?.[0] || ""}`,
                    });
                    idx++;
                }
            }
        }

        return findings;
    }
}

function mapRetireSeverity(severity: string): "Low" | "Medium" | "High" | "Critical" {
    switch (severity?.toLowerCase()) {
        case "critical": return "Critical";
        case "high": return "High";
        case "medium": return "Medium";
        case "low": return "Low";
        default: return "Medium";
    }
}
