import { ethers } from "ethers";

export async function getProvider() {
    if (typeof window !== "undefined" && (window as any).ethereum) {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        return provider;
    }
    return null;
}

export async function getSigner() {
    const provider = await getProvider();
    if (provider) {
        return provider.getSigner();
    }
    return null;
}
