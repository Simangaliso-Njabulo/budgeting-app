import { test, expect } from '@playwright/test';

// Helper to login before each test
async function loginUser(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByPlaceholder('Enter your email').fill('test@example.com');
  await page.getByPlaceholder('Enter your password').fill('testpassword123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 });
}

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  test('displays dashboard with key components', async ({ page }) => {
    await expect(page.getByText('Total Spent')).toBeVisible();
    await expect(page.getByText('Over Budget Alerts')).toBeVisible();
  });

  test('shows month selector', async ({ page }) => {
    // MonthSelector should be visible on the dashboard
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    await expect(page.getByText(currentMonth)).toBeVisible();
  });

  test('navigates to transactions tab', async ({ page }) => {
    await page.getByText('Transactions').click();
    await expect(page.getByText('Track your income and expenses')).toBeVisible();
  });

  test('navigates to buckets tab', async ({ page }) => {
    await page.getByText('Buckets').click();
    await expect(page.getByText('Manage your budget buckets')).toBeVisible();
  });

  test('navigates to categories tab', async ({ page }) => {
    await page.getByText('Categories').click();
    await expect(page.getByText('Organize your budget categories')).toBeVisible();
  });

  test('FAB opens add transaction modal', async ({ page }) => {
    await page.getByLabel('Add Transaction').click();
    await expect(page.getByText('Add Transaction')).toBeVisible();
  });

  test('logout returns to login page', async ({ page }) => {
    await page.getByText('Settings').click();
    await page.getByRole('button', { name: /logout|sign out/i }).click();
    await expect(page.getByText('Welcome back')).toBeVisible();
  });
});
