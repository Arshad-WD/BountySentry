import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const finding = await prisma.finding.findUnique({
            where: { id: id },
            include: { scan: true },
        });

        if (!finding) {
            return NextResponse.json({ error: "Finding not found" }, { status: 404 });
        }

        return NextResponse.json(finding);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch finding details" }, { status: 500 });
    }
}
