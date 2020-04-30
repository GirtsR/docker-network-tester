const Selenium = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const seleniumBuilder = new Selenium.Builder();
seleniumBuilder.setChromeOptions(buildChromeOptions());
seleniumBuilder.usingServer('http://localhost:4444/wd/hub');
seleniumBuilder.forBrowser('chrome');

const driver = seleniumBuilder.build();

driver.get('http://test.webrtc.org')
// .then(_ => driver.findElement(By.id('startButton')).click())
.then(_ => driver.wait(until.titleIs('webdriver - Google meklēšana'), 5000))
// .then(_ => driver.quit());

function buildChromeOptions() {
  const chromeOptions = new chrome.Options();
  chromeOptions.addArguments('--use-fake-ui-for-media-stream');
  chromeOptions.addArguments('--use-fake-device-for-media-stream');
  chromeOptions.addArguments('--enable-gpu-rasterization');
  chromeOptions.addArguments('--allow-file-access');
  chromeOptions.addArguments('--disable-web-security');
  chromeOptions.addArguments('--allow-running-insecure-content');
  chromeOptions.addArguments('--allow-insecure-localhost');

  return chromeOptions;
}