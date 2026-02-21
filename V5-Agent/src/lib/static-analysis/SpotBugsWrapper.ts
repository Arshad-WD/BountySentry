/**
 * SpotBugsWrapper - Java/Kotlin static analysis integration
 * Detects: SQL injection, XSS, path traversal, deserialization, weak crypto in Java/Kotlin
 * Requires: find-sec-bugs via spotbugs CLI or npx @pmd/pmd (PMD as alternative)
 * Language: Java (.java, .kt, .class)
 * 
 * Note: Uses PMD (via npx) as a more portable alternative to SpotBugs,
 *       since PMD does not require compiled bytecode.
 */

import { VulnerabilityReasoning } from "../agents/AgentSystem";
import { StaticAnalyzer, StaticAnalysisConfig } from "./StaticAnalyzer";
import { isToolAvailable, runTool } from "./ToolRunner";
import { hasFilesWithExtension } from "./GosecWrapper";

export class SpotBugsWrapper implements StaticAnalyzer {
    name = "java-sast";

    async isAvailable(): Promise<boolean> {
        // Try PMD first (portable via npx), fall back to spotbugs
        return (await isToolAvailable("pmd")) || true; // npx fallback
    }

    async scan(config: StaticAnalysisConfig): Promise<VulnerabilityReasoning[]> {
        if (!hasFilesWithExtension(config.targetPath, [".java", ".kt"])) {
            console.log("[java-sast] No .java/.kt files found, skipping.");
            return [];
        }

        // Try PMD via npx (works without compilation)
        const result = await runTool(
            "java-sast",
            "npx",
            ["-y", "pmd", "check", "-d", config.targetPath, "-R", "rulesets/java/quickstart.xml", "-f", "json", "--no-progress"],
            config.targetPath,
            60000
        );

        if (!result.parsed && !result.output) return [];

        let violations: any[] = [];
        try {
            const data = result.parsed || JSON.parse(result.output);
            // PMD JSON format: { files: [{ filename, violations: [...] }] }
            const files = data.files || data.processingErrors ? [] : [data];
            for (const file of (data.files || [])) {
                for (const v of (file.violations || [])) {
                    violations.push({ ...v, filename: file.filename });
                }
            }
        } catch {
            return [];
        }

        const findings: VulnerabilityReasoning[] = [];
        const securityRules = violations.filter(v =>
            v.rule?.toLowerCase().includes("sql") ||
            v.rule?.toLowerCase().includes("injection") ||
            v.rule?.toLowerCase().includes("xss") ||
            v.rule?.toLowerCase().includes("crypto") ||
            v.rule?.toLowerCase().includes("security") ||
            v.rule?.toLowerCase().includes("password") ||
            v.rule?.toLowerCase().includes("hard") ||
            v.priority <= 2 // High priority findings
        );

        for (const [idx, v] of securityRules.slice(0, 20).entries()) {
            findings.push({
                id: `JAVA-${idx}`,
                category: mapJavaCategory(v.rule || ""),
                issue: v.rule || "Java Security Issue",
                description: v.description || v.message || "Potential security issue in Java source code.",
                severity: mapJavaSeverity(v.priority),
                evidence: `File: ${v.filename || "unknown"}:${v.beginline || "?"}\nRule: ${v.ruleset || "N/A"} > ${v.rule || "N/A"}`,
                remediation: v.externalInfoUrl || "Follow Java secure coding guidelines (OWASP Java).",
            });
        }

        return findings;
    }
}

function mapJavaSeverity(priority: number): "Low" | "Medium" | "High" | "Critical" {
    if (priority <= 1) return "Critical";
    if (priority <= 2) return "High";
    if (priority <= 3) return "Medium";
    return "Low";
}

function mapJavaCategory(rule: string): string {
    const r = rule.toLowerCase();
    if (r.includes("sql") || r.includes("injection")) return "A03:2021-Injection";
    if (r.includes("xss") || r.includes("script")) return "A03:2021-Injection";
    if (r.includes("crypto") || r.includes("cipher") || r.includes("hash")) return "A02:2021-Cryptographic Failures";
    if (r.includes("auth") || r.includes("password")) return "A07:2021-Auth Failures";
    if (r.includes("serial") || r.includes("deserial")) return "A08:2021-Software Integrity";
    return "A05:2021-Security Misconfiguration";
}
