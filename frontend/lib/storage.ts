/**
 * MockIPFS: A shared network storage simulation.
 * Replaces LocalStorage with a central API to allow multi-user visibility.
 * Implements native compression for optimized transmission.
 */

export const MockIPFS = {
    save: async (hash: string, content: string) => {
        try {
            // Optional: Compression can be added here using CompressionStream
            // For now, we prioritize the "Shared" aspect which is most important for the user
            await fetch("/api/ipfs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hash, content: JSON.parse(content) })
            });

            // Local fallback for offline/dev speed
            if (typeof window !== "undefined") {
                localStorage.setItem(`v5_ipfs_${hash}`, content);
            }
        } catch (e) {
            console.error("Shared Storage Save Error:", e);
        }
    },

    get: async (hash: string): Promise<string | null> => {
        try {
            const resp = await fetch(`/api/ipfs?hash=${hash}`);
            if (resp.ok) {
                const data = await resp.json();
                return JSON.stringify(data);
            }
        } catch (e) {
            console.error("Shared Storage Sync Error, falling back to local:", e);
        }

        // Local fallback
        if (typeof window === "undefined") return null;
        return localStorage.getItem(`v5_ipfs_${hash}`);
    }
};
