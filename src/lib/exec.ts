import { spawn } from "node:child_process";

/** Result of a captured command execution. */
export interface ExecResult {
  stdout: string;
  stderr: string;
}

/** Run a command capturing output; rejects with the collected stderr on failure. */
export async function execCapture(
  command: string,
  args: string[],
  options: { cwd?: string } = {},
): Promise<ExecResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(
          new Error(
            `\`${command} ${args.join(" ")}\` exited with code ${code}${stderr.trim() ? `\n${stderr.trim()}` : ""}`,
          ),
        );
      }
    });
  });
}
