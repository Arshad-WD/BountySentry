import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";

const execAsync = promisify(exec);

export async function cloneRepository(repoUrl: string): Promise<string> {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "sentinel-scan-"));
    try {
        await execAsync(`git clone --depth 1 "${repoUrl}" "${tempDir}"`);
        return tempDir;
    } catch (error) {
        // Cleanup if clone fails
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => { });
        throw new Error(`Failed to clone repository: ${error}`);
    }
}

export async function cleanupRepository(dirPath: string): Promise<void> {
    if (dirPath && dirPath.includes("sentinel-scan-")) {
        await fs.rm(dirPath, { recursive: true, force: true }).catch(err => console.error("Cleanup failed:", err));
    }
}
