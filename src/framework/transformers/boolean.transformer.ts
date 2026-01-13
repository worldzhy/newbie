import { TransformFnParams } from 'class-transformer';

export function BooleanTransformer({ value }: TransformFnParams): boolean | undefined {
  if (typeof value !== 'string') return undefined;

  const normalized = value.toLowerCase();
  if (normalized === 'true' || normalized === '1') return true;
  if (normalized === 'false' || normalized === '0') return false;
  return undefined;
}
