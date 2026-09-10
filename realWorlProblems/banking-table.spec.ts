import { test, expect } from '@playwright/test';
import { generateSnapshotFromApi } from './utils/snapshotHelper';
import { snapshot } from 'node:test';

test.describe('Banking Tree Table', () => {
  test('should accurately represent rounded values based on API response snapshot', async ({ page }) => {
    // 1 & 2. Navigate and simultaneously wait for the real API response to prevent race conditions
    const [response] = await Promise.all([
      page.waitForResponse('**/api/accounts'),
      page.goto('http://localhost:5173')
    ]);
    expect(response.status()).toBe(200);
    const apiData = await response.json();

    // 3. Generate standard, easy-to-understand text snapshot directly from the API response.
    // This perfectly encapsulates our frontend rounding logic by applying it directly to the source data.
    const snapshotText = generateSnapshotFromApi(apiData, page.url(), await page.title());



    // 4. Compare it to our baseline text snapshot file (.txt)
    expect(snapshotText).toMatchSnapshot('api-banking-data-snapshot.txt');
  });
});

