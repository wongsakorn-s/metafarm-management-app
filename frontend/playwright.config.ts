import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "@playwright/test";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const backendVenvPython = path.resolve(currentDir, "../backend/venv/Scripts/python.exe");
const backendPythonCommand = fs.existsSync(backendVenvPython) ? `"${backendVenvPython}"` : "python";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    headless: true,
  },
  webServer: [
    {
      command: `${backendPythonCommand} ../backend/scripts/run_e2e_server.py`,
      cwd: ".",
      port: 8000,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "bun run e2e:frontend",
      cwd: ".",
      port: 4173,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        ...process.env,
        VITE_API_URL: "http://127.0.0.1:8000",
      },
    },
  ],
});
