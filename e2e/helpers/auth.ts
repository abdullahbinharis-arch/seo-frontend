import { encode } from "@auth/core/jwt";
import type { Page } from "@playwright/test";

// Reads the secret set by playwright.config.ts (which loads it from .env.local)
const AUTH_SECRET =
  process.env.TEST_AUTH_SECRET ||
  "test-secret-for-playwright-e2e-testing-only-32plus-chars";

const MOCK_SESSION = {
  user: {
    id: "test-user-id",
    name: "Test User",
    email: "test@example.com",
  },
  accessToken: "fake-access-token",
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

/**
 * Sets up authentication for E2E tests:
 * 1. Creates a valid NextAuth JWE cookie so server-side middleware allows access
 * 2. Mocks the /api/auth/session endpoint for client-side useSession()
 */
export async function setupAuth(page: Page) {
  // Create a valid session cookie for the server-side middleware
  const token = await encode({
    token: {
      sub: "test-user-id",
      name: "Test User",
      email: "test@example.com",
      accessToken: "fake-access-token",
    },
    secret: AUTH_SECRET,
    salt: "authjs.session-token",
  });

  await page.context().addCookies([
    {
      name: "authjs.session-token",
      value: token,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  // Mock the session endpoint for client-side useSession()
  await page.route("**/api/auth/session", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_SESSION),
    })
  );

  // Mock CSRF token endpoint
  await page.route("**/api/auth/csrf", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ csrfToken: "fake-csrf-token" }),
    })
  );
}
