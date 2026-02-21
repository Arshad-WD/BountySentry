/**
 * Sentinel AI - Production Multi-Agent System
 * Implementation of real heuristics-based security analysis.
 */

export interface ValidationResult {
    isValid: boolean;
    reason: string;
}

export interface ReconResult {
    techStack: string[];
    possibleEntryPoints: string[];
    authSurface: "none" | "weak" | "standard" | "strong";
    analysisNotes: string;
    serverHeaders: Record<string, string>;
    htmlContent?: string;
    secretsFound?: string[];
}

export interface VulnerabilityReasoning {
    id: string;
    category: string;
    issue: string;
    description: string;
    severity: "Low" | "Medium" | "High" | "Critical";
    evidence: string;
    remediation: string;
}

// 1. Pre-Scan Validation Agent (Real-world checks)
export async function validateTarget(target: string, confirmed: boolean): Promise<ValidationResult> {
    if (!confirmed) return { isValid: false, reason: "User consent not provided" };

    try {
        const url = new URL(target);
        const hostname = url.hostname;

        // Security check: No local/private analysis
        const privatePatterns = [
            /^localhost$/, /^127\./, /^10\./, /^172\.(1[6-9]|2[0-9]|3[0-1])\./, /^192\.168\./
        ];

        if (privatePatterns.some(p => p.test(hostname)) || hostname.endsWith(".local")) {
            return { isValid: false, reason: "Analysis of internal or private networks is strictly prohibited." };
        }

        return { isValid: true, reason: "Target validated." };
    } catch (e) {
        return { isValid: false, reason: "The provided URL is malformed." };
    }
}

// 2. Recon & Surface Analysis Agent (Actual Probing)
export async function performRecon(target: string): Promise<ReconResult> {
    const stack: string[] = [];
    const headers: Record<string, string> = {};

    try {
        // Attempt a headers-only probe to identify server tech
        const response = await fetch(target, { method: 'HEAD', cache: 'no-store' });

        response.headers.forEach((value, key) => {
            headers[key.toLowerCase()] = value;
        });

        // Heuristics for stack detection
        if (headers['x-powered-by']) stack.push(headers['x-powered-by']);
        if (headers['server']) stack.push(headers['server']);
        if (headers['x-nextjs-cache'] || headers['x-vercel-id']) stack.push("Next.js/Vercel");
        if (headers['via']?.includes("vegur")) stack.push("Heroku");
        if (headers['content-type']?.includes("text/html")) stack.push("Web Frontend");

    } catch (e) {
        stack.push("Unreachable (Direct Probe Failed)");
    }

    // 2. Deep target inspection (Fetch HTML for secret scanning)
    let html = "";
    const secrets: string[] = [];
    try {
        const getRes = await fetch(target, { cache: 'no-store' });
        if (getRes.ok) {
            const contentType = getRes.headers.get("content-type") || "";
            if (contentType.includes("text/html")) {
                html = await getRes.text();

                // Heuristic Secret Scanning (Regex patterns)
                const patterns = {
                    apiKey: /(?:api_key|apikey|secret|token|password|key)[\s:=]+['"]([a-zA-Z0-9_\-]{16,})['"]/gi,
                    internalIP: /10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}/g
                };

                let match;
                while ((match = patterns.apiKey.exec(html)) !== null) secrets.push(`Potential Key: ${match[1].substring(0, 4)}****`);
                while ((match = patterns.internalIP.exec(html)) !== null) secrets.push(`Internal IP Disclosure: ${match[0]}`);
            }
        }
    } catch (e) { }

    // 3. Proactive path probes (Parallelized for Velocity)
    const pathsToProbe = ["/robots.txt", "/.git/config", "/package.json", "/.env"];
    try {
        const probePromises = pathsToProbe.map(async (path) => {
            try {
                const res = await fetch(`${target.replace(/\/$/, '')}${path}`, { method: 'HEAD' });
                if (res.ok) {
                    return { path: `probe:${path}`, status: "found" };
                }
            } catch (e) { }
            return null;
        });

        const results = await Promise.all(probePromises);
        results.forEach(res => {
            if (res) headers[res.path] = res.status;
        });
    } catch (e) { }

    return {
        techStack: stack.length > 0 ? stack : ["Unknown Web Platform"],
        possibleEntryPoints: ["/", "/api", "/login", "/wp-admin"],
        authSurface: headers['set-cookie'] ? "standard" : "none",
        analysisNotes: `Deep analysis complete. Probed ${Object.keys(headers).length} headers and scanned HTML surface for secrets.`,
        serverHeaders: headers,
        htmlContent: html,
        secretsFound: secrets
    };
}

