/**
 * Configuration management for database storage strategies
 */

import fs from "fs";
import path from "path";

const isProduction = process.env.NODE_ENV === "production";
const isVercel = process.env.VERCEL === "1";

// Determine appropriate storage paths
export const getStoragePath = (filename = "patients.json") => {
  if (isVercel) {
    return path.join("/tmp", filename);
  }
  return path.join(process.cwd(), "data", filename);
};

export const ensureDataDirectory = () => {
  if (!isVercel) {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }
};

// validate required environment variables using zod
import { z } from "zod";

const envSchema = z.object({
  // make DATABASE_URL optional so app tetap bisa jalan
  // meskipun belum ada konfigurasi database saat development.
  DATABASE_URL: z.string().url().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(16).optional(),
  // time for session max age in seconds; default to 12 hours
  SESSION_MAX_AGE_SECONDS: z
    .coerce.number()
    .int()
    .positive()
    .default(60 * 60 * 12),
  // rate limiter configuration
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
});

// parse now; gunakan fallback aman kalau environment tidak valid
let parsedEnv;
try {
  parsedEnv = envSchema.parse(process.env);
} catch (e) {
  console.error("Failed to parse env config, using safe defaults where possible:", e);
  parsedEnv = {
    NODE_ENV: process.env.NODE_ENV || "development",
    SESSION_MAX_AGE_SECONDS: 60 * 60 * 12,
    RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
    RATE_LIMIT_MAX_REQUESTS: 100,
  };
}

export const env = parsedEnv;

export const configObj = {
  isProduction,
  isVercel,
  storagePath: getStoragePath(),
  environment: isProduction ? "production" : "development",
};

export default configObj;
