import bcrypt from "bcrypt";
import crypto from "crypto";

/**
 * Generate a cryptographically secure random integer in [1, max].
 * (Used for verification codes / OTP — Math.random is not unpredictable enough.)
 */
export function generateRandomNumber(max: number): number {
  return crypto.randomInt(1, max + 1);
}

/**
 * Generate a cryptographically secure string of random digits.
 */
export function generateRandomNumbers(length = 6): string {
  const characters = "0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters[crypto.randomInt(characters.length)];
  }
  return result;
}

/**
 * Generate a cryptographically secure string of random lowercase letters.
 */
export function generateRandomLetters(length = 6): string {
  const characters = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters[crypto.randomInt(characters.length)];
  }
  return result;
}

/**
 * Generate a cryptographically secure string of random digits + uppercase letters.
 */
export function generateRandomCode(length = 6): string {
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters[crypto.randomInt(characters.length)];
  }
  return result;
}

export async function generateHash(password: string | null): Promise<string> {
  const salt = await bcrypt.genSalt();
  return await bcrypt.hash(password, salt);
}

export async function compareHash(password: string | null, hash: string | null): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * 1=>A, 2=>B, 26=>Z, 52=>AZ
 */
export function number2alphabet(num: number) {
  let n = num;
  let alphabet = "";

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
    num += alphabet.charCodeAt(0) - "A".charCodeAt(0) + 1;
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
