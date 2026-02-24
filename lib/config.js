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

export const config = {
  isProduction,
  isVercel,
  storagePath: getStoragePath(),
  environment: isProduction ? "production" : "development",
};

export default config;
