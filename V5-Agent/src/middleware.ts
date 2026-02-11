import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "your-secret-key-change-this-in-production"
);

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3001";

export async function middleware(request: NextRequest) {
    // --- CORS handling for API routes ---
    if (request.nextUrl.pathname.startsWith("/api")) {
        // Handle preflight OPTIONS requests
        if (request.method === "OPTIONS") {
            return new NextResponse(null, {
                status: 204,
                headers: {
                    "Access-Control-Allow-Origin": FRONTEND_URL,
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Max-Age": "86400",
                },
            });
        }

        // Add CORS headers to all API responses
        const response = NextResponse.next();
        response.headers.set("Access-Control-Allow-Origin", FRONTEND_URL);
        response.headers.set("Access-Control-Allow-Credentials", "true");
        return response;
    }

    // Protect dashboard routes
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
        const sessionToken = request.cookies.get("agent_session")?.value;

        if (!sessionToken) {
            return NextResponse.redirect(new URL("/auth/signin", request.url));
        }

        try {
            await jwtVerify(sessionToken, JWT_SECRET);
            return NextResponse.next();
        } catch (error) {
            return NextResponse.redirect(new URL("/auth/signin", request.url));
        }
    }

    // Redirect authenticated users away from auth pages
    if (request.nextUrl.pathname.startsWith("/auth")) {
        const sessionToken = request.cookies.get("agent_session")?.value;

        if (sessionToken) {
            try {
                await jwtVerify(sessionToken, JWT_SECRET);
                return NextResponse.redirect(new URL("/dashboard", request.url));
            } catch (error) {
                // Invalid token, allow access to auth pages
                return NextResponse.next();
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/api/:path*", "/dashboard/:path*", "/auth/:path*"],
};
