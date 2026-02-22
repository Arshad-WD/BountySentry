import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const STORAGE_DIR = path.join(process.cwd(), "data", "ipfs");

// Ensure directory exists
if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

export async function GET(req: NextRequest) {
    const hash = req.nextUrl.searchParams.get("hash");
    if (!hash) return NextResponse.json({ error: "No hash provided" }, { status: 400 });

    const filePath = path.join(STORAGE_DIR, `${hash}.json`);

    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    try {
        const data = fs.readFileSync(filePath, "utf-8");
        return new NextResponse(data, {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return NextResponse.json({ error: "Read failed" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { hash, content } = await req.json();
        if (!hash || !content) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const filePath = path.join(STORAGE_DIR, `${hash}.json`);
        fs.writeFileSync(filePath, JSON.stringify(content));

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: "Save failed" }, { status: 500 });
    }
}
