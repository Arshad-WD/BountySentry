/**
 * MockIPFS: A simple local storage based simulation of IPFS
 * for demonstrating the "others can see" functionality without a real backend.
 */

export const MockIPFS = {
    save: (hash: string, content: string) => {
        if (typeof window === "undefined") return;
        try {
            localStorage.setItem(`v5_ipfs_${hash}`, content);
        } catch (e) {
            console.error("MockIPFS Save Error:", e);
        }
    },

    get: (hash: string): string | null => {
        if (typeof window === "undefined") return null;
        try {
            return localStorage.getItem(`v5_ipfs_${hash}`);
        } catch (e) {
            console.error("MockIPFS Get Error:", e);
            return null;
        }
    }
};
