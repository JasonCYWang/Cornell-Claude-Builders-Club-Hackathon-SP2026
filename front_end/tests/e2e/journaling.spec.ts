import { test, expect } from "@playwright/test"

test("voice journal save -> timeline -> future self pattern", async ({ page, context }) => {
  await context.grantPermissions(["microphone"], { origin: "http://localhost:3000" })

  await page.goto("/")

  // Navigate to Journal tab.
  await page.getByRole("button", { name: "Journal" }).click()

  // We won't actually record in CI/local headless reliably; just ensure UI is present.
  await expect(page.getByRole("heading", { name: /Speak Your/i })).toBeVisible()
  await expect(page.getByLabel("Start recording")).toBeVisible()

  // Seed localStorage with one entry (simulates "Save Voice Memo" result).
  await page.evaluate(() => {
    const entry = {
      id: "e2e-seed-1",
      date: new Date().toISOString(),
      duration: "00:12",
      transcript:
        "I keep putting off applications because I feel behind. I compare myself to friends who seem to have it all figured out.",
      summary:
        "You talked about feeling behind, delaying applications, and worrying that you are not ready.",
      emotion: "anxious",
      emotionalThemes: ["anxiety", "comparison", "perfectionism"],
      patternDetected: "Waiting for confidence before taking action",
    }
    window.localStorage.setItem("futuremirror:journals:v1", JSON.stringify([entry]))
    window.dispatchEvent(new Event("futuremirror:journals:updated"))
  })

  // Timeline shows the entry.
  await page.getByRole("button", { name: "Timeline" }).click()
  await expect(page.getByText("Voice journal")).toBeVisible()
  await expect(
    page.getByText("Waiting for confidence before taking action", { exact: true })
  ).toBeVisible()

  // Future self shows latest pattern hint.
  await page.getByRole("button", { name: "Mirror" }).click()
  await expect(page.getByText("Based on your latest voice journal:")).toBeVisible()
  await expect(
    page.getByText("Waiting for confidence before taking action", { exact: true })
  ).toBeVisible()
})

