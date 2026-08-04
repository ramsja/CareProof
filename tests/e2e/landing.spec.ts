import { test, expect } from "@playwright/test";

/**
 * End-to-end tests for CareProof.
 *
 * Wallet-signature steps are not automated here — they require a browser wallet extension.
 * Contract behaviour is covered by the Hardhat unit tests.
 * These tests cover navigation, page rendering, and UI flows up to the wallet signature boundary.
 */

test.describe("Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("shows CareProof branding and TechHavenLabs name", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /careproof/i })).toBeVisible();
    await expect(page.getByText(/technavenlabs/i)).toBeVisible();
  });

  test("shows workflow steps", async ({ page }) => {
    await expect(page.getByText(/connect your wallet/i)).toBeVisible();
    await expect(page.getByText(/create a record/i)).toBeVisible();
    await expect(page.getByText(/register on blockchain/i)).toBeVisible();
  });

  test("shows supported network information", async ({ page }) => {
    await expect(page.getByText("CareProof Local")).toBeVisible();
    await expect(page.getByText("31337")).toBeVisible();
  });

  test("shows privacy model notice", async ({ page }) => {
    await expect(page.getByText(/only the cryptographic hash/i)).toBeVisible();
  });

  test("Open Dashboard link navigates to /dashboard", async ({ page }) => {
    await page.getByRole("link", { name: /open dashboard/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

test.describe("Dashboard page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("shows Dashboard heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
  });

  test("shows wallet connection prompt when not connected", async ({ page }) => {
    await expect(page.getByText(/connect your wallet/i)).toBeVisible();
  });

  test("New Record button links to /records/new", async ({ page }) => {
    const link = page.getByRole("link", { name: /new record/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/records/new");
  });
});

test.describe("Create record page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/records/new");
  });

  test("shows create record heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /create record/i })).toBeVisible();
  });

  test("shows all required form fields", async ({ page }) => {
    await expect(page.getByLabelText(/title/i)).toBeVisible();
    await expect(page.getByLabelText(/category/i)).toBeVisible();
    await expect(page.getByLabelText(/provider/i)).toBeVisible();
    await expect(page.getByLabelText(/service date/i)).toBeVisible();
    await expect(page.getByLabelText(/description/i)).toBeVisible();
    await expect(page.getByLabelText(/owner address/i)).toBeVisible();
  });

  test("shows validation error when submitting empty form", async ({ page }) => {
    await page.getByRole("button", { name: /preview/i }).click();
    await expect(page.getByRole("alert")).toBeVisible();
  });

  test("shows hash preview when form is filled", async ({ page }) => {
    await page.getByLabel(/title/i).fill("Annual Checkup");
    await page.getByLabel(/category/i).selectOption("checkup");
    await page.getByLabel(/provider/i).fill("Example Health Center");
    await page.getByLabel(/service date/i).fill("2024-06-20");
    await page.getByLabel(/description/i).fill("Routine annual health assessment.");
    await page.getByLabel(/owner address/i).fill("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266");
    // Hash preview should appear
    await expect(page.getByText(/hash preview/i)).toBeVisible();
  });
});

test.describe("About page", () => {
  test("shows on-chain vs off-chain data explanation", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByText(/stored on-chain/i)).toBeVisible();
    await expect(page.getByText(/stored off-chain/i)).toBeVisible();
  });

  test("shows security notice", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByText(/never requests seed phrases/i)).toBeVisible();
  });
});

test.describe("Activity page", () => {
  test("shows activity heading and filters", async ({ page }) => {
    await page.goto("/activity");
    await expect(page.getByRole("heading", { name: /activity/i })).toBeVisible();
    await expect(page.getByRole("search")).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("header links navigate correctly", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /about/i }).click();
    await expect(page).toHaveURL(/\/about/);
  });

  test("site header shows CareProof branding", async ({ page }) => {
    await page.goto("/");
    const header = page.getByRole("banner");
    await expect(header.getByText("CareProof")).toBeVisible();
    await expect(header.getByText("TechHavenLabs")).toBeVisible();
  });
});
