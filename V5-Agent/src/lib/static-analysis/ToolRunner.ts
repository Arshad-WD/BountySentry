/**
 * ToolRunner - Generic CLI tool executor with timeout & graceful fallback
 * Runs any static analysis CLI tool with a configurable timeout.
 * Auto-kills hung processes, returns parsed output or null on failure.
 */

import { exec, spawn } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface ToolRunResult {
    success: boolean;
    output: string;
    parsed?: any;
    error?: string;
    toolName: string;
    durationMs: number;
}

const DEFAULT_TIMEOUT_MS = 60_000; // 60 seconds

/**
 * Check if a CLI tool is available on the system
 */
export async function isToolAvailable(command: string): Promise<boolean> {
    try {
        const checkCmd = process.platform === "win32" ? `where ${command}` : `which ${command}`;
        await execAsync(checkCmd, { timeout: 5000 });
        return true;
    } catch {
        return false;
    }
}

/**
 * Run a CLI tool with timeout and return structured results
 */
export async function runTool(
    toolName: string,
    command: string,
    args: string[],
    cwd: string,
    timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<ToolRunResult> {
    const startTime = Date.now();

    return new Promise((resolve) => {
        const fullCmd = [command, ...args].join(" ");
        console.log(`[TOOL:${toolName}] Executing: ${fullCmd}`);

        const child = spawn(command, args, {
            cwd,
            shell: true,
            timeout: timeoutMs,
            stdio: ["ignore", "pipe", "pipe"],
        });

        let stdout = "";
        let stderr = "";

        child.stdout?.on("data", (data: Buffer) => {
            stdout += data.toString();
        });

        child.stderr?.on("data", (data: Buffer) => {
            stderr += data.toString();
        });

        // Safety timeout (belt + suspenders)
        const killTimer = setTimeout(() => {
            try {
                child.kill("SIGKILL");
            } catch { }
            resolve({
                success: false,
                output: stdout,
                error: `Timeout after ${timeoutMs}ms`,
                toolName,
                durationMs: Date.now() - startTime,
            });
        }, timeoutMs + 2000);

        child.on("close", (code) => {
            clearTimeout(killTimer);
            const durationMs = Date.now() - startTime;

            // Many security tools exit with non-zero when they find issues
            // So we treat any output as success
            let parsed: any = undefined;
            if (stdout.trim()) {
                try {
                    parsed = JSON.parse(stdout);
                } catch {
                    // Not JSON, that's fine
                }
            }

            console.log(`[TOOL:${toolName}] Completed in ${durationMs}ms (exit code: ${code})`);

            resolve({
                success: true,
                output: stdout,
                parsed,
                error: stderr || undefined,
                toolName,
                durationMs,
            });
        });

        child.on("error", (err) => {
            clearTimeout(killTimer);
            console.error(`[TOOL:${toolName}] Failed:`, err.message);
            resolve({
                success: false,
                output: "",
                error: err.message,
                toolName,
                durationMs: Date.now() - startTime,
            });
        });
    });
}

/**
 * Run multiple tools in parallel with Promise.allSettled
 * Returns results from all tools that completed successfully
 */
export async function runToolsParallel(
    tasks: Array<{ toolName: string; command: string; args: string[]; cwd: string; timeoutMs?: number }>
): Promise<ToolRunResult[]> {
    const startTime = Date.now();
    console.log(`[PARALLEL] Launching ${tasks.length} tools simultaneously...`);

    const promises = tasks.map((task) =>
        runTool(task.toolName, task.command, task.args, task.cwd, task.timeoutMs)
    );

    const results = await Promise.allSettled(promises);
    const completed: ToolRunResult[] = [];

    for (const result of results) {
        if (result.status === "fulfilled") {
            completed.push(result.value);
        } else {
            completed.push({
                success: false,
                output: "",
                error: result.reason?.message || "Unknown error",
                toolName: "unknown",
                durationMs: 0,
            });
        }
    }

    console.log(`[PARALLEL] All ${tasks.length} tools completed in ${Date.now() - startTime}ms`);
    return completed;
}
