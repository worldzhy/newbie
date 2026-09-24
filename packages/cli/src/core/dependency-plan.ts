/**
 * Pure dependency planning extracted from the legacy assemble-dependencies:
 * a dependency declared by a removed module is only uninstalled when no other
 * still-enabled module (nor the removal set processed earlier) declares it.
 */

export interface DependencyDecls {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export function planDependencyRemovals(
  removedDecls: DependencyDecls[],
  enabledDecls: DependencyDecls[],
): { dependencies: string[]; devDependencies: string[] } {
  const keptDependencies = new Set<string>();
  const keptDevDependencies = new Set<string>();

  for (const decl of enabledDecls) {
    Object.keys(decl.dependencies ?? {}).forEach((name) =>
      keptDependencies.add(name),
    );
    Object.keys(decl.devDependencies ?? {}).forEach((name) =>
      keptDevDependencies.add(name),
    );
  }

  const removedDependencies = new Set<string>();
  const removedDevDependencies = new Set<string>();

  for (const decl of removedDecls) {
    for (const name of Object.keys(decl.dependencies ?? {})) {
      if (!keptDependencies.has(name)) removedDependencies.add(name);
    }
    for (const name of Object.keys(decl.devDependencies ?? {})) {
      if (!keptDevDependencies.has(name)) removedDevDependencies.add(name);
    }
  }

  return {
    dependencies: [...removedDependencies],
    devDependencies: [...removedDevDependencies],
  };
}

/** Build `name@range` install specs from settings declarations. */
export function buildInstallSpecs(decls: DependencyDecls[]): {
  dependencies: string[];
  devDependencies: string[];
} {
  const dependencies: string[] = [];
  const devDependencies: string[] = [];

  for (const decl of decls) {
    for (const [name, range] of Object.entries(decl.dependencies ?? {})) {
      dependencies.push(`${name}@${range}`);
    }
    for (const [name, range] of Object.entries(decl.devDependencies ?? {})) {
      devDependencies.push(`${name}@${range}`);
    }
  }

  return { dependencies, devDependencies };
}
