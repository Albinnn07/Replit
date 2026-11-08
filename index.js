const puppeteer = require('puppeteer');

const REPLIT_URL = "https://replit.com/join#t=kgsziuiwjkvqbls-albin312";
const COOKIE_VALUE = "eyJhbGciOiJSUzI1NiIsImtpZCI6Im45NlJoQSJ9.eyJpc3MiOiJodHRwczovL3Nlc3Npb24uZmlyZWJhc2UuZ29vZ2xlLmNvbS9yZXBsaXQtd2ViIiwibmFtZSI6Ik1pbmVjcmFmdCBTZXJ2ZXIiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jTE8wQnhOME1qd21LbE10WEkzYmxPZ0I2Vk12bWtRalBnM3JldmpobmJ6UmJ4R0N3XHUwMDNkczk2LWMiLCJyb2xlcyI6W10sInJlcGxpdF91c2VyX2lkIjo2NzM5NDQ0MywiaW50ZXJhY3RpdmVBdXRoIjp0cnVlLCJhdWQiOiJyZXBsaXQtd2ViIiwiYXV0aF90aW1lIjoxNzkzOTgyNjE5LCJ1c2VyX2lkIjoiYThVeEtNV1RXb08wUmdzYUFIMFZFnEVueDU4MyIsInN1YiI6ImE4VXhLTVdUV29PMFJnc2FBSDBWRmhFbng1ODMiLCJpYXQiOjE3OTM5ODI2MTksImV4cCI6MTc5NTE5MjIxOSwiZW1haWwiOiJnYW1lcGxhbmV0NzczQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7Imdvb2dsZS5jb20iOlsiMTA4NTI3MzQ5NTg4MjAyNjA0NjcyIl0sImVtYWlsIjpbImdhbWVwbGFuZXQ3NzNAZ21haWwuY29tIl19LCJzaWduXinXinByb3ZpZGVyIjoiY3VzdG9tIn19.TNDKIgEC15x-Ytyvy7c2IHA799FlMz8Dsv6D10pam26UR8eoahtB0v8QZFGGUt7lw-QLS1TLQyiQ2tSk2djYgQ8A8d0uehtE2UuvDOJ9Gsq0xeO9-NIijFM8DPDVeje68A_62tRvC0cFnJlJPR1q4kvu0V3wc0hzT9ADtniDbl1SGyDtd2PnqLGr6F0tixZnd03ydSZ8kD7kjyNvd9wQ5Pwo7oD3pyPRvYNY8dDbt9JB4qT6B3sihWIo6Kx0lHDML1BAua0YtPRdHjooTzXw0jOXE-n92x-oa32xSNf4lixdTdH0n_91qXxXO_4FhrTjtgG18w9Z_T83EbYZnQzkqA";

// Helper function for delay (replaces deprecated page.waitForTimeout)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runBot() {
    console.log("Launching browser with Puppeteer...");
    
    // Render-ൽ ബ്രൗസർ കണ്ടെത്താൻ executablePath നിർബന്ധമായും നൽകുക
    // puppeteer.executablePath() ഉപയോഗിക്കുന്നത് സുരക്ഷിതമാണ്
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: puppeteer.executablePath(), // ഇത് പ്രധാനം!
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--single-process' // Render-ൽ മെമ്മറി കുറയ്ക്കാൻ
        ]
    });

    const page = await browser.newPage();

    // Replit-ലേക്ക് കുക്കി സെറ്റ് ചെയ്യുന്നു
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
        // ഷെൽ ഫോക്കസ് ചെയ്യാൻ ആദ്യം ക്ലിക്ക് ചെയ്യേണ്ടതുണ്ട്
        // Replit-ൽ ഷെൽ എപ്പോഴും ഫോക്കസിൽ ആയിരിക്കണമെന്നില്ല
        try {
            // ഷെൽ ഏരിയ കണ്ടെത്താൻ ശ്രമിക്കുക (optional, but helps)
            const shellSelector = 'div[data-testid="shell"]';
            const shell = await page.$(shellSelector);
            if (shell) {
                await shell.click();
                console.log("Clicked on shell area");
            } else {
                console.log("Shell selector not found, typing directly...");
            }
        } catch (e) {
            console.log("Could not click shell, typing directly...");
        }
        
        await delay(2000); // Small delay after click
        await page.keyboard.type('./start.sh');
        await page.keyboard.press('Enter');
        console.log("Command './start.sh' executed successfully!");

        // Infinite loop to keep alive
        while (true) {
            await delay(30000);
            const title = await page.title();
            console.log(`Bot is alive. Current page title: ${title}`);
        }

    } catch (error) {
        console.error("An error occurred:", error);
        await browser.close();
        console.log("Restarting bot due to error...");
        // Restart after a delay
        setTimeout(runBot, 10000);
    }
}

runBot();
