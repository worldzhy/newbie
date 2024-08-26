import * as bcrypt from 'bcrypt';

export function generateRandomNumber(max: number): number {
  return Math.ceil(Math.random() * max);
}

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
export function number2alphabet(num: number) {
  let n = num;
  let alphabet = '';

  while (n > 0) {
    let m = n % 26;
    if (m === 0) m = 26;
    alphabet = String.fromCharCode(64 + m) + alphabet;
    n = (n - m) / 26;
  }

  return alphabet;
}

/**
 * A=>1, B=>2, Z=>26, AZ=>52
 */
export function alphabet2number(alphabet: string) {
  let num = 0;

  while (alphabet.length > 0) {
    num *= 26;
    num += alphabet.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
    alphabet = alphabet.slice(1);
  }

  return num;
}

/**
 * 'Hello, 123 world! How are you 456' => [123, 456]
 */
export function extractNumbersFromString(str: string) {
  const numbers: number[] = [];

  const matches = str.match(/\d+/g);
  if (matches) {
    for (let i = 0; i < matches.length; i++) {
      numbers.push(parseInt(matches[i]));
    }
  }

  return numbers;
}
