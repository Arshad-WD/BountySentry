import { BrowserProvider } from "ethers";

export function getProvider() {
  if (typeof window === "undefined") return null;
  if (!(window as any).ethereum) {
    return null;
  }
  return new BrowserProvider((window as any).ethereum);
}

export async function getSigner() {
  const provider = getProvider();
  if (!provider) throw new Error("No provider found");
  return await provider.getSigner();
}
