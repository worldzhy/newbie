/**
 * Local replacements for the small subset of `vtils` helpers used by this
 * project. `vtils` pulls in several deprecated dependencies (cuid, uuid,
 * tough-cookie@0.12.1 with a ReDoS advisory) and is otherwise unmaintained,
 * so these minimal local implementations keep the dependency tree clean.
 *
 * Behavior matches the upstream vtils functions for the call sites in this
 * repository only; no attempt is made to be a drop-in replacement for the
 * full vtils API.
 */

/**
 * Remove `undefined` from a type. Equivalent to vtils's `Defined<T>`.
 */
export type Defined<T> = Exclude<T, undefined>;

/**
 * Wrap a value in an array unless it is already an array.
 */
export function castArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

/**
 * `Array.isArray` alias, kept for import symmetry with the other helpers.
 */
export const isArray = Array.isArray;

/**
 * Check whether a value is a plain object (not null, not an array, not a
 * function, not a primitive). Matches vtils `isObject` for the JSON-Schema
 * values used in this project.
 */
export function isObject(value: any): value is Record<string, any> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Check whether a value is "empty": null/undefined, empty string, empty
 * array, or an object with no own enumerable string-keyed properties.
 */
export function isEmpty(value: any): boolean {
  if (value == null) return true;
  if (typeof value === "string" || Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return true;
}

/**
 * Iterate over the own enumerable string-keyed properties of an object,
 * invoking `callback(value, key)` for each.
 */
export function forOwn<T extends object>(obj: T, callback: (value: T[keyof T], key: keyof T) => void): void {
  if (obj == null) return;
  Object.keys(obj).forEach((key) => {
    callback((obj as any)[key], key as keyof T);
  });
}

/**
 * Iterate over a collection (array or object), invoking `callback(value, key)`
 * for each item. For arrays `key` is the numeric index. Types are intentionally
 * loose (matching vtils) because call sites pass heterogeneous OpenAPI data.
 */
export function each(collection: any, callback: (value: any, key: any) => void): void {
  if (collection == null) return;
  if (Array.isArray(collection)) {
    collection.forEach((value, index) => callback(value, index));
  } else if (typeof collection === "object") {
    Object.keys(collection).forEach((key) => {
      callback(collection[key], key);
    });
  }
}

/**
 * Return the first item in a collection for which `predicate` returns a
 * truthy value, or `undefined` if none matches.
 */
export function find(collection: any, predicate: (value: any, key: any) => boolean): any {
  if (collection == null) return undefined;
  if (Array.isArray(collection)) {
    return collection.find((value, index) => predicate(value, index));
  }
  if (typeof collection === "object") {
    for (const key of Object.keys(collection)) {
      const value = collection[key];
      if (predicate(value, key)) return value;
    }
  }
  return undefined;
}

/**
 * Tagged-template helper that strips the common leading whitespace from every
 * line. Multi-line interpolations keep the indentation of the line they are
 * embedded on (mirrors vtils `dedent`, which first runs `indent`).
 */
export function dedent(literals: TemplateStringsArray, ...interpolations: any[]): string {
  // Step 1: replicate vtils `indent` — when an interpolation spans multiple
  // lines, prefix every continuation line with the whitespace that precedes
  // the interpolation point so relative indentation is preserved.
  let text = "";
  for (let i = 0; i < interpolations.length; i++) {
    const literal = literals[i];
    const interpolation = String(interpolations[i]);
    const match = literal.match(/(?:^|[\r\n]+)([^\S\r\n]*)$/);
    if (match && match[1]) {
      text += literal + interpolation.replace(/([\r\n]+)(?=[^\r\n])/g, `$1${match[1]}`);
    } else {
      text += literal + interpolation;
    }
  }
  text += literals[literals.length - 1];

  // Step 2: find the common leading whitespace across non-empty lines and
  // strip it. Trim leading/trailing empty lines.
  const lines = text.split(/[\r\n]/g);
  let commonLeadingWhitespace: string | null = null;
  let firstLineIndex: number | null = null;
  let lastLineIndex: number | null = null;

  for (let i = 0; i < lines.length; i++) {
    const leadingWhitespace = lines[i].match(/^\s*/)![0];
    // Skip blank lines (whitespace-only).
    if (leadingWhitespace.length !== lines[i].length) {
      lastLineIndex = i;
      if (firstLineIndex == null) firstLineIndex = i;
      if (commonLeadingWhitespace == null || leadingWhitespace.length < commonLeadingWhitespace.length) {
        commonLeadingWhitespace = leadingWhitespace;
      }
    }
  }

  if (commonLeadingWhitespace == null) return text;
  return lines
    .slice(firstLineIndex!, lastLineIndex! + 1)
    .map((line) => line.slice(commonLeadingWhitespace!.length))
    .join("\n");
}
