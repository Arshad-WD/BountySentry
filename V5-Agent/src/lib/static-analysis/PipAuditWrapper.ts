/**
 * PipAuditWrapper - Python dependency vulnerability scanner
 * Detects: Known CVEs in Python pip packages (via requirements.txt, Pipfile, setup.py)
 * Requires: pip install pip-audit  
 * Language: Python (dependency scanning)
 */

import { VulnerabilityReasoning } from "../agents/AgentSystem";
import { StaticAnalyzer, StaticAnalysisConfig } from "./StaticAnalyzer";
import { isToolAvailable, runTool } from "./ToolRunner";
import { hasFilesWithExtension } from "./GosecWrapper";
import * as fs from "fs";
import * as path from "path";

export class PipAuditWrapper implements StaticAnalyzer {
    name = "pip-audit";

    async isAvailable(): Promise<boolean> {
        return isToolAvailable("pip-audit");
    }

    async scan(config: StaticAnalysisConfig): Promise<VulnerabilityReasoning[]> {
        // Check if Python dependency files exist
        const hasPythonDeps =
            fs.existsSync(path.join(config.targetPath, "requirements.txt")) ||
            fs.existsSync(path.join(config.targetPath, "Pipfile")) ||
            fs.existsSync(path.join(config.targetPath, "setup.py")) ||
            fs.existsSync(path.join(config.targetPath, "pyproject.toml"));

        if (!hasPythonDeps) {
            console.log("[pip-audit] No Python dependency files found, skipping.");
            return [];
        }

        const args = ["--format=json", "--desc"];
        // Prefer requirements.txt if available
        const reqPath = path.join(config.targetPath, "requirements.txt");
        if (fs.existsSync(reqPath)) {
            args.push("-r", reqPath);
        }

        const result = await runTool(
            "pip-audit",
            "pip-audit",
            args,
            config.targetPath,
            60000
        );

        if (!result.parsed) return [];

        const findings: VulnerabilityReasoning[] = [];
        const dependencies = result.parsed.dependencies || result.parsed || [];

        if (!Array.isArray(dependencies)) return [];

        let idx = 0;
        for (const dep of dependencies) {
            for (const vuln of (dep.vulns || [])) {
                if (idx >= 20) break;
                findings.push({
                    id: `PIPAUDIT-${idx}`,
                    category: "A06:2021-Vulnerable Components",
                    issue: `Vulnerable Python Package: ${dep.name}@${dep.version}`,
                    description: `${vuln.id}: ${vuln.description || "Known vulnerability"} in ${dep.name} version ${dep.version}.`,
                    severity: mapPipSeverity(vuln.id),
                    evidence: `Package: ${dep.name}==${dep.version}\nVulnerability: ${vuln.id}\nFixed in: ${vuln.fix_versions?.join(", ") || "Not specified"}`,
                    remediation: vuln.fix_versions?.length
                        ? `Upgrade ${dep.name} to version ${vuln.fix_versions[vuln.fix_versions.length - 1]}`
                        : `Review advisory ${vuln.id} and find an alternative package.`,
                });
                idx++;
            }
        }

        return findings;
    }
}

function mapPipSeverity(vulnId: string): "Low" | "Medium" | "High" | "Critical" {
    // CVEs don't contain severity directly in pip-audit format, default to High
    if (vulnId?.startsWith("PYSEC")) return "High";
    return "High";
}
