const puppeteer = require('puppeteer');

(async () => {
    try {
        console.log("Launching browser...");
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();

        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log(`PAGE ERROR LOG: ${msg.text()}`);
            } else {
                console.log(`PAGE LOG: ${msg.text()}`);
            }
        });

        page.on('pageerror', error => {
            console.log(`PAGE UNCAUGHT EXCEPTION: ${error.message}`);
        });

        page.on('requestfailed', request => {
            console.log(`REQUEST FAILED: ${request.url()} - ${request.failure()?.errorText}`);
        });

        console.log("Navigating to https://thunderous-faun-3b25bc.netlify.app/ ...");
        await page.goto('https://thunderous-faun-3b25bc.netlify.app/', { waitUntil: 'networkidle0', timeout: 30000 });
        
        const bodyHandle = await page.$('body');
        const bodyInner = await page.evaluate(body => body.innerHTML, bodyHandle);
        console.log("BODY PREVIEW:", bodyInner.substring(0, 500));

        await browser.close();
        console.log("Done.");
    } catch (e) {
        console.error("Script failed:", e);
    }
})();
