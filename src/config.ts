export function getConfig() {
  return {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || '').split(','),
    accessToken: {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
      secret: process.env.ACCESS_TOKEN_SECRET,
    },
    refreshToken: {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
      secret: process.env.REFRESH_TOKEN_SECRET,
    },
  };
}
