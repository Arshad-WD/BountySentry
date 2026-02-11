import { exec } from "child_process";
import { promisify } from "util";
import { StaticAnalyzer, StaticAnalysisConfig } from "./StaticAnalyzer";
import { VulnerabilityReasoning } from "../agents/AgentSystem";

const execAsync = promisify(exec);

export class SemgrepWrapper implements StaticAnalyzer {
    name = "Semgrep";

    async isAvailable(): Promise<boolean> {
        try {
            await execAsync("semgrep --version");
            return true;
        } catch (error) {
            return false;
        }
    }

    async scan(config: StaticAnalysisConfig): Promise<VulnerabilityReasoning[]> {
        const findings: VulnerabilityReasoning[] = [];
        try {
            // Run semgrep with JSON output
            const cmd = `semgrep scan --config auto --json "${config.targetPath}"`;
            const { stdout } = await execAsync(cmd, { maxBuffer: 10 * 1024 * 1024 });

            const results = JSON.parse(stdout);

            if (results.results) {
                results.results.forEach((finding: any, index: number) => {
                    findings.push({
                        id: `SEMGREP-${index}-${Date.now()}`,
                        category: finding.extra?.metadata?.owasp?.[0] || "Security Misconfiguration",
                        issue: finding.extra?.message || "Potential Vulnerability",
                        description: finding.extra?.message || "Semgrep identified a potential security issue.",
                        severity: this.mapSeverity(finding.extra?.severity),
                        evidence: `File: ${finding.path}:${finding.start?.line}`,
                        remediation: finding.extra?.fix || "Review the code pattern and apply secure coding practices."
                    });
                });
            }
        } catch (error) {
            console.error("Semgrep scan failed:", error);
            // Optionally re-throw or return empty
        }
        return findings;
    }

    private mapSeverity(severity: string): "Low" | "Medium" | "High" | "Critical" {
        switch (severity?.toUpperCase()) {
            case "ERROR": return "High";
            case "WARNING": return "Medium";
            case "INFO": return "Low";
            default: return "Medium";
        }
    }
}
