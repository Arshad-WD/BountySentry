import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const findings = await prisma.finding.findMany({
            orderBy: { createdAt: "desc" },
            include: { scan: true }
        });
        return NextResponse.json(findings);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch findings" }, { status: 500 });
    }
}
