import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const scan = await prisma.scan.findUnique({
            where: { id: id },
            include: { findings: true },
        });

        if (!scan) {
            return NextResponse.json({ error: "Scan not found" }, { status: 404 });
        }

        return NextResponse.json(scan);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch scan details" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const deleted = await prisma.scan.delete({
            where: { id: id },
        });

        if (!deleted) {
            return NextResponse.json({ error: "Scan not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Scan deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete scan" }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { action } = body;

        if (action === "retry") {
            // Get the original scan
            const originalScan = await prisma.scan.findUnique({
                where: { id: id },
            });

            if (!originalScan) {
                return NextResponse.json({ error: "Scan not found" }, { status: 404 });
            }

            // Reset the scan status to re-run
            await prisma.scan.update({
                where: { id: id },
                data: {
                    status: "RUNNING",
                    logs: ["Retrying scan mission..."],
                    updatedAt: new Date(),
                },
            });

            // Import and trigger the scanner
            const { runFullSecurityScan } = await import("@/lib/scanner");
            runFullSecurityScan(id).catch(console.error);

            return NextResponse.json({ success: true, message: "Scan retry initiated" });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
}
