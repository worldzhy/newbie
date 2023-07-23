export function getJwtConfig() {
  return {
    accessToken: {
      bcryptSaltRounds: process.env.JWT_BCRYPT_SALT_ROUNDS,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
      secret: process.env.ACCESS_TOKEN_SECRET,
    },
    refreshToken: {
      bcryptSaltRounds: process.env.JWT_BCRYPT_SALT_ROUNDS,
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
      secret: process.env.REFRESH_TOKEN_SECRET,
    },
  };
}
