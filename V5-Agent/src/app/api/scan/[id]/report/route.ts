import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: scanId } = await params;

        // 1. Fetch scan mission data
        const scan = await prisma.scan.findUnique({
            where: { id: scanId },
            include: {
                findings: true
            }
        });

        if (!scan) {
            return NextResponse.json({ error: "Mission not found" }, { status: 404 });
        }

        // 2. Generate Styled HTML Report
        const report = generateHtmlReport(scan);

        // 3. Stream as File Download
        return new Response(report, {
            headers: {
                "Content-Type": "text/html",
                "Content-Disposition": `attachment; filename="sentinel-report-${scanId.substring(0, 8)}.html"`,
            },
        });
    } catch (error: any) {
        console.error("Report generation failure:", error);
        return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
    }
}

function generateHtmlReport(scan: any) {
    const date = new Date(scan.createdAt).toLocaleString();
    const severityCount = {
        CRITICAL: scan.findings.filter((f: any) => f.severity === "CRITICAL" || f.severity === "Critical").length,
        HIGH: scan.findings.filter((f: any) => f.severity === "HIGH" || f.severity === "High").length,
        MEDIUM: scan.findings.filter((f: any) => f.severity === "MEDIUM" || f.severity === "Medium").length,
        LOW: scan.findings.filter((f: any) => f.severity === "LOW" || f.severity === "Low").length,
    };

    const totalFindings = scan.findings.length;
    const riskScore = Math.min(100, severityCount.CRITICAL * 30 + severityCount.HIGH * 15 + severityCount.MEDIUM * 5 + severityCount.LOW * 2);
    const riskLevel = riskScore >= 80 ? "CRITICAL" : riskScore >= 50 ? "HIGH" : riskScore >= 20 ? "MEDIUM" : "LOW";
    const riskColor = riskScore >= 80 ? "#ef4444" : riskScore >= 50 ? "#f97316" : riskScore >= 20 ? "#eab308" : "#22c55e";
    const engineLabel = scan.scanEngine === "sentinelx" ? "SentinelX Engine" : "CodeQL Engine";
    const modeLabel = (scan.scanMode || "full").charAt(0).toUpperCase() + (scan.scanMode || "full").slice(1);

    const findingsHtml = scan.findings.length === 0
        ? `<div class="finding-card" style="border-left-color: #22c55e;"><h3>✅ No Significant Vulnerabilities Found</h3><p>No critical security issues were identified during this mission.</p></div>`
        : scan.findings.map((finding: any, index: number) => {
            const sevColor = finding.severity === "Critical" || finding.severity === "CRITICAL" ? "#ef4444"
                : finding.severity === "High" || finding.severity === "HIGH" ? "#f97316"
                    : finding.severity === "Medium" || finding.severity === "MEDIUM" ? "#eab308"
                        : "#22c55e";
            return `
                <div class="finding-card" style="border-left-color: ${sevColor};">
                    <div class="finding-header">
                        <h3>${index + 1}. ${finding.type}</h3>
                        <span class="severity-badge" style="background: ${sevColor}20; color: ${sevColor}; border: 1px solid ${sevColor}40;">${finding.severity}</span>
                    </div>
                    <p class="finding-category">${finding.location || "General"}</p>
                    <div class="finding-section">
                        <h4>Analysis</h4>
                        <p>${finding.description}</p>
                    </div>
                    ${finding.evidence ? `<div class="finding-section"><h4>Evidence</h4><pre>${finding.evidence}</pre></div>` : ""}
                    ${finding.remediation ? `<div class="finding-section remediation"><h4>Remediation</h4><p>${finding.remediation}</p></div>` : ""}
                </div>
            `;
        }).join("");

    const logsHtml = (scan.logs || []).map((log: string) => `<div class="log-entry">${log}</div>`).join("");

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sentinel AI - Security Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, sans-serif; background: #0a0a0a; color: #e2e8f0; line-height: 1.6; }
        .container { max-width: 900px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 48px; padding-bottom: 32px; border-bottom: 1px solid #1e293b; }
        .header h1 { font-size: 28px; font-weight: 800; letter-spacing: 6px; text-transform: uppercase; margin-bottom: 8px; }
        .header p { color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 40px; }
        .summary-card { background: #111; border: 1px solid #1e293b; border-radius: 8px; padding: 20px; }
        .summary-card .label { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #64748b; font-weight: 700; margin-bottom: 8px; }
        .summary-card .value { font-size: 24px; font-weight: 800; }
        .risk-meter { background: #111; border: 1px solid #1e293b; border-radius: 8px; padding: 24px; margin-bottom: 40px; text-align: center; }
        .risk-meter .score { font-size: 48px; font-weight: 800; }
        .risk-meter .level { font-size: 12px; text-transform: uppercase; letter-spacing: 3px; font-weight: 800; margin-top: 4px; }
        .section-title { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 4px; margin-bottom: 20px; color: #94a3b8; border-bottom: 1px solid #1e293b; padding-bottom: 12px; }
        .finding-card { background: #111; border: 1px solid #1e293b; border-left: 4px solid; border-radius: 8px; padding: 24px; margin-bottom: 16px; }
        .finding-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .finding-header h3 { font-size: 16px; font-weight: 700; }
        .severity-badge { font-size: 10px; font-weight: 800; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; }
        .finding-category { font-size: 11px; color: #64748b; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1px; }
        .finding-section { margin-top: 16px; }
        .finding-section h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #64748b; font-weight: 700; margin-bottom: 8px; }
        .finding-section p { font-size: 14px; color: #cbd5e1; }
        .finding-section pre { background: #0a0a0a; border: 1px solid #1e293b; border-radius: 4px; padding: 12px; font-size: 12px; overflow-x: auto; color: #94a3b8; white-space: pre-wrap; word-break: break-word; }
        .remediation { background: #0f291e; border: 1px solid #16a34a30; border-radius: 6px; padding: 16px; }
        .remediation h4 { color: #22c55e !important; }
        .logs-container { background: #050505; border: 1px solid #1e293b; border-radius: 8px; padding: 20px; margin-top: 40px; }
        .log-entry { font-family: monospace; font-size: 11px; color: #64748b; padding: 3px 0; border-bottom: 1px solid #0f172a; }
        .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
        .meta-table td { padding: 10px 16px; border-bottom: 1px solid #1e293b; font-size: 13px; }
        .meta-table td:first-child { color: #64748b; font-weight: 700; text-transform: uppercase; font-size: 10px; letter-spacing: 2px; width: 180px; }
        .footer { text-align: center; margin-top: 48px; padding-top: 24px; border-top: 1px solid #1e293b; color: #334155; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; }
        @media print { body { background: white; color: black; } .container { max-width: 100%; } .finding-card, .summary-card, .risk-meter, .logs-container { border-color: #ddd; background: #fafafa; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Sentinel AI</h1>
            <p>Autonomous Security Audit Report</p>
        </div>

        <h2 class="section-title">Executive Summary</h2>
        <table class="meta-table">
            <tr><td>Target URL</td><td>${scan.url}</td></tr>
            <tr><td>Mission Date</td><td>${date}</td></tr>
            <tr><td>Mission ID</td><td>${scan.id}</td></tr>
            <tr><td>Status</td><td>${scan.status}</td></tr>
            <tr><td>Analysis Engine</td><td>${engineLabel}</td></tr>
            <tr><td>Analysis Mode</td><td>${modeLabel}</td></tr>
        </table>

        <div class="risk-meter">
            <div class="score" style="color: ${riskColor}">${riskScore}</div>
            <div class="level" style="color: ${riskColor}">Risk Level: ${riskLevel}</div>
        </div>

        <div class="summary-grid">
            <div class="summary-card"><div class="label">Critical</div><div class="value" style="color: #ef4444">${severityCount.CRITICAL}</div></div>
            <div class="summary-card"><div class="label">High</div><div class="value" style="color: #f97316">${severityCount.HIGH}</div></div>
            <div class="summary-card"><div class="label">Medium</div><div class="value" style="color: #eab308">${severityCount.MEDIUM}</div></div>
            <div class="summary-card"><div class="label">Low</div><div class="value" style="color: #22c55e">${severityCount.LOW}</div></div>
        </div>

        <h2 class="section-title">Technical Findings (${totalFindings})</h2>
        ${findingsHtml}

        <h2 class="section-title">Mission Telemetry</h2>
        <div class="logs-container">
            ${logsHtml}
        </div>

        <div class="footer">
            <p>Autonomously generated by Sentinel AI Agent System</p>
            <p>Report generated on ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>`;
}
