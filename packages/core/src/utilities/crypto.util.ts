import bcrypt from "bcrypt";
import crypto from "crypto";

/**
 * Result of AES-256-GCM encryption. All fields are hex-encoded strings.
 */
export interface EncryptionResult {
  /** Ciphertext. */
  encrypted: string;
  /** GCM authentication tag (16 bytes). Must be passed back to decryptString. */
  authTag: string;
  /** Random 12-byte initialization vector. Must be passed back to decryptString. */
  iv: string;
}

/**
 * Encrypt data with AES-256-GCM.
 *
 * A fresh random 12-byte IV is generated on every call — GCM IV reuse with the
 * same key breaks authentication catastrophically, so the IV is never accepted
 * from the caller.
 *
 * @param data Plaintext to encrypt.
 * @param key  32-byte key (utf8 string) for AES-256.
 */
export function encryptString(data: string, key: string): EncryptionResult {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", new Uint8Array(Buffer.from(key, "utf8")), new Uint8Array(iv));
  const encrypted = cipher.update(data, "utf8", "hex") + cipher.final("hex");
  return {
    encrypted,
    authTag: cipher.getAuthTag().toString("hex"),
    iv: iv.toString("hex"),
  };
}

/**
 * Decrypt data previously encrypted with encryptString.
 *
 * Throws if the auth tag does not verify (tampered ciphertext or wrong key).
 *
 * @param encrypted Hex ciphertext from EncryptionResult.
 * @param key       32-byte key used during encryption.
 * @param iv        Hex IV from EncryptionResult.
 * @param authTag   Hex auth tag from EncryptionResult.
 */
export function decryptString(encrypted: string, key: string, iv: string, authTag: string): string {
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    new Uint8Array(Buffer.from(key, "utf8")),
    new Uint8Array(Buffer.from(iv, "hex")),
  );
  decipher.setAuthTag(new Uint8Array(Buffer.from(authTag, "hex")));
  return decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8");
}

/**
 * Hash a password with bcrypt (auto-generated salt).
 */
export async function generateHash(password: string | null): Promise<string> {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(password, salt);
}

/**
 * Compare a plaintext password against a bcrypt hash.
 */
export async function compareHash(password: string | null, hash: string | null): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
