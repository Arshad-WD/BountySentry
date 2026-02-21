import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sanitizeUrl, checkRateLimit } from "@/lib/security";
import { runFullSecurityScan } from "@/lib/scanner";
import type { ScanMode, ScanEngine } from "@/lib/scanner";

export async function POST(req: Request) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "local";
        if (!checkRateLimit(ip)) {
            return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
        }

        const body = await req.json();
        const { url, type, consent, llmProvider, llmKey, allKeys, useStaticAnalysis, scanMode, scanEngine } = body;

        if (!url || !consent) {
            return NextResponse.json({ error: "URL and consent are required" }, { status: 400 });
        }

        const sanitizedUrl = sanitizeUrl(url);
        const mode: ScanMode = scanMode || "full";
        const engine: ScanEngine = scanEngine || "codeql";

        const scan = await prisma.scan.create({
            data: {
                url: sanitizedUrl,
                status: "RUNNING",
                consent: true,
                scanMode: mode,
                scanEngine: engine,
            },
        });

        // Trigger the analysis engine (non-blocking for the response)
        runFullSecurityScan(
            scan.id,
            { provider: llmProvider, key: llmKey, allKeys },
            useStaticAnalysis ?? true,
            mode,
            engine
        ).catch(console.error);

        return NextResponse.json(scan);
    } catch (error: any) {
        console.error("Scan creation error:", error);
        return NextResponse.json({ error: error.message || "Failed to create scan" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const scans = await prisma.scan.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(scans);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch scans" }, { status: 500 });
    }
}
