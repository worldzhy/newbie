import crypto from "crypto";
import cryptoRandomString from "crypto-random-string";
import { v4 } from "uuid";

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

/**
 * Generate a cryptographically strong random string
 * @param length - Length of returned string
 * @param charactersOrType - Characters or one of the supported types
 */
export async function generateRandomString(length = 32, charactersOrType = "alphanumeric"): Promise<string> {
  if (
    ["hex", "base64", "url-safe", "numeric", "distinguishable", "ascii-printable", "alphanumeric"].includes(
      charactersOrType,
    )
  )
    return cryptoRandomString({
      length,
      type: charactersOrType as
        "hex" | "base64" | "url-safe" | "numeric" | "distinguishable" | "ascii-printable" | "alphanumeric",
    });
  return cryptoRandomString({ length, characters: charactersOrType });
}

/**
 * Generate a UUID
 */
export function generateUuid() {
  return v4();
}
