const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting screenshot capture...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Set viewport to mobile-like resolution for the best look
  await page.setViewport({ width: 400, height: 800 });

  const baseUrl = 'https://scrambl-8c67d.web.app';

  // 1. Home Screen
  console.log('Taking Home screen...');
  await page.goto(baseUrl, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000)); // let animations settle
  await page.screenshot({ path: 'screenshot_1_home.png' });

  // 2. Map Screen
  console.log('Taking Map screen...');
  await page.goto(`${baseUrl}/countries`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'screenshot_2_map.png' });

  // 3. Time Attack Screen
  console.log('Taking Time Attack screen...');
  await page.goto(`${baseUrl}/time-attack`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'screenshot_3_time_attack.png' });
  
  // Start Time Attack and capture gameplay
  await page.click('button.btn-primary'); // Start button
  await new Promise(r => setTimeout(r, 2000)); // Wait for countdown to finish and game to start
  await page.screenshot({ path: 'screenshot_4_gameplay.png' });

  // 4. Daily Challenge Screen
  console.log('Taking Daily screen...');
  await page.goto(`${baseUrl}/daily`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'screenshot_5_daily.png' });

  await browser.close();
  console.log('All screenshots captured successfully!');
})();
