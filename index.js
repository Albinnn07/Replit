// Playwright ബ്രൗസർ node_modules-നുള്ളിൽ കണ്ടെത്താൻ
process.env.PLAYWRIGHT_BROWSERS_PATH = '0';

const { firefox } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

// --- സ്ക്രീൻഷോട്ട് കാണാൻ ഒരു ചെറിയ വെബ് സെർവർ ---
const PORT = process.env.PORT || 10000;
const SCREENSHOT_PATH = path.join(__dirname, 'screenshot.png');

http.createServer((req, res) => {
    if (req.url === '/screenshot') {
        if (fs.existsSync(SCREENSHOT_PATH)) {
            res.writeHead(200, { 'Content-Type': 'image/png' });
            fs.createReadStream(SCREENSHOT_PATH).pipe(res);
            return;
        }
        res.writeHead(404);
        res.end('Screenshot not ready yet. Wait a few seconds.');
        return;
    }
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Headless Firefox is running. Visit /screenshot to see the last capture.\n');
}).listen(PORT, () => console.log(`Server listening on ${PORT}`));

// --- ഹെഡ്‌ലെസ് ഫയർഫോക്സ് ബോട്ട് ---
(async () => {
    console.log('Launching headless Firefox...');
    
    // headless: true എന്നത് പ്രധാനം (VNC സ്ട്രീം ഇല്ല)
    const browser = await firefox.launch({ headless: true });
    const page = await browser.newPage();
    
    // നിങ്ങളുടെ ടാർഗെറ്റ് URL
    const targetUrl = 'https://replit.com/join#t=kgsziuiwjkvqbls-albin312';
    
    console.log(`Navigating to ${targetUrl}`);
    try {
        await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 60000 });
    } catch (e) {
        console.log('Navigation warning:', e.message);
    }
    
    // പേജ് ലോഡ് ആകാൻ കാത്തിരിക്കുക
    await page.waitForTimeout(5000);
    
    // ഇവിടെ നിങ്ങൾക്ക് കൂടുതൽ ക്ലിക്കുകളും ടൈപ്പിംഗും ചേർക്കാം
    // ഉദാഹരണത്തിന്:
    // await page.click('text=Some Button');
    // await page.keyboard.type('./start.sh');
    // await page.keyboard.press('Enter');
    
    // സ്ക്രീൻഷോട്ട് എടുക്കുക
    console.log('Taking screenshot...');
    await page.screenshot({ path: SCREENSHOT_PATH, fullPage: false });
    console.log('Screenshot saved to', SCREENSHOT_PATH);
    
    // ബ്രൗസർ അടയ്ക്കുക (അല്ലെങ്കിൽ തുറന്ന് വെക്കാം)
    await browser.close();
    console.log('Browser closed.');
    
    // സ്ക്രിപ്റ്റ് അവസാനിച്ചാലും സെർവർ പ്രവർത്തിക്കുന്നത് തുടരും
})();
