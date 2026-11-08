const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const http = require('http');

const REPLIT_URL = "https://replit.com/join#t=kgsziuiwjkvqbls-albin312";
const COOKIE_VALUE = "eyJhbGciOiJSUzI1NiIsImtpZCI6Im45NlJoQSJ9.eyJpc3MiOiJodHRwczovL3Nlc3Npb24uZmlyZWJhc2UuZ29vZ2xlLmNvbS9yZXBsaXQtd2ViIiwibmFtZSI6Ik1pbmVjcmFmdCBTZXJ2ZXIiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jTE8wQnhOME1qd21LbE10WEkzYmxPZ0I2Vk12bWtRalBnM3JldmpobmJ6UmJ4R0N3XHUwMDNkczk2LWMiLCJyb2xlcyI6W10sInJlcGxpdF91c2VyX2lkIjo2NzM5NDQ0MywiaW50ZXJhY3RpdmVBdXRoIjp0cnVlLCJhdWQiOiJyZXBsaXQtd2ViIiwiYXV0aF90aW1lIjoxNzkzOTgyNjE5LCJ1c2VyX2lkIjoiYThVeEtNV1RXb08wUmdzYUFIMFZFnEVueDU4MyIsInN1YiI6ImE4VXhLTVdUV29PMFJnc2FBSDBWRmhFbng1ODMiLCJpYXQiOjE3OTM5ODI2MTksImV4cCI6MTc5NTE5MjIxOSwiZW1haWwiOiJnYW1lcGxhbmV0NzczQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7Imdvb2dsZS5jb20iOlsiMTA4NTI3MzQ5NTg4MjAyNjA0NjcyIl0sImVtYWlsIjpbImdhbWVwbGFuZXQ3NzNAZ21haWwuY29tIl19LCJzaWduXinXinByb3ZpZGVyIjoiY3VzdG9tIn19.TNDKIgEC15x-Ytyvy7c2IHA799FlMz8Dsv6D10pam26UR8eoahtB0v8QZFGGUt7lw-QLS1TLQyiQ2tSk2djYgQ8A8d0uehtE2UuvDOJ9Gsq0xeO9-NIijFM8DPDVeje68A_62tRvC0cFnJlJPR1q4kvu0V3wc0hzT9ADtniDbl1SGyDtd2PnqLGr6F0tixZnd03ydSZ8kD7kjyNvd9wQ5Pwo7oD3pyPRvYNY8dDbt9JB4qT6B3sihWIo6Kx0lHDML1BAua0YtPRdHjooTzXw0jOXE-n92x-oa32xSNf4lixdTdH0n_91qXxXO_4FhrTjtgG18w9Z_T83EbYZnQzkqA";

const CACHE_DIR = path.join(__dirname, 'node_modules', '.puppeteer-cache');
const SCREENSHOT_PATH = '/opt/render/project/src/terminal-check.png';

// ---- HTTP സെർവർ ----
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
    // സ്ക്രീൻഷോട്ട് കാണാൻ
    if (req.url === '/screenshot' || req.url === '/terminal-check.png') {
        if (fs.existsSync(SCREENSHOT_PATH)) {
            res.writeHead(200, { 'Content-Type': 'image/png' });
            fs.createReadStream(SCREENSHOT_PATH).pipe(res);
            return;
        }
        res.writeHead(404);
        res.end('Screenshot not found yet. Wait for the bot to take it.');
        return;
    }
    // ഡീഫോൾട്ട്
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running!\nVisit /screenshot to view the last screenshot.\n');
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

// ---- ഹ്യൂമൻ-ലൈക്ക് ഫംഗ്ഷനുകൾ ----
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function randomDelay(min = 1000, max = 3000) {
    const ms = randomInt(min, max);
    console.log(`Waiting ${ms} ms...`);
    await new Promise(r => setTimeout(r, ms));
}

async function humanLikeMouseMove(page, targetX, targetY, steps = 20) {
    const startX = randomInt(100, 500);
    const startY = randomInt(100, 500);
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = Math.round(startX + (targetX - startX) * t + Math.sin(t * Math.PI) * randomInt(-10, 10));
        const y = Math.round(startY + (targetY - startY) * t + Math.sin(t * Math.PI) * randomInt(-10, 10));
        await page.mouse.move(x, y);
        await new Promise(r => setTimeout(r, randomInt(5, 20)));
    }
}

async function humanLikeType(page, text) {
    for (const char of text) {
        await page.keyboard.type(char);
        await new Promise(r => setTimeout(r, randomInt(50, 200)));
        if (Math.random() < 0.1) {
            await new Promise(r => setTimeout(r, randomInt(200, 500)));
        }
    }
}

async function takeScreenshot(page, label = '') {
    try {
        await page.screenshot({ path: SCREENSHOT_PATH });
        console.log(`Screenshot saved (${label}): ${SCREENSHOT_PATH}`);
    } catch (e) {
        console.log('Screenshot failed:', e.message);
    }
}

