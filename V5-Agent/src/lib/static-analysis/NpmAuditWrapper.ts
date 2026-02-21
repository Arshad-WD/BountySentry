/**
 * NpmAuditWrapper - Node.js dependency vulnerability scanner
 * Detects: Known CVEs in npm dependencies
 * Requires: npm (ships with Node.js, no extra install)
 */

import { VulnerabilityReasoning } from "../agents/AgentSystem";
import { StaticAnalyzer, StaticAnalysisConfig } from "./StaticAnalyzer";
import { runTool } from "./ToolRunner";
import * as fs from "fs";
import * as path from "path";

export class NpmAuditWrapper implements StaticAnalyzer {
    name = "npm-audit";

    async isAvailable(): Promise<boolean> {
        // npm audit needs a package-lock.json or package.json to work
        return true; // npm is always available with Node.js
    }

    async scan(config: StaticAnalysisConfig): Promise<VulnerabilityReasoning[]> {
        // Check if package.json exists in the target
        const packageJsonPath = path.join(config.targetPath, "package.json");
        if (!fs.existsSync(packageJsonPath)) {
            console.log("[npm-audit] No package.json found, skipping.");
            return [];
        }

        const result = await runTool(
            "npm-audit",
            "npm",
            ["audit", "--json", "--production"],
            config.targetPath,
            60000
        );

        if (!result.parsed) {
            return [];
        }

        const findings: VulnerabilityReasoning[] = [];
        const vulnerabilities = result.parsed.vulnerabilities || {};

        let idx = 0;
        for (const [pkgName, vuln] of Object.entries<any>(vulnerabilities)) {
            if (idx >= 20) break; // Cap at 20 findings to avoid noise

            findings.push({
                id: `NPM-AUDIT-${idx}`,
                category: "A06:2021-Vulnerable Components",
                issue: `Vulnerable Dependency: ${pkgName}`,
                description: `${vuln.title || "Known vulnerability"} in ${pkgName}@${vuln.range || "unknown"}. ${vuln.via?.[0]?.title || ""}`,
                severity: mapNpmSeverity(vuln.severity),
                evidence: `Package: ${pkgName}\nAffected versions: ${vuln.range || "N/A"}\nDirect: ${vuln.isDirect ? "Yes" : "No (transitive)"}`,
                remediation: vuln.fixAvailable
                    ? `Update to a fixed version. Run: npm audit fix`
                    : "No automated fix available. Consider replacing the dependency.",
            });
            idx++;
        }

        return findings;
    }
}

function mapNpmSeverity(severity: string): "Low" | "Medium" | "High" | "Critical" {
    switch (severity?.toLowerCase()) {
        case "critical": return "Critical";
        case "high": return "High";
        case "moderate": return "Medium";
        case "low": return "Low";
        default: return "Medium";
    }
}
