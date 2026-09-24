import fs from "node:fs/promises";
import path from "node:path";

import { execLive } from "./exec";

/**
 * Single write/exec boundary for every assemble step.
 * In dry-run mode no file is touched and no mutating command is executed;
 * the planned action is printed instead. Read operations bypass the sink.
 */
export interface Sink {
  readonly cwd: string;
  readonly dryRun: boolean;
  writeText(file: string, content: string): Promise<void>;
  writeJson(file: string, value: unknown): Promise<void>;
  remove(fileOrDir: string): Promise<void>;
  run(command: string, args: string[], label?: string): Promise<void>;
}

export function createSink(cwd: string, dryRun: boolean): Sink {
  const resolve = (file: string) => path.resolve(cwd, file);

  const plan = (message: string): void => {
    console.info(`[dry-run] ${message}`);
  };

  return {
    cwd,
    dryRun,

    async writeText(file: string, content: string): Promise<void> {
      if (dryRun) {
        plan(`write ${file} (${content.length} bytes)`);
        return;
      }
      const target = resolve(file);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, content, "utf8");
    },

    async writeJson(file: string, value: unknown): Promise<void> {
      await this.writeText(file, `${JSON.stringify(value, null, 2)}\n`);
    },

    async remove(fileOrDir: string): Promise<void> {
      if (dryRun) {
        plan(`remove ${fileOrDir}`);
        return;
      }
      await fs.rm(resolve(fileOrDir), { recursive: true, force: true });
    },

    async run(command: string, args: string[], _label?: string): Promise<void> {
      if (dryRun) {
        plan(`${command} ${args.join(" ")}`.trim());
        return;
      }
      await execLive(command, args, { cwd });
    },
  };
}
