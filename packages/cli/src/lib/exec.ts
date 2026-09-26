import { execFile, spawn } from "node:child_process";

export interface ExecResult {
  stdout: string;
  stderr: string;
}

/**
 * Argument-based process execution. NEVER pass interpolated shell strings here:
 * every argument goes through execFile/spawn without a shell, which removes
 * the command-injection class of bugs the legacy CLI had (e.g.
 * `npm install ${userControlledString}`).
 */
export function execCapture(
  command: string,
  args: string[] = [],
  options: { cwd?: string; env?: NodeJS.ProcessEnv } = {},
): Promise<ExecResult> {
  return new Promise((resolve, reject) => {
    execFile(
      command,
      args,
      { cwd: options.cwd, env: options.env, maxBuffer: 32 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          (error as Error & { stderr?: string }).stderr = stderr?.toString();
          reject(error);
          return;
        }
        resolve({ stdout: stdout.toString(), stderr: stderr.toString() });
      },
    );
  });
}

/** Run with inherited stdio so long operations (npm install, git clone) stay visible. */
export function execLive(
  command: string,
  args: string[] = [],
  options: { cwd?: string; env?: NodeJS.ProcessEnv } = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env,
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `[Error] ${command} ${args.join(" ")} exited with code ${code}`,
          ),
        );
      }
    });
  });
}

export function trim(result: ExecResult): string {
  return result.stdout.trim();
}