// ---- മെയിൻ ----
async function runBot() {
    console.log("Launching browser with Puppeteer...");
    const executablePath = findChromeExecutable();
    if (!executablePath) {
        console.error("Chrome executable not found!");
        process.exit(1);
    }

    const browser = await puppeteer.launch({
        headless: true,
        executablePath,
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
        await randomDelay(20000, 30000);

        // ---- പോപ്പ്-അപ്പ് ക്ലോസ് ----
        console.log("Checking for popup...");
        let popupClosed = false;
        try {
            // 1. XPath
            const xpath = "/html/body/div[9]/div/div/div/div[2]/section/button";
            popupClosed = await page.evaluate((xp) => {
                const r = document.evaluate(xp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                const btn = r.singleNodeValue;
                if (btn) { btn.click(); return true; }
                return false;
            }, xpath);

            // 2. "Keep using Replit" എന്ന ടെക്സ്റ്റ്
            if (!popupClosed) {
                popupClosed = await page.evaluate(() => {
                    const els = Array.from(document.querySelectorAll('div, span, h1, h2, h3, p'));
                    const title = els.find(el => el.innerText && el.innerText.includes('Keep using Replit'));
                    if (title) {
                        const closeBtn = title.closest('div[role="dialog"]')?.querySelector('button')
                                       || document.querySelector('button[aria-label="Close"]');
                        if (closeBtn) { closeBtn.click(); return true; }
                    }
                    return false;
                });
            }

            // 3. "Upgrade to Core" എന്ന ബട്ടൺ
            if (!popupClosed) {
                popupClosed = await page.evaluate(() => {
                    const btns = Array.from(document.querySelectorAll('button'));
                    const upgrade = btns.find(b => b.innerText && b.innerText.includes('Upgrade to Core'));
                    if (upgrade) {
                        const dialog = upgrade.closest('div[role="dialog"]') || upgrade.closest('div');
                        if (dialog) {
                            const closeBtn = dialog.querySelector('button[aria-label="Close"]')
                                           || dialog.querySelector('svg')?.closest('button');
                            if (closeBtn) { closeBtn.click(); return true; }
                        }
                    }
                    return false;
                });
            }

            // 4. വലതുവശത്ത് മുകളിൽ ക്ലിക്ക്
            if (!popupClosed) {
                console.log("Trying to click top-right corner...");
                await humanLikeMouseMove(page, 1800, 300, 15);
                await page.mouse.click(1800, 300);
                popupClosed = true;
            }

            if (popupClosed) {
                console.log("Popup handled.");
                await randomDelay(2000, 4000);
            } else {
                console.log("No popup found, continuing...");
            }
        } catch (e) {
            console.log("Popup error:", e.message);
        }

        // ---- പോപ്പ്-അപ്പ് മാറിയെന്ന് ഉറപ്പാക്കാൻ സ്ക്രീൻഷോട്ട് ----
        await takeScreenshot(page, 'after-popup');

        // ---- ടെർമിനൽ കണ്ടെത്തൽ ----
        console.log("Locating the terminal input area...");

        let terminalFocused = false;
        let attempts = 0;
        const maxAttempts = 20;

        while (!terminalFocused && attempts < maxAttempts) {
            attempts++;
            console.log(`Attempt ${attempts} to locate terminal...`);

            try {
                // 1. textarea.xterm-helper-textarea
                const textarea = await page.$('textarea.xterm-helper-textarea');
                if (textarea) {
                    const box = await textarea.boundingBox();
                    if (box) {
                        await humanLikeMouseMove(page, box.x + box.width / 2, box.y + box.height / 2);
                        await textarea.click();
                    } else {
                        await textarea.click();
                    }
                    console.log("Clicked on terminal textarea.");
                    terminalFocused = true;
                    break;
                }

                // 2. ഏതെങ്കിലും canvas
                const canvases = await page.$$('canvas');
                if (canvases.length > 0) {
                    const canvas = canvases[canvases.length - 1];
                    const box = await canvas.boundingBox();
                    if (box) {
                        await humanLikeMouseMove(page, box.x + box.width / 2, box.y + box.height / 2);
                        await canvas.click();
                    } else {
                        await canvas.click();
                    }
                    console.log("Clicked on canvas element.");
                    terminalFocused = true;
                    break;
                }

                // 3. സാധാരണ textarea
                const anyTextarea = await page.$('textarea');
                if (anyTextarea) {
                    await anyTextarea.click();
                    console.log("Clicked on generic textarea.");
                    terminalFocused = true;
                    break;
                }

                // 4. സ്ക്രീനിന്റെ നടുവിൽ ക്ലിക്ക്
                await humanLikeMouseMove(page, 960, 540, 10);
                await page.mouse.click(960, 540);
                const active = await page.evaluate(() => document.activeElement.tagName);
                console.log("Clicked center. Focus on:", active);

                if (active === 'TEXTAREA' || active === 'CANVAS') {
                    terminalFocused = true;
                    break;
                }
            } catch (e) {
                console.log("Error locating terminal:", e.message);
            }

            if (!terminalFocused) {
                console.log("Terminal not found yet. Waiting...");
                await randomDelay(2500, 4000);
            }
        }

        // ---- ടെർമിനൽ ലഭിച്ചില്ലെങ്കിൽ സ്ക്രീൻഷോട്ട് എടുക്കുക ----
        if (!terminalFocused) {
            console.log("Terminal not found after attempts. Taking debug screenshot...");
            await takeScreenshot(page, 'terminal-not-found');
        }

        await randomDelay(1000, 2000);

        // ---- കമാൻഡ് ടൈപ്പ് ചെയ്യൽ ----
        console.log("Typing command...");
        await humanLikeType(page, './start.sh');
        await randomDelay(500, 1500);
        await page.keyboard.press('Enter');
        console.log("Command './start.sh' typed and Enter pressed!");

        // ---- കമാൻഡ് കഴിഞ്ഞ് സ്ക്രീൻഷോട്ട് ----
        await randomDelay(2000, 3000);
        await takeScreenshot(page, 'after-command');

        console.log("Bot is now running in the background...");

        while (true) {
            await randomDelay(25000, 35000);
            const title = await page.title();
            console.log(`Bot is alive. Page title: ${title}`);
        }

    } catch (error) {
        console.error("An error occurred:", error);
        await takeScreenshot(page, 'error');
        await browser.close();
        console.log("Restarting bot due to error...");
        setTimeout(runBot, randomInt(5000, 10000));
    }
}

runBot();
