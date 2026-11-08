const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const http = require('http');

const REPLIT_URL = "https://replit.com/join#t=kgsziuiwjkvqbls-albin312";
const COOKIE_VALUE = "eyJhbGciOiJSUzI1NiIsImtpZCI6Im45NlJoQSJ9.eyJpc3MiOiJodHRwczovL3Nlc3Npb24uZmlyZWJhc2UuZ29vZ2xlLmNvbS9yZXBsaXQtd2ViIiwibmFtZSI6Ik1pbmVjcmFmdCBTZXJ2ZXIiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jTE8wQnhOME1qd21LbE10WEkzYmxPZ0I2Vk12bWtRalBnM3JldmpobmJ6UmJ4R0N3XHUwMDNkczk2LWMiLCJyb2xlcyI6W10sInJlcGxpdF91c2VyX2lkIjo2NzM5NDQ0MywiaW50ZXJhY3RpdmVBdXRoIjp0cnVlLCJhdWQiOiJyZXBsaXQtd2ViIiwiYXV0aF90aW1lIjoxNzkzOTgyNjE5LCJ1c2VyX2lkIjoiYThVeEtNV1RXb08wUmdzYUFIMFZFnEVueDU4MyIsInN1YiI6ImE4VXhLTVdUV29PMFJnc2FBSDBWRmhFbng1ODMiLCJpYXQiOjE3OTM5ODI2MTksImV4cCI6MTc5NTE5MjIxOSwiZW1haWwiOiJnYW1lcGxhbmV0NzczQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7Imdvb2dsZS5jb20iOlsiMTA4NTI3MzQ5NTg4MjAyNjA0NjcyIl0sImVtYWlsIjpbImdhbWVwbGFuZXQ3NzNAZ21haWwuY29tIl19LCJzaWduXinXinByb3ZpZGVyIjoiY3VzdG9tIn19.TNDKIgEC15x-Ytyvy7c2IHA799FlMz8Dsv6D10pam26UR8eoahtB0v8QZFGGUt7lw-QLS1TLQyiQ2tSk2djYgQ8A8d0uehtE2UuvDOJ9Gsq0xeO9-NIijFM8DPDVeje68A_62tRvC0cFnJlJPR1q4kvu0V3wc0hzT9ADtniDbl1SGyDtd2PnqLGr6F0tixZnd03ydSZ8kD7kjyNvd9wQ5Pwo7oD3pyPRvYNY8dDbt9JB4qT6B3sihWIo6Kx0lHDML1BAua0YtPRdHjooTzXw0jOXE-n92x-oa32xSNf4lixdTdH0n_91qXxXO_4FhrTjtgG18w9Z_T83EbYZnQzkqA";

const CACHE_DIR = path.join(__dirname, 'node_modules', '.puppeteer-cache');

const PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running!\n');
}).listen(PORT, () => {
    console.log(`Dummy server listening on port ${PORT}`);
});