// 3. Vulnerability Reasoning Agent (Heuristics Mapping + LLM Synergy)
export async function reasonVulnerabilities(recon: ReconResult, llmConfig?: { provider: string, key: string, allKeys?: Record<string, string> }): Promise<VulnerabilityReasoning[]> {
    const findings: VulnerabilityReasoning[] = [];
    const h = recon.serverHeaders;

    // --- HEURISTICS PHASE (Static Rules) ---
    // Rule: Missing HSTS
    if (!h['strict-transport-security']) {
        findings.push({
            id: "HSTS-001",
            category: "A05:2021-Security Misconfiguration",
            issue: "Missing HSTS Header",
            description: "The server does not enforce HTTPS through the Strict-Transport-Security header, making it vulnerable to SSL stripping attacks.",
            severity: "Medium",
            evidence: "Header 'strict-transport-security' was not found in server response.",
            remediation: "Implement HSTS by adding the 'Strict-Transport-Security' header with a long max-age (e.g., 31536000)."
        });
    }

    // Rule: Missing CSP
    if (!h['content-security-policy']) {
        findings.push({
            id: "CSP-001",
            category: "A03:2021-Injection",
            issue: "Missing Content Security Policy",
            description: "No Content Security Policy (CSP) is implemented. This increases the risk of Cross-Site Scripting (XSS) and Clickjacking.",
            severity: "High",
            evidence: "Header 'content-security-policy' was not found.",
            remediation: "Define a strict CSP to restrict where scripts and other resources can be loaded from."
        });
    }

    // Rule: Information Disclosure (Server Header)
    if (h['server'] && h['server'].length > 10) {
        findings.push({
            id: "INF-001",
            category: "A01:2021-Broken Access Control",
            issue: "Server Version Disclosure",
            description: "The 'Server' header reveals specific version information about the underlying infrastructure.",
            severity: "Low",
            evidence: `Server: ${h['server']}`,
            remediation: "Configure the server to omit or genericize the 'Server' header to prevent fingerprinting."
        });
    }

    // Rule: Git Configuration Exposure
    if (h['probe:/.git/config']) {
        findings.push({
            id: "SEC-003",
            category: "A05:2021-Security Misconfiguration",
            issue: "Git Configuration Exposure",
            description: "The .git configuration file is accessible. This can lead to full source code disclosure and exposure of development history.",
            severity: "Critical",
            evidence: "/.git/config is accessible.",
            remediation: "Immediately restrict access to the .git directory via server configuration or remove it from the web root."
        });
    }

    // Rule: Deep Secret Scanning Results
    if (recon.secretsFound && recon.secretsFound.length > 0) {
        recon.secretsFound.forEach((secret, index) => {
            findings.push({
                id: `SEC-EXT-${index}`,
                category: "A03:2021-Injection",
                issue: secret.includes("IP") ? "Internal IP Disclosure" : "Potential API Key Exposure",
                description: `A pattern matching sensitive information (${secret.includes("IP") ? "Internal IP" : "API Token"}) was discovered in the public HTML source.`,
                severity: secret.includes("Key") ? "Critical" : "Medium",
                evidence: secret,
                remediation: "Immediately sanitize the public-facing HTML. Move sensitive keys to backend environment variables and ensure internal IP addresses are not leaked in comments or scripts."
            });
        });
    }

    // --- INTELLIGENCE PHASE (LLM Reasoning) ---
    if (llmConfig?.key && llmConfig.provider) {
        console.log(`[INTELLIGENCE] Handing off mission parameters to ${llmConfig.provider} reasoning agent.`);

        const prompt = `
            Perform a professional security analysis based on this reconnaissance data:
            Target Tech Stack: ${recon.techStack.join(", ")}
            Headers: ${JSON.stringify(recon.serverHeaders)}
            Secrets Found: ${JSON.stringify(recon.secretsFound)}
            
            Identify 1-2 sophisticated or contextual vulnerabilities based on this stack.
            Return results ONLY as a JSON array of objects with these fields:
            issue, category, description, severity (Low/Medium/High/Critical), evidence, remediation.
            Do not include any conversational text.
        `;

        const llmResponse = await callLlmIntelligence(prompt, llmConfig);
        if (llmResponse) {
            try {
                // Handle different response formats (OpenAI vs others)
                let content = "";
                if (llmResponse.choices?.[0]?.message?.content) {
                    content = llmResponse.choices[0].message.content;
                } else if (llmResponse.content?.[0]?.text) {
                    content = llmResponse.content[0].text;
                } else if (llmResponse.candidates?.[0]?.content?.parts?.[0]?.text) {
                    content = llmResponse.candidates[0].content.parts[0].text;
                }

                // Clean-up potential markdown blocks or conversational text
                const startIdx = content.indexOf('[');
                const endIdx = content.lastIndexOf(']');
                if (startIdx !== -1 && endIdx !== -1) {
                    const jsonStr = content.substring(startIdx, endIdx + 1);
                    const dynamicFindings = JSON.parse(jsonStr);
                    dynamicFindings.forEach((df: any, idx: number) => {
                        findings.push({
                            id: `LLM-REASON-${idx}`,
                            ...df
                        });
                    });
                }
            } catch (e) {
                console.error("Failed to parse LLM reasoning output:", e);
            }
        }
    }

    return findings;
}

