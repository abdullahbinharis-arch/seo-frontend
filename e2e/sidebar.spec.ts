import { test, expect } from "@playwright/test";
import { setupAuth } from "./helpers/auth";
import { setupMockData } from "./helpers/mock-data";

const NAV_LABELS = [
  "Audit Report",
  "SEO Tasks",
  "GMB Optimisation",
  "On-Page SEO",
  "Rank Tracker",
  "Content Writer",
  "Post Creator",
  "Keyword Research",
  "Keyword Gap",
  "Backlink Builder",
  "Technical SEO",
  "Reports",
  "Profile Manager",
  "Settings",
];

test.describe("Sidebar", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await setupMockData(page);
  });

  test("renders all nav items", async ({ page }) => {
    await page.goto("/dashboard/overview");
    const sidebar = page.locator("aside").first();

    for (const label of NAV_LABELS) {
      await expect(sidebar.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test("logo is visible", async ({ page }) => {
    await page.goto("/dashboard/overview");
    const sidebar = page.locator("aside").first();
    // The Logo component renders inside the sidebar header area
    await expect(sidebar.locator("a, div").filter({ has: page.locator("svg") }).first()).toBeVisible();
  });

  test("active route highlighting on Audit Report", async ({ page }) => {
    await page.goto("/dashboard/overview");
    const sidebar = page.locator("aside").first();
    const auditLink = sidebar.getByRole("link", { name: "Audit Report" });

    await expect(auditLink).toBeVisible();
    // Active link has emerald styling class
    await expect(auditLink).toHaveClass(/bg-emerald/);
  });

  test("navigation works — click SEO Tasks", async ({ page }) => {
    await page.goto("/dashboard/overview");
    const sidebar = page.locator("aside").first();
    const tasksLink = sidebar.getByRole("link", { name: "SEO Tasks" });

    await tasksLink.click();
    await expect(page).toHaveURL(/\/dashboard\/tasks/);
  });

  test("expandable sub-menu — GMB children appear", async ({ page }) => {
    await page.goto("/dashboard/overview");
    const sidebar = page.locator("aside").first();

    // Children should not be visible initially
    await expect(sidebar.getByText("Google My Business Edit")).not.toBeVisible();
    await expect(sidebar.getByText("Local Citation Builder")).not.toBeVisible();

    // Click the expand chevron button inside the GMB nav item
    const gmbLink = sidebar.getByRole("link", { name: "GMB Optimisation" });
    const expandBtn = gmbLink.locator("button");
    await expandBtn.click();

    // Children should now be visible
    await expect(sidebar.getByText("Google My Business Edit")).toBeVisible();
    await expect(sidebar.getByText("Local Citation Builder")).toBeVisible();
  });

  test("score badge renders with mock audit data", async ({ page }) => {
    await page.goto("/dashboard/overview");
    const sidebar = page.locator("aside").first();

    // The Audit Report item has badge="score" — should show "72" (the overall score)
    const auditItem = sidebar.getByRole("link", { name: "Audit Report" });
    await expect(auditItem.getByText("72")).toBeVisible();
  });

  test("task count badge renders", async ({ page }) => {
    await page.goto("/dashboard/overview");
    const sidebar = page.locator("aside").first();

    // SEO Tasks has badge="count" — should show "3" (3 mock tasks)
    const tasksItem = sidebar.getByRole("link", { name: "SEO Tasks" });
    await expect(tasksItem.getByText("3")).toBeVisible();
  });

  test("AI badge renders on Content Writer and Post Creator", async ({ page }) => {
    await page.goto("/dashboard/overview");
    const sidebar = page.locator("aside").first();

    const contentItem = sidebar.getByRole("link", { name: "Content Writer" });
    await expect(contentItem.getByText("AI")).toBeVisible();

    const postsItem = sidebar.getByRole("link", { name: "Post Creator" });
    await expect(postsItem.getByText("AI")).toBeVisible();
  });

  test("mobile sidebar opens and closes", async ({ page }) => {
    // Set a mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard/overview");

    // Desktop sidebar should be hidden (md:hidden on mobile)
    // Mobile sidebar should not be visible initially
    const mobileSidebar = page.locator("aside.md\\:hidden");
    await expect(mobileSidebar).not.toBeVisible();

    // Click the hamburger button
    const hamburger = page.getByLabel("Open menu");
    await hamburger.click();

    // Mobile sidebar should now be visible
    await expect(mobileSidebar).toBeVisible();

    // Click the overlay to close
    const overlay = page.locator(".fixed.inset-0.bg-black\\/60");
    await overlay.click({ position: { x: 350, y: 300 } });

    // Mobile sidebar should be hidden again
    await expect(mobileSidebar).not.toBeVisible();
  });

  test("profile switcher section is visible", async ({ page }) => {
    await page.goto("/dashboard/overview");
    const sidebar = page.locator("aside").first();

    // ProfileSwitcher shows the active profile name or email
    // With our mock data, it should show "Test Business" (from profiles)
    // or "test@example.com" (from session)
    const profileSection = sidebar.locator(".border-t.border-white\\/6").last();
    await expect(profileSection).toBeVisible();

    // Sign out button should be present
    await expect(sidebar.getByText("Sign out")).toBeVisible();
  });
});
