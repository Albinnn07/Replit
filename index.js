const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const REPLIT_URL = "https://replit.com/join#t=kgsziuiwjkvqbls-albin312";
const COOKIE_VALUE = "eyJhbGciOiJSUzI1NiIsImtpZCI6Im45NlJoQSJ9.eyJpc3MiOiJodHRwczovL3Nlc3Npb24uZmlyZWJhc2UuZ29vZ2xlLmNvbS9yZXBsaXQtd2ViIiwibmFtZSI6Ik1pbmVjcmFmdCBTZXJ2ZXIiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jTE8wQnhOME1qd21LbE10WEkzYmxPZ0I2Vk12bWtRalBnM3JldmpobmJ6UmJ4R0N3XHUwMDNkczk2LWMiLCJyb2xlcyI6W10sInJlcGxpdF91c2VyX2lkIjo2NzM5NDQ0MywiaW50ZXJhY3RpdmVBdXRoIjp0cnVlLCJhdWQiOiJyZXBsaXQtd2ViIiwiYXV0aF90aW1lIjoxNzkzOTgyNjE5LCJ1c2VyX2lkIjoiYThVeEtNV1RXb08wUmdzYUFIMFZFnEVueDU4MyIsInN1YiI6ImE4VXhLTVdUV29PMFJnc2FBSDBWRmhFbng1ODMiLCJpYXQiOjE3OTM5ODI2MTksImV4cCI6MTc5NTE5MjIxOSwiZW1haWwiOiJnYW1lcGxhbmV0NzczQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7Imdvb2dsZS5jb20iOlsiMTA4NTI3MzQ5NTg4MjAyNjA0NjcyIl0sImVtYWlsIjpbImdhbWVwbGFuZXQ3NzNAZ21haWwuY29tIl19LCJzaWduXinXinByb3ZpZGVyIjoiY3VzdG9tIn19.TNDKIgEC15x-Ytyvy7c2IHA799FlMz8Dsv6D10pam26UR8eoahtB0v8QZFGGUt7lw-QLS1TLQyiQ2tSk2djYgQ8A8d0uehtE2UuvDOJ9Gsq0xeO9-NIijFM8DPDVeje68A_62tRvC0cFnJlJPR1q4kvu0V3wc0hzT9ADtniDbl1SGyDtd2PnqLGr6F0tixZnd03ydSZ8kD7kjyNvd9wQ5Pwo7oD3pyPRvYNY8dDbt9JB4qT6B3sihWIo6Kx0lHDML1BAua0YtPRdHjooTzXw0jOXE-n92x-oa32xSNf4lixdTdH0n_91qXxXO_4FhrTjtgG18w9Z_T83EbYZnQzkqA";

// പ്രോജക്റ്റിനുള്ളിലെ Puppeteer കാഷെ ഡയറക്ടറി
const CACHE_DIR = process.env.PUPPETEER_CACHE_DIR || path.join(__dirname, '.puppeteer-cache');

// ഇൻസ്റ്റാൾ ചെയ്ത Chrome എക്സിക്യൂട്ടബിൾ കണ്ടെത്തുക
function findChromeExecutable() {
    // 1) എൻവയോൺമെന്റ് വേരിയബിൾ ഉണ്ടെങ്കിൽ അത് ഉപയോഗിക്കുക
    if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
        return process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    // 2) കാഷെ ഡയറക്ടറിയിൽ തിരയുക
    const chromeBase = path.join(CACHE_DIR, 'chrome');
    if (fs.existsSync(chromeBase)) {
        const versions = fs.readdirSync(chromeBase).filter(v => v.startsWith('linux-'));
        // ഏറ്റവും പുതിയ പതിപ്പ് തിരഞ്ഞെടുക്കുക
        versions.sort().reverse();
        for (const version of versions) {
            const execPath = path.join(chromeBase, version, 'chrome-linux64', 'chrome');
            if (fs.existsSync(execPath)) {
                return execPath;
            }
        }
    }

    // 3) Puppeteer-ന്റെ സ്വന്തം പാത്ത് ഫംഗ്ഷൻ ശ്രമിക്കുക
    try {
        const p = puppeteer.executablePath();
        if (p && fs.existsSync(p)) return p;
    } catch (e) {
        // അവഗണിക്കുക
    }

    return null;
}

// Delay helper (page.waitForTimeout പകരം)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runBot() {
    console.log("Launching browser with Puppeteer...");

    const executablePath = findChromeExecutable();
    if (!executablePath) {
        console.error("Chrome executable not found! Checked cache dir:", CACHE_DIR);
        console.error("Ensure build command runs: PUPPETEER_CACHE_DIR=./.puppeteer-cache npm run build");
        process.exit(1);
    }
    console.log("Using Chrome executable:", executablePath);

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

    // Replit കുക്കി സെറ്റ് ചെയ്യുക
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
        await page.goto(REPLIT_URL, { waitUntil: 'networkidle0', timeout: 60000 });

        console.log("Waiting for workspace shell...");
        await delay(15000);

        console.log("Locating shell and typing command...");
        try {
            const shell = await page.$('div[data-testid="shell"]');
            if (shell) {
                await shell.click();
                console.log("Clicked on shell area");
            } else {
                console.log("Shell selector not found, typing directly...");
            }
        } catch (e) {
            console.log("Could not click shell, typing directly...");
        }

        await delay(2000);
        await page.keyboard.type('./start.sh');
        await page.keyboard.press('Enter');
        console.log("Command './start.sh' executed successfully!");

        // ബോട്ട് സജീവമായി നിലനിർത്തുക
        while (true) {
            await delay(30000);
            const title = await page.title();
            console.log(`Bot is alive. Current page title: ${title}`);
        }

    } catch (error) {
        console.error("An error occurred:", error);
        await browser.close();
        console.log("Restarting bot due to error...");
        setTimeout(runBot, 10000);
    }
}

runBot();
