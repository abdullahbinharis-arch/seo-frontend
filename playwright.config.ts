import { readFileSync } from "fs";
import { resolve } from "path";
import { defineConfig } from "@playwright/test";

/** Read AUTH_SECRET from .env.local so cookies match the running dev server. */
function loadAuthSecret(): string {
  try {
    const env = readFileSync(resolve(__dirname, ".env.local"), "utf-8");
    // NextAuth v5 accepts both AUTH_SECRET and NEXTAUTH_SECRET
    const match =
      env.match(/^AUTH_SECRET=(.+)$/m) ??
      env.match(/^NEXTAUTH_SECRET=(.+)$/m);
    if (match) return match[1].trim().replace(/^["']|["']$/g, "");
  } catch {
    /* .env.local may not exist in CI */
  }
  return "test-secret-for-playwright-e2e-testing-only-32plus-chars";
}

const AUTH_SECRET = loadAuthSecret();

// Make AUTH_SECRET available to test helpers via process.env
process.env.TEST_AUTH_SECRET = AUTH_SECRET;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    env: {
      AUTH_SECRET,
      NEXT_PUBLIC_API_URL: "http://localhost:8000",
    },
  },
});
