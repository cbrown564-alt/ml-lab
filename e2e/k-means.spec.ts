import { expect, test, type Page } from "@playwright/test";

/**
 * The k-means exhibit (unsupervised cluster opener, full four-act spine). The claims
 * under test: the Story opens on three centroids settled into three blobs; Run it lets
 * the learner force the wrong k and step the Lloyd loop; the See-it prediction commits
 * the wrong-k merge before the reveal; Break it stages both the wrong-k and bad-start
 * failures; and Explain it keeps a live three-k companion beside the checks.
 */
const openTab = (page: Page, name: string) => page.getByRole("tab", { name }).click();
const panel = (page: Page) => page.getByRole("tabpanel", { includeHidden: false });

test.describe("k-means exhibit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/exhibits/k-means");
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen");
  });

  test("the Story opens on three centroids settled into the blobs", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "K-Means Clustering" })).toBeVisible();
    await expect(
      panel(page).getByRole("img", { name: /three centroids settled into the three blobs/i }),
    ).toBeVisible();
  });

  test("Run it: the k slider can force the wrong partition", async ({ page }) => {
    await openTab(page, "Run it");
    await panel(page).getByRole("slider", { name: "Clusters (k)" }).fill("0");
    await expect(panel(page).getByText(/Wrong k — two real blobs are forced/i)).toBeVisible();
  });

  test("See it enforces a committed prediction before the wrong-k reveal", async ({ page }) => {
    await panel(page).getByRole("button", { name: /Beat 4 of/ }).click();
    await expect(panel(page).getByText(/Predict first/i)).toBeVisible();
    await panel(page)
      .getByRole("button", {
        name: /merge two real blobs under one centroid/i,
      })
      .click();
    await expect(panel(page).getByText(/You're right/)).toBeVisible();
  });

  test("Break it: forcing k = 2 breaks the fit", async ({ page }) => {
    await openTab(page, "Break it");
    await expect(panel(page).getByText(/Trigger it/i)).toBeVisible();
    await panel(page).getByRole("slider", { name: "Clusters (k)" }).fill("1");
    await expect(panel(page).getByText(/Symptom · it broke/i)).toBeVisible();
  });

  test("Break it: the bad-start repair loop shows one centroid crossing the gap", async ({
    page,
  }) => {
    await openTab(page, "Break it");
    await panel(page).getByRole("button", { name: "Bad start" }).click();
    await panel(page).getByRole("button", { name: /Repair one Lloyd step/i }).click();
    await expect(panel(page).getByText(/One Lloyd update repaired the bad start/i)).toBeVisible();
  });

  test("Explain it pairs the checks with the three-k companion", async ({ page }) => {
    await openTab(page, "Explain it");
    await expect(panel(page).getByText(/The same points, three values of k/i)).toBeVisible();
    await expect(panel(page).getByText(/What actually decides which cluster a point belongs to/i)).toBeVisible();
  });
});
