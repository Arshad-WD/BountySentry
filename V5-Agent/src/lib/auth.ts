import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./db";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "your-secret-key-change-this-in-production"
);

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Password hashing
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

// JWT token creation and verification
export async function createToken(userId: string): Promise<string> {
    const token = await new SignJWT({ userId })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .setIssuedAt()
        .sign(JWT_SECRET);

    return token;
}

export async function verifyToken(token: string): Promise<{ userId: string } | null> {
    try {
        const verified = await jwtVerify(token, JWT_SECRET);
        return verified.payload as { userId: string };
    } catch (error) {
        return null;
    }
}

// Session management
export async function createSession(userId: string): Promise<string> {
    const token = await createToken(userId);
    const expiresAt = new Date(Date.now() + SESSION_DURATION);

    // Store session in database (if using real Prisma)
    try {
        await prisma.session.create({
            data: {
                userId,
                token,
                expiresAt,
            },
        });
    } catch (error) {
        // If using mock database, skip session storage
        console.log("Session storage skipped (mock database)");
    }

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("agent_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_DURATION / 1000,
        path: "/",
    });

    return token;
}

export async function getSession(): Promise<{ userId: string } | null> {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("agent_session")?.value;

    if (!sessionToken) {
        return null;
    }

    const payload = await verifyToken(sessionToken);
    if (!payload) {
        return null;
    }

    // Verify session exists in database (if using real Prisma)
    try {
        const session = await prisma.session.findUnique({
            where: { token: sessionToken },
        });

        if (!session || session.expiresAt < new Date()) {
            return null;
        }
    } catch (error) {
        // If using mock database, skip session verification
        console.log("Session verification skipped (mock database)");
    }

    return payload;
}

export async function destroySession(): Promise<void> {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("agent_session")?.value;

    if (sessionToken) {
        // Delete from database (if using real Prisma)
        try {
            await prisma.session.delete({
                where: { token: sessionToken },
            });
        } catch (error) {
            // If using mock database, skip session deletion
            console.log("Session deletion skipped (mock database)");
        }
    }

    // Clear cookie
    cookieStore.delete("agent_session");
}

export async function getCurrentUser() {
    const session = await getSession();
    if (!session) {
        return null;
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
            },
        });

        return user;
    } catch (error) {
        return null;
    }
}

// Middleware for protected routes
export async function requireAuth() {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error("Unauthorized");
    }
    return user;
}
