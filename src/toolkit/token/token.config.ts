export function getJwtConfig(): {
  bcryptSaltRounds: string | undefined;
  expiresIn: string | undefined;
  secret: string | undefined;
} {
  return {
    bcryptSaltRounds: process.env.JWT_BCRYPT_SALT_ROUNDS,
    expiresIn: process.env.JWT_EXPIRES_IN,
    secret: process.env.JWT_SECRET,
  };
}
