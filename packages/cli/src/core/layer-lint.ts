/**
 * Pure evaluation of the registry module layering rules.
 *
 * Layers form a one-way hierarchy: domain -> capability -> foundation.
 * A module may depend on modules in its own layer or lower layers, never on
 * a higher layer. `module-hub` is framework-special: it carries no layer,
 * may depend on any module, and must not be depended upon by layered modules.
 */

export type ModuleLayer = "foundation" | "capability" | "domain";

export const MODULE_LAYERS: readonly ModuleLayer[] = ["foundation", "capability", "domain"];

/** Higher rank = higher layer; dependencies may only flow to lower/equal ranks. */
const LAYER_RANK: Record<ModuleLayer, number> = {
  foundation: 0,
  capability: 1,
  domain: 2,
};

export interface LayeredModule {
  key: string;
  /** Undefined for framework-special modules such as module-hub. */
  layer?: string;
  /** Keys of other registry modules this module physically imports (self excluded). */
  dependencies: string[];
  /**
   * Keys declared via the manifest `moduleDependencies` field. When omitted,
   * callers are treated as legacy inputs and declaration reconciliation is
   * skipped; the dev-lint command always supplies it explicitly.
   */
  declaredDependencies?: string[];
}

export interface LayerLintFinding {
  level: "error" | "warning";
  module: string;
  message: string;
}

export function isModuleLayer(value: string): value is ModuleLayer {
  return (MODULE_LAYERS as readonly string[]).includes(value);
}

/** Strongly connected components of `keys` restricted to `edges` (Tarjan). */
function stronglyConnectedComponents(keys: string[], edges: Map<string, string[]>): string[][] {
  const index = new Map<string, number>();
  const lowLink = new Map<string, number>();
  const onStack = new Set<string>();
  const stack: string[] = [];
  const components: string[][] = [];
  let counter = 0;

  function visit(key: string): void {
    index.set(key, counter);
    lowLink.set(key, counter);
    counter += 1;
    stack.push(key);
    onStack.add(key);

    for (const next of edges.get(key) ?? []) {
      if (!index.has(next)) {
        visit(next);
        lowLink.set(key, Math.min(lowLink.get(key)!, lowLink.get(next)!));
      } else if (onStack.has(next)) {
        lowLink.set(key, Math.min(lowLink.get(key)!, index.get(next)!));
      }
    }

    if (lowLink.get(key) === index.get(key)) {
      const component: string[] = [];
      let member: string;
      do {
        member = stack.pop()!;
        onStack.delete(member);
        component.push(member);
      } while (member !== key);
      components.push(component);
    }
  }

  for (const key of keys) {
    if (!index.has(key)) visit(key);
  }
  return components;
}

export function lintModuleLayers(modules: LayeredModule[]): LayerLintFinding[] {
  const byKey = new Map(modules.map((mod) => [mod.key, mod]));
  const findings: LayerLintFinding[] = [];

  for (const mod of modules) {
    if (mod.layer !== undefined && !isModuleLayer(mod.layer)) {
      findings.push({
        level: "error",
        module: mod.key,
        message: `unknown layer '${mod.layer}' (expected one of: ${MODULE_LAYERS.join(", ")})`,
      });
    }
  }

  for (const mod of modules) {
    // Direction and existence rules apply to both physical imports and the
    // declared dependency set: a declared edge forces installation coupling.
    const declared = mod.declaredDependencies ?? mod.dependencies;
    const edges = [...new Set([...mod.dependencies, ...declared])];
    for (const dep of edges) {
      if (dep === mod.key) continue;
      const target = byKey.get(dep);
      const isPhysical = mod.dependencies.includes(dep);
      if (!target) {
        findings.push({
          level: "error",
          module: mod.key,
          message: `${isPhysical ? "imports" : "declares dependency on"} '@modules/${dep}' which is not a registry module`,
        });
        continue;
      }
      if (!target.layer) {
        if (mod.layer) {
          findings.push({
            level: "error",
            module: mod.key,
            message: `layered module must not depend on layer-less module '${dep}'`,
          });
        }
        continue;
      }
      if (!mod.layer || !isModuleLayer(mod.layer) || !isModuleLayer(target.layer)) continue;

      const from = LAYER_RANK[mod.layer];
      const to = LAYER_RANK[target.layer];
      if (to > from) {
        findings.push({
          level: "error",
          module: mod.key,
          message: `${mod.layer} module must not depend on ${target.layer} module '${dep}'`,
        });
      } else if (to === from && isPhysical) {
        // Physical same-layer edges are the ones that can form import cycles;
        // a declaration-only same-layer edge is reported by reconciliation.
        findings.push({
          level: "warning",
          module: mod.key,
          message: `same-layer dependency on '${dep}' (allowed; review recommended)`,
        });
      }
    }
  }

  // Reconcile manifest declarations with physical imports.
  for (const mod of modules) {
    if (mod.declaredDependencies === undefined) continue;
    const declaredSet = new Set(mod.declaredDependencies);
    const actualSet = new Set(mod.dependencies);
    for (const dep of mod.dependencies) {
      if (declaredSet.has(dep) || !byKey.has(dep)) continue;
      findings.push({
        level: "error",
        module: mod.key,
        message: `imports '@modules/${dep}' but does not declare it in moduleDependencies`,
      });
    }
    for (const dep of mod.declaredDependencies) {
      if (actualSet.has(dep) || !byKey.has(dep)) continue;
      if (dep === mod.key) {
        findings.push({
          level: "warning",
          module: mod.key,
          message: `declares itself in moduleDependencies`,
        });
      } else {
        findings.push({
          level: "warning",
          module: mod.key,
          message: `declares module dependency '${dep}' but never imports it`,
        });
      }
    }
  }

  // Same-layer import cycles are errors even though same-layer edges are allowed.
  for (const layer of MODULE_LAYERS) {
    const layerKeys = modules.filter((mod) => mod.layer === layer).map((mod) => mod.key);
    const edges = new Map<string, string[]>();
    for (const mod of modules) {
      if (mod.layer !== layer) continue;
      edges.set(
        mod.key,
        mod.dependencies.filter((dep) => byKey.get(dep)?.layer === layer),
      );
    }
    for (const component of stronglyConnectedComponents(layerKeys, edges)) {
      if (component.length > 1) {
        findings.push({
          level: "error",
          module: component.sort().join(", "),
          message: `${layer} layer import cycle: ${component.sort().join(" <-> ")}`,
        });
      }
    }
  }

  return findings;
}
