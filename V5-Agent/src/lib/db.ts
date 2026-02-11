// In-memory store for mock development
const mockStore = {
    scans: [] as any[],
    findings: [] as any[],
    users: [] as any[],
    sessions: [] as any[],
};

// Helper to generate realistic IDs (UUID-like format without "mock-" prefix)
function generateId(prefix: string = ''): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${randomPart}`;
}

// Helper to include relations
function includeRelations(item: any, include: any, type: 'scan' | 'finding') {
    if (!include) return item;

    const result = { ...item };

    if (type === 'scan' && include.findings) {
        result.findings = mockStore.findings.filter(f => f.scanId === item.id);
    }

    if (type === 'finding' && include.scan) {
        result.scan = mockStore.scans.find(s => s.id === item.scanId) || null;
    }

    return result;
}

// Helper to apply orderBy
function applyOrderBy(items: any[], orderBy?: any): any[] {
    if (!orderBy) return items;

    const key = Object.keys(orderBy)[0];
    const direction = orderBy[key];

    return [...items].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];

        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
    });
}

const mockPrisma = {
    scan: {
        create: async (data: any) => {
            const newItem = {
                id: generateId('scan'),
                ...data.data,
                status: "RUNNING",
                logs: ["Initializing Agent Mission..."],
                createdAt: new Date(),
            };
            mockStore.scans.push(newItem);
            return newItem;
        },
        findMany: async (args?: any) => {
            let results = [...mockStore.scans];

            // Apply orderBy
            if (args?.orderBy) {
                results = applyOrderBy(results, args.orderBy);
            } else {
                results = results.reverse(); // Default to reverse chronological
            }

            // Apply include
            if (args?.include) {
                results = results.map(scan => includeRelations(scan, args.include, 'scan'));
            }

            return results;
        },
        findUnique: async (args: any) => {
            const scan = mockStore.scans.find(s => s.id === args.where.id);
            if (!scan) return null;

            // Apply include
            return includeRelations(scan, args?.include, 'scan');
        },
        update: async (args: any) => {
            const index = mockStore.scans.findIndex(s => s.id === args.where.id);
            if (index !== -1) {
                // If appending logs
                if (args.data.logs && Array.isArray(args.data.logs)) {
                    const currentLogs = mockStore.scans[index].logs || [];
                    args.data.logs = [...currentLogs, ...args.data.logs];
                }
                mockStore.scans[index] = { ...mockStore.scans[index], ...args.data };
                return mockStore.scans[index];
            }
            return { ...args.data, id: args.where.id };
        },
        delete: async (args: any) => {
            const index = mockStore.scans.findIndex(s => s.id === args.where.id);
            if (index !== -1) {
                const deleted = mockStore.scans[index];
                mockStore.scans.splice(index, 1);
                // Also delete associated findings
                mockStore.findings = mockStore.findings.filter(f => f.scanId !== deleted.id);
                return deleted;
            }
            return null;
        },
    },
    finding: {
        create: async (data: any) => {
            const newItem = {
                id: generateId('finding'),
                ...data.data,
                createdAt: new Date(),
            };
            mockStore.findings.push(newItem);
            return newItem;
        },
        findMany: async (args?: any) => {
            let results = [...mockStore.findings];

            // Apply where filter
            if (args?.where?.scanId) {
                results = results.filter(f => f.scanId === args.where.scanId);
            }

            // Apply orderBy
            if (args?.orderBy) {
                results = applyOrderBy(results, args.orderBy);
            } else {
                results = results.reverse(); // Default to reverse chronological
            }

            // Apply include
            if (args?.include) {
                results = results.map(finding => includeRelations(finding, args.include, 'finding'));
            }

            return results;
        },
        findUnique: async (args: any) => {
            const finding = mockStore.findings.find(f => f.id === args.where.id);
            if (!finding) return null;

            // Apply include
            return includeRelations(finding, args?.include, 'finding');
        },
    },
    user: {
        create: async (data: any) => {
            const newItem = {
                id: generateId('user'),
                ...data.data,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockStore.users.push(newItem);
            return newItem;
        },
        findMany: async (args?: any) => {
            let results = [...mockStore.users];

            if (args?.orderBy) {
                results = applyOrderBy(results, args.orderBy);
            } else {
                results = results.reverse();
            }

            return results;
        },
        findUnique: async (args: any) => {
            if (args.where.id) {
                return mockStore.users.find(u => u.id === args.where.id) || null;
            }
            if (args.where.email) {
                return mockStore.users.find(u => u.email === args.where.email) || null;
            }
            return null;
        },
        update: async (args: any) => {
            const index = mockStore.users.findIndex(u => u.id === args.where.id);
            if (index !== -1) {
                mockStore.users[index] = { ...mockStore.users[index], ...args.data, updatedAt: new Date() };
                return mockStore.users[index];
            }
            return null;
        },
    },
    session: {
        create: async (data: any) => {
            const newItem = {
                id: generateId('session'),
                ...data.data,
                createdAt: new Date(),
            };
            mockStore.sessions.push(newItem);
            return newItem;
        },
        findUnique: async (args: any) => {
            if (args.where.id) {
                return mockStore.sessions.find(s => s.id === args.where.id) || null;
            }
            if (args.where.token) {
                return mockStore.sessions.find(s => s.token === args.where.token) || null;
            }
            return null;
        },
        delete: async (args: any) => {
            const index = mockStore.sessions.findIndex(s =>
                s.id === args.where.id || s.token === args.where.token
            );
            if (index !== -1) {
                const deleted = mockStore.sessions[index];
                mockStore.sessions.splice(index, 1);
                return deleted;
            }
            return null;
        },
    },
} as any;

let prisma: any;

try {
    // Dynamically attempt to import Prisma to avoid build errors if it's missing
    const { PrismaClient } = require("@prisma/client");
    prisma = new PrismaClient();
} catch (e) {
    console.warn("Prisma client failed to initialize, using mock client.");
    prisma = mockPrisma;
}

export { prisma };
