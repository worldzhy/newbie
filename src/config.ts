export function getConfig() {
  return {
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
