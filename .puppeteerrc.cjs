const { join } = require('path');

/**
 * @type {import('puppeteer').Configuration}
 */
module.exports = {
  // സമ്പൂർണ്ണ പാത ഉറപ്പാക്കാൻ __dirname ഉപയോഗിക്കുന്നു
  cacheDirectory: join(__dirname, '.puppeteer-cache'),
};
