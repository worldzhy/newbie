/** Error caused by the user's input or environment, not a CLI bug. */
export class CliError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CliError";
  }
}