function findChromeExecutable() {
    const chromeBase = path.join(CACHE_DIR, 'chrome');
    if (fs.existsSync(chromeBase)) {
        const versions = fs.readdirSync(chromeBase).filter(v => v.startsWith('linux-'));
        versions.sort().reverse();
        for (const version of versions) {
            const execPath = path.join(chromeBase, version, 'chrome-linux64', 'chrome');
            if (fs.existsSync(execPath)) return execPath;
        }
    }
    return null;
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runBot() {
    console.log("Launching browser with Puppeteer...");
    const executablePath = findChromeExecutable();
    if (!executablePath) {
        console.error("Chrome executable not found!");
        process.exit(1);
    }

    const browser = await puppeteer.launch({
        headless: true,
        executablePath: executablePath,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--single-process'
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    await page.setCookie({
        name: 'connect.sid',
        value: COOKIE_VALUE,
        domain: '.replit.com',
        path: '/',
        httpOnly: true,
        secure: true
    });

    try {
        console.log("Opening Replit project...");
        await page.goto(REPLIT_URL, { waitUntil: 'networkidle2', timeout: 60000 });

        console.log("Waiting for page to fully load...");
        await delay(25000); // 25 സെക്കൻഡ് കാത്തിരിക്കുന്നു

        // --- പോപ്പ്-അപ്പ് ക്ലോസ് ചെയ്യാനുള്ള കോഡ് (കൂടുതൽ മാർഗങ്ങൾ) ---
        console.log("Checking for 'Keep using Replit?' popup...");
        let popupClosed = false;
        try {
            // 1. XPath ഉപയോഗിച്ച്
            const xpath = "/html/body/div[9]/div/div/div/div[2]/section/button";
            popupClosed = await page.evaluate((xp) => {
                const result = document.evaluate(xp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                const btn = result.singleNodeValue;
                if (btn) { btn.click(); return true; }
                return false;
            }, xpath);

            // 2. "Keep using Replit" എന്ന ടെക്സ്റ്റ് ഉള്ള എലിമെന്റ് കണ്ടെത്തി ക്ലോസ് ചെയ്യുക
            if (!popupClosed) {
                popupClosed = await page.evaluate(() => {
                    const elements = Array.from(document.querySelectorAll('div, span, h1, h2, h3, p'));
                    const popupTitle = elements.find(el => el.innerText && el.innerText.includes('Keep using Replit'));
                    if (popupTitle) {
                        const closeBtn = popupTitle.closest('div[role="dialog"]')?.querySelector('button') || document.querySelector('button[aria-label="Close"]');
                        if (closeBtn) { closeBtn.click(); return true; }
                    }
                    return false;
                });
            }

            // 3. "Upgrade to Core" എന്ന ബട്ടൺ ഉണ്ടെങ്കിൽ, അതിനടുത്തുള്ള X ബട്ടൺ ക്ലിക്ക് ചെയ്യുക
            if (!popupClosed) {
                popupClosed = await page.evaluate(() => {
                    const btns = Array.from(document.querySelectorAll('button'));
                    const upgradeBtn = btns.find(b => b.innerText && b.innerText.includes('Upgrade to Core'));
                    if (upgradeBtn) {
                        const dialog = upgradeBtn.closest('div[role="dialog"]') || upgradeBtn.closest('div');
                        if (dialog) {
                            const closeBtn = dialog.querySelector('button[aria-label="Close"]') || dialog.querySelector('svg')?.closest('button');
                            if (closeBtn) { closeBtn.click(); return true; }
                        }
                    }
                    return false;
                });
            }

            // 4. സ്ക്രീനിന്റെ വലതുവശത്ത് മുകളിൽ ക്ലിക്ക് ചെയ്യുക (X ബട്ടൺ സാധാരണയായി അവിടെയാണ്)
            if (!popupClosed) {
                console.log("Trying to click top-right corner where X button usually is...");
                await page.mouse.click(1800, 300);
                popupClosed = true;
            }

            if (popupClosed) {
                console.log("Popup closed successfully!");
                await delay(3000);
            } else {
                console.log("No popup found, continuing...");
            }
        } catch (e) {
            console.log("Error handling popup:", e.message);
        }
        // ------------------------------------------

        console.log("Locating the terminal input area...");
        
        let terminalFocused = false;
        let attempts = 0;
        const maxAttempts = 15; // 15 തവണ വരെ ശ്രമിക്കുക

        while (!terminalFocused && attempts < maxAttempts) {
            attempts++;
            console.log(`Attempt ${attempts} to locate terminal...`);
            
            try {
                // 1. textarea.xterm-helper-textarea
                let textarea = await page.$('textarea.xterm-helper-textarea');
                if (textarea) {
                    await textarea.click();
                    console.log("Clicked on terminal textarea.");
                    terminalFocused = true;
                    break;
                }

                // 2. canvas
                let canvasElements = await page.$$('canvas');
                if (canvasElements.length > 0) {
                    await canvasElements[canvasElements.length - 1].click();
                    console.log("Clicked on canvas element.");
                    terminalFocused = true;
                    break;
                }

                // 3. ഏതെങ്കിലും textarea
                textarea = await page.$('textarea');
                if (textarea) {
                    await textarea.click();
                    console.log("Clicked on generic textarea.");
                    terminalFocused = true;
                    break;
                }

                // 4. സ്ക്രീനിന്റെ നടുവിൽ ക്ലിക്ക് ചെയ്യുക
                await page.mouse.click(960, 540);
                console.log("Clicked center of screen.");
                // ഇവിടെ ഫോക്കസ് ലഭിച്ചോ എന്ന് പരിശോധിക്കാൻ ഒരു ചെറിയ ടെസ്റ്റ്
                const activeElement = await page.evaluate(() => document.activeElement.tagName);
                if (activeElement === 'TEXTAREA' || activeElement === 'CANVAS' || activeElement === 'BODY') {
                    terminalFocused = true;
                    console.log("Focus seems to be on:", activeElement);
                    break;
                }

            } catch (e) {
                console.log("Error locating terminal:", e.message);
            }

            if (!terminalFocused) {
                console.log("Terminal not found yet. Waiting 3 seconds...");
                await delay(3000);
            }
        }

        if (!terminalFocused) {
            console.log("Could not find terminal after multiple attempts. Taking screenshot...");
            await page.screenshot({ path: '/opt/render/project/src/debug-screenshot.png' });
            console.log("Debug screenshot saved as debug-screenshot.png");
            await page.mouse.click(960, 540);
        }

        await delay(2000);

        console.log("Typing command...");
        await page.keyboard.type('./start.sh', { delay: 150 }); 
        await delay(1000);
        await page.keyboard.press('Enter');
        
        console.log("Command './start.sh' typed and Enter pressed!");
        
        // സ്ക്രീൻഷോട്ട് എടുക്കുന്നു
        console.log("Taking screenshot to verify...");
        await page.screenshot({ path: '/opt/render/project/src/terminal-check.png' });
        console.log("Screenshot saved as terminal-check.png");
        
        console.log("Bot is now running in the background...");

        while (true) {
            await delay(30000);
            const title = await page.title();
            console.log(`Bot is alive. Page title: ${title}`);
        }

    } catch (error) {
        console.error("An error occurred:", error);
        await browser.close();
        console.log("Restarting bot due to error...");
        setTimeout(runBot, 10000);
    }
}

runBot();
