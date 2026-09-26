import readline from "node:readline";

import { green } from "colorette";

/**
 * Run an async task behind a small spinner animation.
 * On non-TTY stdout (CI, pipes, dry-run logs) we only print start/done lines
 * so output stays parseable instead of emitting carriage-return frames.
 */
export async function handleLoading<T>(
  text: string,
  task: () => Promise<T>,
): Promise<T> {
  if (!process.stdout.isTTY) {
    console.info(`${text} ...`);
    const result = await task();
    console.info(`${text} ${green("[Done]")}`);
    return result;
  }

  const frames = ["▹▹▹", "▸▹▹", "▹▸▹", "▹▹▸"];
  let index = 0;
  const timer = setInterval(() => {
    process.stdout.write(`\r${text} ${green(frames[index++ % frames.length])}`);
  }, 200);

  try {
    return await task();
  } finally {
    clearInterval(timer);
    readline.cursorTo(process.stdout, 0);
    readline.clearLine(process.stdout, 0);
    console.info(`${text} ${green("[Done]")}`);
  }
}
