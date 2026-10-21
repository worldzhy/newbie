export const bool = (val: string | null | undefined, bool: boolean): boolean =>
  !val ? bool : ["true", "1"].includes(val.toLowerCase());
