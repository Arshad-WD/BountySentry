import { StaticAnalyzer, StaticAnalysisConfig } from "./StaticAnalyzer";
import { VulnerabilityReasoning } from "../agents/AgentSystem";
import fs from "fs/promises";
import path from "path";

export class PatternScanner implements StaticAnalyzer {
    name = "DeepPatternScanner";

    private patterns: SecurityPattern[] = [
        // --- XSS (Cross-Site Scripting) ---
        {
            regex: /dangerouslySetInnerHTML|innerHTML|document\.write|insertAdjacentHTML/g,
            issue: "Potential Cross-Site Scripting (XSS)",
            category: "A03:2021-Injection",
            description: "Direct usage of DOM injection sinks detected. This can lead to XSS if user input is not sanitized.",
            severity: "HIGH",
            remediation: "Use secure alternatives like textContent or sanitize HTML using DOMPurify."
        },
        {
            regex: /eval\(|new Function\(|setTimeout\(.*['"].*|setInterval\(.*['"].*/g,
            issue: "Insecure Dynamic Code Execution",
            category: "A03:2021-Injection",
            description: "Usage of eval() or dynamic Function constructors detected. This can lead to arbitrary code execution.",
            severity: "CRITICAL",
            remediation: "Avoid dynamic code execution. Use JSON.parse() or fixed logic instead."
        },

        // --- SQL Injection ---
        {
            regex: /query\(.*['"].*\$\{.*\}.*['"]\)|execute\(.*['"].*\$\{.*\}.*['"]\)/g,
            issue: "Potential SQL Injection (Interpolation)",
            category: "A03:2021-Injection",
            description: "String interpolation used in SQL queries detected. This is a high-risk pattern for SQL injection.",
            severity: "CRITICAL",
            remediation: "Use parameterized queries or prepared statements (e.g., query('SELECT * FROM users WHERE id = ?', [id]))."
        },
        {
            regex: /\.query\(.*['"]\s*SELECT.*WHERE.*=.*['"]\s*\+/g,
            issue: "SQL Injection (Concatenation)",
            category: "A03:2021-Injection",
            description: "Concatenating user input directly into SQL strings is extremely dangerous.",
            severity: "CRITICAL",
            remediation: "Use parameterized queries provided by your database driver (Prisma, pg, mysql2)."
        },

        // --- SSRF (Server Side Request Forgery) ---
        {
            regex: /fetch\(.*req\.(params|query|body).*|axios\.(get|post)\(.*req\.(params|query|body).*/g,
            issue: "Potential SSRF",
            category: "A10:2021-Server-Side Request Forgery",
            description: "Outbound request triggered using unsanitized user input as the URL.",
            severity: "HIGH",
            remediation: "Validate and whitelist allowed domains/URLs. Never allow direct mapping from user input to request URL."
        },

        // --- Path Traversal ---
        {
            regex: /fs\.readFile\(.*req\.(params|query|body).*|fs\.readFileSync\(.*req\.(params|query|body).*/g,
            issue: "Potential Path Traversal",
            category: "A01:2021-Broken Access Control",
            description: "Reading files from the filesystem using unsanitized user input.",
            severity: "HIGH",
            remediation: "Sanitize paths, use path.basename(), and ensure files are within an allowed base directory."
        },

        // --- JWT & Auth ---
        {
            regex: /jwt\.sign\(.*['"]none['"].*\)|{.*algorithm\s*:\s*['"]none['"].*}/gi,
            issue: "Insecure JWT Algorithm",
            category: "A07:2021-Identification and Authentication Failures",
            description: "Detected 'none' algorithm in JWT signing, allowing attackers to bypass token verification.",
            severity: "CRITICAL",
            remediation: "Use secure algorithms like RS256 or HS256 and enforce them during verification."
        },
        {
            regex: /passport\.authenticate\(.*{.*session\s*:\s*false.*}/g,
            issue: "Potentially Insecure Stateless Auth",
            category: "A07:2021-Identification and Authentication Failures",
            description: "Stateless authentication requires extremely rigorous token validation.",
            severity: "LOW",
            remediation: "Ensure all stateless tokens (JWTs) have short expiration and robust signature checking."
        },

        // --- Insecure Cryptography ---
        {
            regex: /crypto\.createHash\(['"](md5|sha1)['"]\)|createHash\(['"](md5|sha1)['"]\)/gi,
            issue: "Weak Cryptographic Hashing Algorithm",
            category: "A02:2021-Cryptographic Failures",
            description: "Usage of MD5 or SHA1 detected. These algorithms are cryptographically broken.",
            severity: "MEDIUM",
            remediation: "Use stronger algorithms like SHA-256 or SHA-512."
        },

        // --- IDOR and Access Control ---
        {
            regex: /findOne\(.*req\.(params|query|body)\.id.*\}|update\(.*req\.(params|query|body)\.id.*\}|delete\(.*req\.(params|query|body)\.id.*\}/g,
            issue: "Potential IDOR",
            category: "A01:2021-Broken Access Control",
            description: "Direct usage of user-controllable 'id' to access/modify records without obvious ownership checks.",
            severity: "HIGH",
            remediation: "Verify that the authenticated user has permission to access the specific resource ID."
        },

        // --- Security Misconfiguration ---
        {
            regex: /res\.setHeader\(['"]Access-Control-Allow-Origin['"]\s*,\s*['"]\*['"]\)/g,
            issue: "Insecure CORS Policy (Wildcard)",
            category: "A05:2021-Security Misconfiguration",
            description: "Wildcard CORS origin (*) detected, allowing any domain to access resources.",
            severity: "MEDIUM",
            remediation: "Specify explicit origins instead of using *."
        },
        {
            regex: /process\.env\.NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*['"]0['"]/g,
            issue: "Insecure TLS Configuration",
            category: "A05:2021-Security Misconfiguration",
            description: "Disabling TLS certificate validation makes the application vulnerable to Man-in-the-Middle attacks.",
            severity: "HIGH",
            remediation: "Never disable TLS validation in production. Use proper certificate authorities."
        },

        // --- Hardcoded Secrets ---
        {
            regex: /(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g,
            issue: "AWS Access Key ID",
            category: "A07:2021-Identification and Authentication Failures",
            description: "Hardcoded AWS Access Key ID detected.",
            severity: "CRITICAL",
            remediation: "Rotate the key and move to AWS Secrets Manager or environment variables."
        },
        {
            regex: /sk_live_[0-9a-zA-Z]{24}/g,
            issue: "Stripe Live Secret Key",
            category: "A07:2021-Identification and Authentication Failures",
            description: "Live Stripe secret key detected in source code.",
            severity: "CRITICAL",
            remediation: "Revoke the key immediately and move it to a secure vault."
        },
        {
            regex: /xox[baprs]-[0-9]{12}-[0-9]{12}-[a-zA-Z0-9]{24}/g,
            issue: "Slack API Token",
            category: "A07:2021-Identification and Authentication Failures",
            description: "Slack API token detected in source code.",
            severity: "CRITICAL",
            remediation: "Revoke the token and rotate credentials."
        }
    ];

    async isAvailable(): Promise<boolean> {
        return true;
    }

    async scan(config: StaticAnalysisConfig): Promise<VulnerabilityReasoning[]> {
        const findings: VulnerabilityReasoning[] = [];

        try {
            const files = await this.getFiles(config.targetPath);

            for (const file of files) {
                const content = await fs.readFile(file, 'utf-8');
                const relativePath = (config.targetPath && file) ? path.relative(config.targetPath, file) : path.basename(file);

                this.patterns.forEach((p, idx) => {
                    let match;
                    // Reset regex state for global patterns
                    p.regex.lastIndex = 0;
                    while ((match = p.regex.exec(content)) !== null) {
                        findings.push({
                            id: `PATTERN-${p.issue.replace(/\s+/g, '-')}-${Date.now()}-${idx}`,
                            category: p.category,
                            issue: p.issue,
                            description: p.description,
                            severity: p.severity,
                            evidence: `${relativePath}: matches current logic around line ${this.getLineNumber(content, match.index)}`,
                            remediation: p.remediation
                        });
                        // Break if not global to avoid infinite loops with /g
                        if (!p.regex.global) break;
                    }
                });
            }
        } catch (error) {
            console.error("Pattern scan failed:", error);
        }

        return findings;
    }

    private getLineNumber(content: string, index: number): number {
        return content.substring(0, index).split('\n').length;
    }

    private async getFiles(dir: string): Promise<string[]> {
        const dirents = await fs.readdir(dir, { withFileTypes: true });
        const files = await Promise.all(dirents.map((dirent) => {
            const res = path.resolve(dir, dirent.name);
            // Skip node_modules and .git
            if (dirent.name === 'node_modules' || dirent.name === '.git' || dirent.name === '.next' || dirent.name === 'dist') return [];
            return dirent.isDirectory() ? this.getFiles(res) : res;
        }));
        return Array.prototype.concat(...files);
    }
}

interface SecurityPattern {
    regex: RegExp;
    issue: string;
    category: string;
    description: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    remediation: string;
}
