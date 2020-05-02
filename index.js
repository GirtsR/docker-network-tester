const Selenium = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const DEFAULT_TIMEOUT = 30000;

(async function runTest() {
  let driver = await new Selenium.Builder()
  .setChromeOptions(buildChromeOptions())
  .usingServer('http://localhost:4444/wd/hub')
  .forBrowser('chrome')
  .build();

  await driver.manage().setTimeouts({implicit: DEFAULT_TIMEOUT});

  try {
    await driver.get('https://69def32c.ngrok.io/quickstart/?roomName=test&identity=docker_chrome');
    console.log("Loaded!");
    await driver.wait(Selenium.until.elementLocated(Selenium.By.id('join-room')), DEFAULT_TIMEOUT);
    console.log("Found!");
    // Find the join room menu and wait until it is visible
    const joinRoomMenu = await driver.findElement(Selenium.By.id('join-room'));
    await driver.wait(Selenium.until.elementIsVisible(joinRoomMenu), DEFAULT_TIMEOUT);
    console.log("Visible!");
    // Click the Join button
    await driver.findElement(Selenium.By.id('join-button')).click();
    console.log("Clicked!");
    await driver.sleep(DEFAULT_TIMEOUT);
    // await driver.findElement(Selenium.By.id('join-button')).click();
  } catch (err) {
    console.log(err);
  } finally {
    driver.quit();
  }
})();

function buildChromeOptions() {
  const chromeOptions = new chrome.Options();
  // Fake video/audio streams
  chromeOptions.addArguments('--use-fake-ui-for-media-stream');
  chromeOptions.addArguments('--use-fake-device-for-media-stream');
  // File access from the browser
  chromeOptions.addArguments('--allow-file-access');
  chromeOptions.addArguments('--disable-web-security');
  chromeOptions.addArguments('--allow-running-insecure-content');
  chromeOptions.addArguments('--allow-insecure-localhost');

  return chromeOptions;
}