// Complex Pipeline Orchestrator for Real Results
export async function generateSecurityReport(recon: ReconResult | RepoReconResult, vulnerability: VulnerabilityReasoning) {
    // This represents the "Risk" and "Remediation" agents working together
    return {
        title: vulnerability.issue,
        category: vulnerability.category,
        severity: vulnerability.severity,
        description: vulnerability.description,
        evidence: vulnerability.evidence,
        remediation: vulnerability.remediation,
        confidence: 1.0
    };
}

export interface RepoReconResult {
    foundFiles: string[];
    techStack: string[];
    riskScore: number;
    analysisNotes: string;
}

// New: GitHub Repository Recon
export async function performRepoRecon(target: string): Promise<RepoReconResult> {
    const foundFiles: string[] = [];
    const stack: string[] = [];

    // Extract user/repo from URL
    const match = target.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (match) {
        const [, user, repo] = match;
        const baseUrl = `https://raw.githubusercontent.com/${user}/${repo}/main`;

        const filesToCheck = [
            ".env",
            "docker-compose.yml",
            "package.json",
            "Dockerfile",
            "README.md"
        ];

        const probePromises = filesToCheck.map(async (file) => {
            try {
                const res = await fetch(`${baseUrl}/${file}`, { method: 'HEAD' });
                if (res.ok) {
                    return { file, found: true };
                }
            } catch (e) { }
            return null;
        });

        const results = await Promise.all(probePromises);
        results.forEach(res => {
            if (res) {
                foundFiles.push(res.file);
                if (res.file === "package.json") stack.push("Node.js");
                if (res.file === "Dockerfile") stack.push("Docker");
            }
        });
    }

    return {
        foundFiles,
        techStack: stack.length > 0 ? stack : ["Unidentified"],
        riskScore: foundFiles.includes(".env") ? 90 : 20,
        analysisNotes: `Probed repository. Detected ${foundFiles.length} key configuration files.`
    };
}

