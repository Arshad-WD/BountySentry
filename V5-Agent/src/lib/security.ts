export function sanitizeUrl(url: string): string {
    try {
        const parsed = new URL(url);
        // Only allow http and https
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            throw new Error("Invalid protocol");
        }
        // Basic domain validation
        if (!parsed.hostname.includes(".")) {
            throw new Error("Invalid hostname");
        }
        return parsed.toString();
    } catch (e) {
        throw new Error("Invalid URL format");
    }
}

// Simple in-memory rate limiter (for demonstration)
const rateLimits = new Map<string, { count: number; lastTime: number }>();

export function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const limit = 5; // 5 scans per hour
    const windowMs = 3600000;

    const current = rateLimits.get(ip) || { count: 0, lastTime: now };

    if (now - current.lastTime > windowMs) {
        rateLimits.set(ip, { count: 1, lastTime: now });
        return true;
    }

    if (current.count >= limit) {
        return false;
    }

    current.count += 1;
    rateLimits.set(ip, current);
    return true;
}
