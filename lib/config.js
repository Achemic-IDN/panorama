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
  DATABASE_URL: z.string().url(),
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

// parse now; will throw and crash startup if something is missing/invalid
export const env = envSchema.parse(process.env);

export const configObj = {
  isProduction,
  isVercel,
  storagePath: getStoragePath(),
  environment: isProduction ? "production" : "development",
};

export default configObj;
