import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log("Navigating to live vercel URL...");
  await page.goto('https://railpantry-go-main-2nand7tcs-ady3.vercel.app/admin', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);
  fs.writeFileSync('vercel_body.html', bodyHTML);
  await page.screenshot({ path: 'vercel_screenshot.png' });
  
  console.log("Saved HTML and screenshot.");
  await browser.close();
})();
