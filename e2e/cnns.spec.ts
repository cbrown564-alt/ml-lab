import { expect, test, type Page } from "@playwright/test";

const openTab = (page: Page, name: string) => page.getByRole("tab", { name }).click();
const panel = (page: Page) => page.getByRole("tabpanel", { includeHidden: false });

test.describe("cnns exhibit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/exhibits/cnns");
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen");
  });

  test("the Story opens on a filter sliding across a grid", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Convolutional Neural Networks" })).toBeVisible();
    await expect(
      page.getByRole("img", { name: /vertical-edge filter at the centre/i }).first(),
    ).toBeVisible();
  });

  test("Run it: the slide control moves the filter position", async ({ page }) => {
    await openTab(page, "Run it");
    const slide = panel(page).getByRole("slider", { name: "Filter position" });
    await slide.fill("0");
    await expect(slide).toHaveValue("0");
  });

  test("See it enforces a committed prediction before the parameter reveal", async ({ page }) => {
    await panel(page).getByRole("button", { name: /Beat 4 of/ }).click();
    await expect(panel(page).getByText(/Predict first/i)).toBeVisible();
    await panel(page)
      .getByRole("button", { name: /thousands of weights versus ten/i })
      .click();
    await expect(panel(page).getByText(/You're right/)).toBeVisible();
  });

  test("Break it: shifting the image triggers the translation failure", async ({ page }) => {
    await openTab(page, "Break it");
    await expect(panel(page).getByText(/Trigger it/i)).toBeVisible();
    await panel(page).getByRole("button", { name: /Shift image one pixel/i }).click();
    await expect(panel(page).getByText(/Symptom · pattern moved/i)).toBeVisible();
  });

  test("Break it: the kernel tab triggers the locally-blind failure", async ({ page }) => {
    await openTab(page, "Break it");
    await panel(page).getByRole("button", { name: /Kernel too small/i }).click();
    await expect(panel(page).getByText(/Trigger it/i)).toBeVisible();
    await panel(page).getByRole("button", { name: /Swap in the corner block/i }).click();
    await expect(panel(page).getByText(/Symptom · same peak, different world/i)).toBeVisible();
    await panel(page).getByRole("button", { name: /Repair · back to stripes/i }).click();
    await expect(panel(page).getByText(/Trigger it/i)).toBeVisible();
  });

  test("Explain it pairs the checks with the three-grid companion", async ({ page }) => {
    await openTab(page, "Explain it");
    await expect(panel(page).getByText(/Same filter idea, three grids/i)).toBeVisible();
    await expect(panel(page).getByText(/What makes a convolution different/i)).toBeVisible();
    // Companion must open on a firing cell (slide 14), not the dead zero at slide 17.
    await expect(panel(page).getByText(/Mass 25\.20/)).toBeVisible();
  });
});
