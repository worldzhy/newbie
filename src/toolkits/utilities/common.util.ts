const bcrypt = require('bcryptjs');

export function randomCode(length = 6): string {
  let result = '';
  const characters = '0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export async function generateHash(password: string) {
  // The type of env variable is string.
  const saltRounds = parseInt(
    process.env.BCRYPT_SALT_ROUNDS ? process.env.BCRYPT_SALT_ROUNDS : '10'
  );
  return await bcrypt.hash(password, saltRounds);
}

export function nowPlusMinutes(minutes: number): Date {
  const currentTime = new Date();
  return new Date(currentTime.getTime() + minutes * 60000); // 1 min = 60000 ms
}
