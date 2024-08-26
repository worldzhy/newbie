export const bool = (val: string | null | undefined, bool: boolean): boolean =>
  !val ? bool : val.toLowerCase() === 'true';
