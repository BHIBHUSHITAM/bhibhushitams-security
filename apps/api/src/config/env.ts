import dotenv from "dotenv";

dotenv.config();

function getEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: getEnv("NODE_ENV", "development"),
  port: Number(getEnv("PORT", "5000")),
  mongodbUri: getEnv("MONGODB_URI"),
  jwtAccessSecret: getEnv("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: getEnv("JWT_REFRESH_SECRET"),
  accessTokenExpiresIn: getEnv("ACCESS_TOKEN_EXPIRES_IN", "15m"),
  refreshTokenExpiresIn: getEnv("REFRESH_TOKEN_EXPIRES_IN", "7d"),
  corsOrigin: getEnv("CORS_ORIGIN", "http://localhost:3000"),
};
