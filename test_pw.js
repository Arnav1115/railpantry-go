import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  console.log("Navigating to local preview server...");
  await page.goto('http://localhost:4173');
  await page.waitForTimeout(3000);
  console.log("Navigation complete. Checking /admin...");
  await page.goto('http://localhost:4173/admin');
  await page.waitForTimeout(3000);
  
  await browser.close();
})();
