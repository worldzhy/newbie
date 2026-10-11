// Random generators and password hashing were moved to their own modules;
// re-exported here so existing `import { ... } from "./common.util"` paths
// (and the `@devbie/newbie` barrel) keep working without change.
export {
  generateRandomNumber,
  generateRandomNumbers,
  generateRandomLetters,
  generateRandomCode,
} from "./random.util";
export { generateHash, compareHash } from "./crypto.util";

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
