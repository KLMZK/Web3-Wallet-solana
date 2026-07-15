// tests/wallet-connect.spec.ts
import { test, expect } from '../tests/fixtures/wallet-fixtures';

test('user can connect wallet and see their balance', async ({ page }) => {
  await page.goto('/');

  // Splash screen — ConnectWallet.tsx
  await expect(page.getByText('Access your Crypto')).toBeVisible();

  // WalletMultiButton opens the wallet-adapter modal
  await page.getByRole('button', { name: /connect wallet/i }).click();

  // wallet-adapter's modal lists our mock wallet by name
  await page.getByText('Playwright Mock Wallet').click();

  // After connecting, the dashboard should render — balance card visible
  await expect(page.getByText('SOL')).toBeVisible({ timeout: 10_000 });

  // The wallet pill in TopHeader should show a truncated address
  await expect(page.locator('text=/^[1-9A-HJ-NP-Za-km-z]{4}\\.\\.\\./')).toBeVisible();
});