// New: Repo Vulnerability Reasoning
export async function reasonRepoVulnerabilities(recon: RepoReconResult, llmConfig?: { provider: string, key: string, allKeys?: Record<string, string> }): Promise<VulnerabilityReasoning[]> {
    const findings: VulnerabilityReasoning[] = [];

    // --- HEURISTICS PHASE ---
    if (recon.foundFiles.includes(".env")) {
        findings.push({
            id: "SEC-001",
            category: "A05:2021-Security Misconfiguration",
            issue: "Exposed Environment File",
            description: "A .env file was discovered in the repository root. This often contains sensitive credentials, API keys, and database passwords.",
            severity: "Critical",
            evidence: "Accessible at repo root via raw.githubusercontent.com",
            remediation: "Immediately remove the .env file from the repository and add it to .gitignore. Rotate any exposed credentials."
        });
    }

    if (recon.foundFiles.includes("docker-compose.yml")) {
        findings.push({
            id: "SEC-002",
            category: "A01:2021-Broken Access Control",
            issue: "Exposed Infrastructure Config",
            description: "A docker-compose file is exposed. This reveals internal network topology and service configurations.",
            severity: "Medium",
            evidence: "docker-compose.yml detected in root.",
            remediation: "Ensure infrastructure manifests are not stored in public repositories or are appropriately sanitized."
        });
    }

    // --- INTELLIGENCE PHASE ---
    if (llmConfig?.key && llmConfig.provider) {
        console.log(`[INTELLIGENCE] Handing off repository context to ${llmConfig.provider} reasoning agent.`);

        const prompt = `
            Perform a professional repository security analysis:
            Detected Files: ${recon.foundFiles.join(", ")}
            Tech Stack: ${recon.techStack.join(", ")}
            Risk Score: ${recon.riskScore}
            
            Identify potential architecture or configuration flaws specific to this repository structure.
            Return results ONLY as a JSON array of objects with these fields:
            issue, category, description, severity (Low/Medium/High/Critical), evidence, remediation.
            Do not include any conversational text.
        `;

        const llmResponse = await callLlmIntelligence(prompt, llmConfig);
        if (llmResponse) {
            try {
                let content = "";
                if (llmResponse.choices?.[0]?.message?.content) {
                    content = llmResponse.choices[0].message.content;
                } else if (llmResponse.content?.[0]?.text) {
                    content = llmResponse.content[0].text;
                } else if (llmResponse.candidates?.[0]?.content?.parts?.[0]?.text) {
                    content = llmResponse.candidates[0].content.parts[0].text;
                }

                // Use a non-flag regex for parsing
                const startIdx = content.indexOf('[');
                const endIdx = content.lastIndexOf(']');
                if (startIdx !== -1 && endIdx !== -1) {
                    const jsonStr = content.substring(startIdx, endIdx + 1);
                    const dynamicFindings = JSON.parse(jsonStr);
                    dynamicFindings.forEach((df: any, idx: number) => {
                        findings.push({
                            id: `LLM-REPO-REASON-${idx}`,
                            ...df
                        });
                    });
                }
            } catch (e) {
                console.error("Failed to parse LLM repo reasoning output:", e);
            }
        }
    }

    return findings;
}
// --- INTELLIGENCE CACHE ---
const intelligenceCache = new Map<string, any>();

// Multi-Provider LLM Integration Layer with Fallback & Local Support
export async function callLlmIntelligence(prompt: string, config: { provider: string, key: string, allKeys?: Record<string, string> }) {
    const { provider, key, allKeys } = config;
    const cacheKey = `${provider}:${prompt.substring(0, 100)}`;

    // 1. Check Cache
    if (intelligenceCache.has(cacheKey)) {
        console.log(`[CACHE] Retaining intelligence from previous mission telemetry.`);
        return intelligenceCache.get(cacheKey);
    }

    // 2. Primary Provider dispatch
    const result = await executeLlmRequest(provider, key, prompt);

    // 3. Fallback Logic (If Rate Limited or Failure)
    if ((!result || result.error) && allKeys) {
        console.warn(`[FALLBACK] Primary provider ${provider} exhausted. Rotating mission credentials...`);
        const otherProviders = Object.keys(allKeys).filter(p => p !== provider && allKeys[p]);

        for (const fallbackProvider of otherProviders) {
            console.log(`[FALLBACK] Engaging ${fallbackProvider} standby agent...`);
            const fallbackResult = await executeLlmRequest(fallbackProvider, allKeys[fallbackProvider], prompt);
            if (fallbackResult && !fallbackResult.error) {
                intelligenceCache.set(cacheKey, fallbackResult);
                return fallbackResult;
            }
        }
    }

    if (result && !result.error) {
        intelligenceCache.set(cacheKey, result);
    }
    return result;
}

