const path = require("node:path");

const { defineConfig } = require("@playwright/test");

const currentDir = __dirname;
const backendVenvPython = path.resolve(currentDir, "../backend/.venv/Scripts/python.exe");
const backendPythonCommand = `"${backendVenvPython}"`;
const chromeCommand = '"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"';
const chromeUserDataDir = 'C:\\Users\\acer\\AppData\\Local\\Temp\\metafarm-playwright-chrome';
const e2eApiUrl = "http://127.0.0.1:8010";
const e2eFrontendUrl = "http://127.0.0.1:4174";

module.exports = defineConfig({
  testDir: "./e2e",
  testMatch: /.*\.spec\.(cjs|js|ts)/,
  timeout: 60_000,
  use: {
    baseURL: e2eFrontendUrl,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    headless: true,
  },
  webServer: [
    {
      command: `${backendPythonCommand} ../backend/scripts/run_e2e_server.py`,
      cwd: ".",
      port: 8010,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        ...process.env,
        E2E_PORT: "8010",
      },
    },
    {
      command: "bun run e2e:frontend",
      cwd: ".",
      port: 4174,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        ...process.env,
        VITE_API_URL: e2eApiUrl,
        PORT: "4174",
      },
    },
    {
      command: `cmd /c rmdir /s /q "${chromeUserDataDir}" 2>nul & ${chromeCommand} --headless=new --remote-debugging-port=9222 --user-data-dir="${chromeUserDataDir}" --no-first-run --no-default-browser-check --disable-gpu --disable-dev-shm-usage --disable-software-rasterizer --disable-background-networking --disable-extensions about:blank`,
      cwd: ".",
      port: 9222,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
