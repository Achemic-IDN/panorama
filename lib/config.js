/**
 * Configuration management for database storage strategies
 *
 * IMPORTANT: this module is imported by `middleware.js` which runs on the
 * Edge Runtime. Therefore we must avoid importing Node-only modules (`fs`,
 * `path`) at module scope.
 */

const isProduction = process.env.NODE_ENV === "production";
const isVercel = process.env.VERCEL === "1";
const isEdgeRuntime = process.env.NEXT_RUNTIME === "edge";

// Determine appropriate storage paths
export const getStoragePath = (filename = "patients.json") => {
  // Edge runtime cannot use Node's `path` module; return a simple POSIX-ish path.
  // (This is only used for filesystem persistence, which should not run on Edge.)
  if (isEdgeRuntime) {
    return `/tmp/${filename}`;
  }
  if (isVercel) {
    return `/tmp/${filename}`;
  }
  // Build a stable path string without Node's `path` module.
  const cwd = process.cwd?.() || "";
  return `${cwd.replace(/\\/g, "/")}/data/${filename}`;
};

export const ensureDataDirectory = () => {
  // No filesystem access on Edge runtime
  if (isEdgeRuntime) return;
  if (isVercel) return;

  // Lazy-load Node-only modules at runtime (Node.js only)
  // eslint-disable-next-line no-eval
  const nodeRequire = eval("require");
  const fs = nodeRequire("fs");
  const path = nodeRequire("path");

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
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
  // Avoid calling getStoragePath() during Edge module evaluation
  storagePath: isEdgeRuntime ? undefined : getStoragePath(),
  environment: isProduction ? "production" : "development",
};

export default configObj;
