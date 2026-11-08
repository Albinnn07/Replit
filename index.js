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
        // പോപ്പ്-അപ്പ് വരാൻ കൂടുതൽ സമയം നൽകുന്നു
        await delay(25000); 

        // --- പോപ്പ്-അപ്പ് ക്ലോസ് ചെയ്യാനുള്ള കോഡ് ---
        console.log("Checking for 'Keep using Replit?' popup...");
        try {
            // നിങ്ങൾ നൽകിയ XPath ഉപയോഗിച്ച് X ബട്ടൺ കണ്ടെത്തുന്നു
            const xpath = "/html/body/div[9]/div/div/div/div[2]/section/button";
            const clicked = await page.evaluate((xp) => {
                const result = document.evaluate(xp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                const btn = result.singleNodeValue;
                if (btn) {
                    btn.click();
                    return true;
                }
                return false;
            }, xpath);

            if (clicked) {
                console.log("Popup closed successfully via XPath!");
                await delay(3000); // പോപ്പ്-അപ്പ് മാറാൻ കാത്തിരിക്കുന്നു
            } else {
                console.log("No popup found, continuing...");
            }
        } catch (e) {
            console.log("Error handling popup:", e.message);
        }
        // ------------------------------------------

        console.log("Locating the shell area...");
        // ഇപ്പോൾ ടെർമിനൽ കാണാൻ കഴിയണം
        await delay(2000);
        
        // Replit-ന്റെ ടെർമിനൽ canvas ഉപയോഗിച്ചാണ് നിർമ്മിച്ചിരിക്കുന്നത്
        const canvasElements = await page.$$('canvas');

        if (canvasElements.length > 0) {
            console.log(`Found ${canvasElements.length} canvas elements. Clicking the last one...`);
            await canvasElements[canvasElements.length - 1].click();
            await delay(2000);
        } else {
            console.log("Canvas not found. Clicking center of screen...");
            await page.mouse.click(960, 540);
            await delay(2000);
        }

        console.log("Typing command...");
        await page.keyboard.type('./start.sh', { delay: 150 }); 
        await delay(1000);
        await page.keyboard.press('Enter');
        
        console.log("Command './start.sh' typed and Enter pressed!");
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
