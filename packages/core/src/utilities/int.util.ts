export const int = (val: string | undefined, num: number): number =>
  val ? (isNaN(parseInt(val)) ? num : parseInt(val)) : num;
