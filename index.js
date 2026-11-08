const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const REPLIT_URL = "https://replit.com/join#t=kgsziuiwjkvqbls-albin312";
const COOKIE_VALUE = "eyJhbGciOiJSUzI1NiIsImtpZCI6Im45NlJoQSJ9.eyJpc3MiOiJodHRwczovL3Nlc3Npb24uZmlyZWJhc2UuZ29vZ2xlLmNvbS9yZXBsaXQtd2ViIiwibmFtZSI6Ik1pbmVjcmFmdCBTZXJ2ZXIiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jTE8wQnhOME1qd21LbE10WEkzYmxPZ0I2Vk12bWtRalBnM3JldmpobmJ6UmJ4R0N3XHUwMDNkczk2LWMiLCJyb2xlcyI6W10sInJlcGxpdF91c2VyX2lkIjo2NzM5NDQ0MywiaW50ZXJhY3RpdmVBdXRoIjp0cnVlLCJhdWQiOiJyZXBsaXQtd2ViIiwiYXV0aF90aW1lIjoxNzkzOTgyNjE5LCJ1c2VyX2lkIjoiYThVeEtNV1RXb08wUmdzYUFIMFZFnEVueDU4MyIsInN1YiI6ImE4VXhLTVdUV29PMFJnc2FBSDBWRmhFbng1ODMiLCJpYXQiOjE3OTM5ODI2MTksImV4cCI6MTc5NTE5MjIxOSwiZW1haWwiOiJnYW1lcGxhbmV0NzczQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7Imdvb2dsZS5jb20iOlsiMTA4NTI3MzQ5NTg4MjAyNjA0NjcyIl0sImVtYWlsIjpbImdhbWVwbGFuZXQ3NzNAZ21haWwuY29tIl19LCJzaWduXinXinByb3ZpZGVyIjoiY3VzdG9tIn19.TNDKIgEC15x-Ytyvy7c2IHA799FlMz8Dsv6D10pam26UR8eoahtB0v8QZFGGUt7lw-QLS1TLQyiQ2tSk2djYgQ8A8d0uehtE2UuvDOJ9Gsq0xeO9-NIijFM8DPDVeje68A_62tRvC0cFnJlJPR1q4kvu0V3wc0hzT9ADtniDbl1SGyDtd2PnqLGr6F0tixZnd03ydSZ8kD7kjyNvd9wQ5Pwo7oD3pyPRvYNY8dDbt9JB4qT6B3sihWIo6Kx0lHDML1BAua0YtPRdHjooTzXw0jOXE-n92x-oa32xSNf4lixdTdH0n_91qXxXO_4FhrTjtgG18w9Z_T83EbYZnQzkqA";

const CACHE_DIR = path.join(__dirname, 'node_modules', '.puppeteer-cache');

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
    
    // ബ്രൗസർ വിൻഡോ സൈസ് സെറ്റ് ചെയ്യുന്നു (ടെർമിനൽ ശരിയായി കാണാൻ)
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
        // പേജ് ലോഡ് ആകാൻ കൂടുതൽ സമയം നൽകുന്നു
        await delay(20000);

        // നിങ്ങൾ നൽകിയ XPath
        const shellXPath = '/html/body/div[1]/div/div[4]/div/div/div/div/div[2]/div/main/div[5]/div[2]/div[2]/div[2]/div/div/div[2]/div/div/div[2]/div[1]/canvas[1]';
        
        console.log("Trying to locate the shell using XPath...");
        
        // XPath ഉപയോഗിച്ച് എലിമെന്റ് കണ്ടെത്തുന്നു
        const elements = await page.$x(shellXPath);

        if (elements.length > 0) {
            console.log("Shell found! Clicking on it...");
            await elements[0].click();
            await delay(2000); // ക്ലിക്ക് ചെയ്തതിന് ശേഷം അൽപ്പം കാത്തിരിക്കുന്നു
        } else {
            console.log("XPath failed. Trying fallback: clicking center of the screen...");
            // XPath പരാജയപ്പെട്ടാൽ, സ്ക്രീനിന്റെ നടുവിൽ ക്ലിക്ക് ചെയ്യാൻ ശ്രമിക്കുന്നു
            await page.mouse.click(960, 540);
            await delay(2000);
        }

        console.log("Typing command...");
        // ഫോക്കസ് ലഭിച്ചെന്ന് ഉറപ്പാക്കാൻ വീണ്ടും ചെറുതായി ക്ലിക്ക് ചെയ്യുന്നു
        await page.mouse.click(960, 540);
        await delay(1000);

        // കമാൻഡ് ടൈപ്പ് ചെയ്യുന്നു
        await page.keyboard.type('./start.sh', { delay: 150 }); 
        await delay(1000);
        await page.keyboard.press('Enter');
        
        console.log("Command './start.sh' typed and Enter pressed!");
        console.log("Bot is now running in the background...");

        // ബോട്ട് സജീവമായി നിലനിർത്തുക
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