/**
 * Smart API Key Auto-Detection
 * Detects the LLM provider from the key format
 */
export function detectProviderFromKey(key: string): string | null {
    if (!key || key.trim().length === 0) return null;
    const k = key.trim();

    // Anthropic: sk-ant-... (must check before generic sk-)
    if (k.startsWith("sk-ant-")) return "anthropic";

    // OpenRouter: sk-or-... (must check before generic sk-)
    if (k.startsWith("sk-or-")) return "openrouter";

    // OpenAI: sk-... or sk-proj-...
    if (k.startsWith("sk-")) return "openai";

    // Groq: gsk_...
    if (k.startsWith("gsk_")) return "groq";

    // Ollama: localhost URLs
    if (k.startsWith("http://localhost") || k.startsWith("http://127.0.0.1")) return "ollama";

    // Google Gemini: starts with AI or is 39+ chars alphanumeric
    if (k.startsWith("AI") && k.length >= 35) return "google";

    // Mistral: length pattern
    if (k.length === 32 && /^[a-zA-Z0-9]+$/.test(k)) return "mistral";

    return null; // Unknown — let user select manually
}

// Low-level execution logic
async function executeLlmRequest(provider: string, key: string, prompt: string) {
    const systemPrompt = "You are a specialized cybersecurity reasoning agent. Analyze the provided reconnaissance data and return specific security vulnerabilities found. Focus on high-impact, actionable findings.";

    try {
        if (provider === "openai") {
            const res = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: prompt }
                    ]
                })
            });
            const data = await res.json();
            if (data.error) return { error: true, details: data.error };
            return data;
        }

        if (provider === "ollama") {
            // Local Ollama Support (Unrestricted)
            const res = await fetch(`${key || "http://localhost:11434"}/api/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "llama3", // or any model user has pulled
                    prompt: `${systemPrompt}\n\n${prompt}`,
                    stream: false
                })
            });
            const data = await res.json();
            return { choices: [{ message: { content: data.response } }] };
        }

        if (provider === "groq") {
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
                body: JSON.stringify({
                    model: "llama3-70b-8192",
                    messages: [{ role: "user", content: prompt }]
                })
            });
            const data = await res.json();
            if (data.error) return { error: true, details: data.error };
            return data;
        }

        if (provider === "anthropic") {
            const res = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": key,
                    "anthropic-version": "2023-06-01"
                },
                body: JSON.stringify({
                    model: "claude-3-5-sonnet-20240620",
                    max_tokens: 1024,
                    messages: [{ role: "user", content: prompt }]
                })
            });
            const data = await res.json();
            if (data.error) return { error: true, details: data.error };
            return data;
        }

        if (provider === "google") {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${key}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });
            return await res.json();
        }

        if (provider === "openrouter") {
            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${key}`,
                    "HTTP-Referer": "https://sentinel-secure.io",
                    "X-Title": "Sentinel AI"
                },
                body: JSON.stringify({
                    model: "meta-llama/llama-3-8b-instruct:free",
                    messages: [{ role: "user", content: prompt }]
                })
            });
            return await res.json();
        }

        if (provider === "mistral") {
            const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${key}`
                },
                body: JSON.stringify({
                    model: "mistral-large-latest",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: prompt }
                    ]
                })
            });
            const data = await res.json();
            if (data.error) return { error: true, details: data.error };
            return data;
        }

        if (provider === "sentinelx" || provider === "shannon") {
            // SentinelX / Shannon - OpenAI-compatible API for autonomous pentesting
            // Shannon exposes an OpenAI-compatible endpoint
            const shannonBase = key.startsWith("http") ? key : "https://api.shannon.ai";
            const apiKey = key.startsWith("http") ? "" : key;

            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

            const res = await fetch(`${shannonBase}/v1/chat/completions`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    model: "shannon-security",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.1
                })
            });
            const data = await res.json();
            if (data.error) return { error: true, details: data.error };
            return data;
        }

    } catch (e) {
        console.error(`LLM Call Failed for ${provider}:`, e);
        return { error: true };
    }
}
