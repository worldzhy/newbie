/**
 * How to use:
 *   await delay(1000);
 */
export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
