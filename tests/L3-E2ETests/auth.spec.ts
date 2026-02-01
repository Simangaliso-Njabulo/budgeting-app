import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays login page by default', async ({ page }) => {
    await expect(page.getByText('Welcome back')).toBeVisible();
    await expect(page.getByPlaceholder('Enter your email')).toBeVisible();
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.getByPlaceholder('Enter your email').fill('wrong@example.com');
    await page.getByPlaceholder('Enter your password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('Invalid email or password')).toBeVisible();
  });

  test('navigates to sign up page', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign up' }).click();

    await expect(page.getByText('Create your account')).toBeVisible();
    await expect(page.getByPlaceholder('Enter your full name')).toBeVisible();
  });

  test('navigates to forgot password page', async ({ page }) => {
    await page.getByRole('button', { name: 'Forgot password?' }).click();

    await expect(page.getByText('Reset your password')).toBeVisible();
    await expect(page.getByPlaceholder('Enter your email')).toBeVisible();
    await expect(page.getByPlaceholder('Enter new password')).toBeVisible();
  });

  test('navigates back to login from forgot password', async ({ page }) => {
    await page.getByRole('button', { name: 'Forgot password?' }).click();
    await page.getByRole('button', { name: 'Back to login' }).click();

    await expect(page.getByText('Welcome back')).toBeVisible();
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    // This test requires a running backend with a valid user
    // Skip if no backend is available
    await page.getByPlaceholder('Enter your email').fill('test@example.com');
    await page.getByPlaceholder('Enter your password').fill('testpassword123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should see the dashboard after successful login
    await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 });
  });
});
