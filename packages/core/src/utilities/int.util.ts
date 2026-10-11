export const int = (val: string | undefined, num: number): number => {
  if (!val) return num;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? num : parsed;
};
