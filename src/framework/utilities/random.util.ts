import * as cryptoRandomString from 'crypto-random-string';
import {v4} from 'uuid';

/**
 * Generate a cryptographically strong random string
 * @param length - Length of returned string
 * @param charactersOrType - Characters or one of the supported types
 */
export async function generateRandomString(
  length = 32,
  charactersOrType = 'alphanumeric'
): Promise<string> {
  if (
    [
      'hex',
      'base64',
      'url-safe',
      'numeric',
      'distinguishable',
      'ascii-printable',
      'alphanumeric',
    ].includes(charactersOrType)
  )
    return cryptoRandomString({
      length,
      type: charactersOrType as
        | 'hex'
        | 'base64'
        | 'url-safe'
        | 'numeric'
        | 'distinguishable'
        | 'ascii-printable'
        | 'alphanumeric',
    });
  return cryptoRandomString({length, characters: charactersOrType});
}

/**
 * Generate a UUID
 */
export function generateUuid() {
  return v4();
}
