const { chromium } = require('playwright');
process.env.PLAYWRIGHT_BROWSERS_PATH = '0'; // ഇത് ചേര്‍ക്കുക

const REPLIT_URL = "https://replit.com/join#t=kgsziuiwjkvqbls-albin312";
const COOKIE_VALUE = "eyJhbGciOiJSUzI1NiIsImtpZCI6Im45NlJoQSJ9.eyJpc3MiOiJodHRwczovL3Nlc3Npb24uZmlyZWJhc2UuZ29vZ2xlLmNvbS9yZXBsaXQtd2ViIiwibmFtZSI6Ik1pbmVjcmFmdCBTZXJ2ZXIiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jTE8wQnhOME1qd21LbE10WEkzYmxPZ0I2Vk12bWtRalBnM3JldmpobmJ6UmJ4R0N3XHUwMDNkczk2LWMiLCJyb2xlcyI6W10sInJlcGxpdF91c2VyX2lkIjo2NzM5NDQ0MywiaW50ZXJhY3RpdmVBdXRoIjp0cnVlLCJhdWQiOiJyZXBsaXQtd2ViIiwiYXV0aF90aW1lIjoxNzkzOTgyNjE5LCJ1c2VyX2lkIjoiYThVeEtNV1RXb08wUmdzYUFIMFZFnEVueDU4MyIsInN1YiI6ImE4VXhLTVdUV29PMFJnc2FBSDBWRmhFbng1ODMiLCJpYXQiOjE3OTM5ODI2MTksImV4cCI6MTc5NTE5MjIxOSwiZW1haWwiOiJnYW1lcGxhbmV0NzczQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7Imdvb2dsZS5jb20iOlsiMTA4NTI3MzQ5NTg4MjAyNjA0NjcyIl0sImVtYWlsIjpbImdhbWVwbGFuZXQ3NzNAZ21haWwuY29tIl19LCJzaWduXinXinByb3ZpZGVyIjoiY3VzdG9tIn19.TNDKIgEC15x-Ytyvy7c2IHA799FlMz8Dsv6D10pam26UR8eoahtB0v8QZFGGUt7lw-QLS1TLQyiQ2tSk2djYgQ8A8d0uehtE2UuvDOJ9Gsq0xeO9-NIijFM8DPDVeje68A_62tRvC0cFnJlJPR1q4kvu0V3wc0hzT9ADtniDbl1SGyDtd2PnqLGr6F0tixZnd03ydSZ8kD7kjyNvd9wQ5Pwo7oD3pyPRvYNY8dDbt9JB4qT6B3sihWIo6Kx0lHDML1BAua0YtPRdHjooTzXw0jOXE-n92x-oa32xSNf4lixdTdH0n_91qXxXO_4FhrTjtgG18w9Z_T83EbYZnQzkqA";

async function runBot() {
    console.log("Launching browser...");
    const browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    // ബാക്കി കോഡുകൾ അതേപടി നിലനിർത്തുക...
    
    const context = await browser.newContext();

    // Replit-ലേക്ക് കുക്കി സെറ്റ് ചെയ്യുന്നു
    await context.addCookies([
        {
            name: 'connect.sid',
            value: COOKIE_VALUE,
            domain: '.replit.com',
            path: '/',
            httpOnly: true,
            secure: true
        }
    ]);

    const page = await context.newPage();

    try {
        console.log("Opening Replit project...");
        await page.goto(REPLIT_URL, { waitUntil: 'networkidle', timeout: 60000 });
        
        // ഷെൽ ലോഡ് ആകാൻ കാത്തിരിക്കുന്നു
        console.log("Waiting for workspace shell...");
        await page.waitForTimeout(15000);

        // ഷെൽ ടെർമിനലിൽ കമാൻഡ് ടൈപ്പ് ചെയ്യുന്നു
        console.log("Locating shell and typing command...");
        // Replit-ന്റെ ഷെൽ ഫോകസ് ചെയ്ത് കമാൻഡ് അടിക്കുന്നു
        await page.keyboard.type('./start.sh');
        await page.keyboard.press('Enter');
        console.log("Command './start.sh' executed successfully!");

        // പ്രൊസസ്സ് നിരീക്ഷിച്ചുകൊണ്ട് ലൂപ്പിൽ തുടരുന്നു
        while (true) {
            await page.waitForTimeout(30000); // ഓരോ 30 സെക്കൻഡിലും കണക്ഷൻ പരിശോധിക്കുന്നു
            
            // പേജ് ക്രാഷ് ആയോ എന്ന് നോക്കാൻ ടൈറ്റിൽ ചെക്ക് ചെയ്യാം അല്ലെങ്കിൽ റീലോഡ് ചെയ്യാം
            const title = await page.title();
            console.log(`Bot is alive. Current page title: ${title}`);
        }

    } catch (error) {
        console.error("An error occurred:", error);
        await browser.close();
        console.log("Restarting bot due to error...");
        setTimeout(runBot, 10000); // 10 സെക്കൻഡിനു ശേഷം വീണ്ടും ശ്രമിക്കും
    }
}

runBot();
