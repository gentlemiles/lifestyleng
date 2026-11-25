import { test, expect } from '@playwright/test';

test.describe('LifestyleNG.com Critical User Journeys', () => {
  test('Homepage renders all 4 corporate divisions and tagline', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', {
        name: /Wear It\. Connect It\. Stay in It\. Move with It\./i,
      })
    ).toBeVisible();
    await expect(page.getByText('1. Lifestyle Boutique (Homes)')).toBeVisible();
    await expect(page.getByText('2. Lifestyle Boutique (Fashion)')).toBeVisible();
    await expect(page.getByText('3. Lifestyle Logistics')).toBeVisible();
    await expect(page.getByText('4. Lifestyle MTN Services')).toBeVisible();
  });

  test('/mtn-fibrex permanently redirects (308) to /mtn-services/fibrex', async ({
    page,
  }) => {
    await page.goto('/mtn-fibrex');
    await expect(page).toHaveURL(/\/mtn-services\/fibrex/);
    await expect(
      page.getByRole('button', {
        name: /CHECK FIBREX AVAILABILITY IN MY AREA/i,
      })
    ).toBeVisible();
  });
});
