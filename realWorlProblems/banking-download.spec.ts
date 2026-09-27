import { test, expect } from '@playwright/test';
import fs from 'fs';
const pdfParse = require('pdf-parse');

test.describe('Banking Table Download/Print Functionality', () => {

  test('should generate and verify PDF text via CDP', async ({ page }, testInfo) => {
    // CDP allows us to generate a real text-searchable PDF under the hood without the page.pdf() API
    const isChromiumBased = ['chromium', 'edge', ''].includes(testInfo.project.name);
    test.skip(!isChromiumBased, 'CDP PDF generation is only supported in Chromium-based browsers');

    await page.goto('http://localhost:5173');
    await page.waitForSelector('.banking-table');

    const pdfPath = testInfo.outputPath('banking-overview.pdf');
    let pdfGenerated = false;

    // 1. Set up CDP session
    const client = await page.context().newCDPSession(page);

    // 2. Expose function to trigger CDP printToPDF with EXACT A4 dimensions
    await page.exposeFunction('triggerCDPPrint', async () => {
      // Emulate print media and force light mode right before printing to match manual print preview
      await page.emulateMedia({ media: 'print' });

      // Force a tiny wait to let CSS apply
      await new Promise(r => setTimeout(r, 100));

      const { data } = await client.send('Page.printToPDF', {
        printBackground: true,
        paperWidth: 8.27,  // A4 width in inches
        paperHeight: 11.69 // A4 height in inches
      });

      await page.emulateMedia({ media: 'screen', colorScheme: 'no-preference' }); // Revert

      fs.writeFileSync(pdfPath, Buffer.from(data, 'base64'));
      pdfGenerated = true;
    });

    // 4. Mock window.print to trigger our CDP function instead of opening the native OS dialog
    // (Playwright cannot interact with the native OS print dialog, this is the official workaround)
    await page.evaluate(() => {
      window.print = () => {
        window['triggerCDPPrint']();
      };
    });

    // 4. Click the Save PDF button
    const printButton = page.getByRole('button', { name: 'Save PDF' });
    await expect(printButton).toBeVisible();
    await printButton.click();

    // 5. Wait for the CDP PDF to be written to disk
    await expect.poll(() => pdfGenerated).toBe(true);

    // 6. Verify the PDF downloaded successfully
    expect(fs.existsSync(pdfPath)).toBe(true);
    const stats = fs.statSync(pdfPath);
    expect(stats.size).toBeGreaterThan(0);

    // 7. Parse and assert the exact text functionally!
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);

    const text = data.text;
    expect(text).toContain('Global Banking Overview');
    expect(text).toContain('ENTITY NAME');
    expect(text).toContain('ENTITY TYPE');
    expect(text).toContain('TOTAL AMOUNT');
  });
});
