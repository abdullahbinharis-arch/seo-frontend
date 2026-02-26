import type { Page } from "@playwright/test";

const API_URL = "http://localhost:8000";

const MOCK_PROFILES = [
  {
    id: "profile-1",
    user_id: "test-user-id",
    business_name: "Test Business",
    website_url: "https://testbusiness.com",
    business_category: "Restaurant",
    services: ["Dine-in", "Takeout"],
    country: "Canada",
    city: "Toronto",
    nap_data: null,
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    audit_count: 1,
    latest_audit: {
      id: "audit-1",
      version: 1,
      keyword: "best restaurant toronto",
      status: "completed",
      overall_score: 72,
      created_at: "2025-01-01T00:00:00Z",
    },
  },
];

const MOCK_AUDIT = {
  audit_id: "audit-1",
  profile_id: "profile-1",
  version: 1,
  business_name: "Test Business",
  keyword: "best restaurant toronto",
  target_url: "https://testbusiness.com",
  location: "Toronto, Canada",
  status: "completed",
  agents_executed: 11,
  execution_time_seconds: 30,
  timestamp: "2025-01-01T00:00:00Z",
  scores: {
    overall: 72,
    website_seo: 68,
    backlinks: 45,
    local_seo: 80,
    ai_seo: 55,
  },
  seo_tasks: [
    {
      id: "task-1",
      title: "Add meta description",
      pillar: "website_seo",
      priority: "high",
      time_estimate: "5 min",
      impact: "Improves CTR",
      status: "pending",
    },
    {
      id: "task-2",
      title: "Submit to local directories",
      pillar: "local_seo",
      priority: "medium",
      time_estimate: "30 min",
      impact: "Improves local visibility",
      status: "pending",
    },
    {
      id: "task-3",
      title: "Add FAQ schema",
      pillar: "ai_seo",
      priority: "high",
      time_estimate: "15 min",
      impact: "Improves AI visibility",
      status: "pending",
    },
  ],
  agents: {},
  summary: { quick_wins: [], estimated_api_cost: 0.5 },
};

/**
 * Sets up mock API data for E2E tests:
 * 1. Injects audit data into localStorage so DashboardProvider picks it up
 * 2. Mocks backend API endpoints via page.route()
 */
export async function setupMockData(page: Page) {
  // Seed localStorage so DashboardProvider has audit data on mount
  await page.addInitScript(
    ({ audit, profileId }) => {
      localStorage.setItem("lr_last_audit_v1", JSON.stringify(audit));
      localStorage.setItem("lr_active_profile_v1", profileId);
    },
    { audit: MOCK_AUDIT, profileId: "profile-1" }
  );

  // Mock GET /profiles
  await page.route(`${API_URL}/profiles`, (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_PROFILES),
      });
    }
    return route.continue();
  });

  // Mock GET /profiles/:id/audits/latest
  await page.route(`${API_URL}/profiles/*/audits/latest`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_AUDIT),
    })
  );

  // Mock GET /profiles/:id/audits
  await page.route(new RegExp(`${API_URL}/profiles/[^/]+/audits$`), (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: "audit-1",
          version: 1,
          keyword: "best restaurant toronto",
          status: "completed",
          pages_crawled: 10,
          execution_time: 30,
          overall_score: 72,
          created_at: "2025-01-01T00:00:00Z",
        },
      ]),
    })
  );
}

export { MOCK_AUDIT, MOCK_PROFILES };
