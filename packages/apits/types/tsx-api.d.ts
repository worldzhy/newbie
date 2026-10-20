// Ambient type declaration for `tsx/cjs/api`.
//
// tsx only exposes this subpath via the package.json `exports` field, which
// classic `moduleResolution: "node"` cannot read (the package has no
// `main`/`types` fields). This declaration gives the type-checker the shape
// of the runtime API without creating a filesystem path mapping, so the
// bundler (father / esbuild) leaves the bare specifier untouched and Node
// resolves it via the `exports` field at runtime.
//
// Shape mirrors `node_modules/tsx/dist/cjs/api/index.d.cts`; only the
// `register` symbol used by `src/cli.ts` is declared here.
declare module 'tsx/cjs/api' {
  type RegisterOptions = {
    namespace?: string;
  };
  type Unregister = () => void;
  type Register = {
    (options: RegisterOptions & { namespace: string }): Unregister;
    (options?: RegisterOptions): Unregister;
  };
  export const register: Register;
}
