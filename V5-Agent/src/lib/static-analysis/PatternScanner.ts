import { StaticAnalyzer, StaticAnalysisConfig } from "./StaticAnalyzer";
import { VulnerabilityReasoning } from "../agents/AgentSystem";
import fs from "fs/promises";
import path from "path";

export class PatternScanner implements StaticAnalyzer {
    name = "DeepPatternScanner";

    async isAvailable(): Promise<boolean> {
        return true; // Always available as internal fallback
    }

    async scan(config: StaticAnalysisConfig): Promise<VulnerabilityReasoning[]> {
        const findings: VulnerabilityReasoning[] = [];

        try {
            // Recursive file walker would go here, but for now we scan specific files if target is repoa
            // Assuming config.targetPath is a directory

            const files = await this.getFiles(config.targetPath);

            for (const file of files) {
                const content = await fs.readFile(file, 'utf-8');
                const relativePath = path.relative(config.targetPath, file);

                // 1. Secret Scanning
                const secrets = this.scanSecrets(content);
                secrets.forEach((secret, idx) => {
                    findings.push({
                        id: `PATTERN-SECRET-${idx}-${Date.now()}`,
                        category: "A07:2021-Identification and Authentication Failures",
                        issue: "Hardcoded Secret",
                        description: "A potential hardcoded secret (API key, token, or password) was detected.",
                        severity: "Critical",
                        evidence: `${relativePath}: ${secret.substring(0, 10)}...`,
                        remediation: "Move secrets to environment variables."
                    });
                });

                // 2. Dangerous Functions (JS/TS specific as example)
                if (file.endsWith('.js') || file.endsWith('.ts')) {
                    if (content.includes('eval(')) {
                        findings.push({
                            id: `PATTERN-EVAL-${Date.now()}`,
                            category: "A03:2021-Injection",
                            issue: "Dangerous Function Execution",
                            description: "Usage of eval() detected. This can lead to remote code execution.",
                            severity: "Critical",
                            evidence: `${relativePath}: matches 'eval('`,
                            remediation: "Avoid using eval(). Use JSON.parse() or other safer alternatives."
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Pattern scan failed:", error);
        }

        return findings;
    }

    private async getFiles(dir: string): Promise<string[]> {
        const dirents = await fs.readdir(dir, { withFileTypes: true });
        const files = await Promise.all(dirents.map((dirent) => {
            const res = path.resolve(dir, dirent.name);
            return dirent.isDirectory() ? this.getFiles(res) : res;
        }));
        return Array.prototype.concat(...files);
    }

    private scanSecrets(content: string): string[] {
        const secrets: string[] = [];
        const patterns = [
            /(?:api_key|apikey|secret|token|password|key)[\s:=]+['"]([a-zA-Z0-9_\-]{20,})['"]/gi,
            /sk_live_[0-9a-zA-Z]{24}/g,
        ];

        patterns.forEach(regex => {
            let match;
            while ((match = regex.exec(content)) !== null) {
                secrets.push(match[1] || match[0]);
            }
        });
        return secrets;
    }
}
