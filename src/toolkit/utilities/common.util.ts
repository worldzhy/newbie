import * as bcrypt from 'bcrypt';

export function generateRandomNumbers(length = 6): string {
  let result = '';
  const characters = '0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function generateRandomLetters(length = 6): string {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function generateRandomCode(length = 6): string {
  let result = '';
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export async function generateHash(password: string): Promise<string> {
  const salt = await bcrypt.genSalt();
  return await bcrypt.hash(password, salt);
}

export async function compareHash(
  password: string,
  hash: string | null
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * 1=>A, 2=>B, 26=>Z, 52=>AZ
 */
export function number2letters(num: number) {
  let n = num;
  let letters = '';

  while (n > 0) {
    let m = n % 26;
    if (m === 0) m = 26;
    letters = String.fromCharCode(64 + m) + letters;
    n = (n - m) / 26;
  }

  return letters;
}
