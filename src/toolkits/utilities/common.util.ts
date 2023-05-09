const bcrypt = require('bcryptjs');

export function randomNumbers(length = 6): string {
  let result = '';
  const characters = '0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function randomLetters(length = 6): string {
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
  // The type of env variable is string.
  const saltRounds = parseInt(
    process.env.BCRYPT_SALT_ROUNDS ? process.env.BCRYPT_SALT_ROUNDS : '10'
  );
  return await bcrypt.hash(password, saltRounds);
}

export async function compareHash(
  password: string,
  hash: string | null
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function nowPlusMinutes(minutes: number): Date {
  const currentTime = new Date();
  return new Date(currentTime.getTime() + minutes * 60000); // 1 min = 60000 ms
}
