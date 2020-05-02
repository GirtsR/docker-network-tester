'use strict';

const Selenium = require('selenium-webdriver');
const Chrome = require('selenium-webdriver/chrome');
const Docker = require('./docker');
const { sleep } = require('./helpers/sleep');
const DEFAULT_TIMEOUT = 30000;

runTest().catch(error => {
  console.error(error);
  process.exit(1);
});

async function runTest() {
  // Run the test in a try-catch block to throw any errors that arise
  try {
    // Build the Docker image and run it
    await Docker.buildImage();
    const containerName = await Docker.runImage();

    // TODO - wait for the Selenium service to start
    await sleep(3000);

    // Create the Selenium WebDriver
    const driver = await new Selenium.Builder()
    .setChromeOptions(buildChromeOptions())
    .usingServer('http://localhost:4444/wd/hub')
    .forBrowser('chrome')
    .build();

    // Start the test
    await driver.get('https://3a27acac.ngrok.io/quickstart/?roomName=test&identity=docker_chrome');
    console.log("Loaded!");
    await driver.wait(Selenium.until.elementLocated(Selenium.By.id('join-room')), DEFAULT_TIMEOUT);
    console.log("Found!");
    // Find the join room menu and wait until it is visible
    const joinRoomMenu = await driver.findElement(Selenium.By.id('join-room'));
    await driver.wait(Selenium.until.elementIsVisible(joinRoomMenu), DEFAULT_TIMEOUT);
    console.log("Visible!");
    // TODO - understand why clicking does not work immediately
    await sleep(1000);
    // Click the Join button
    await driver.findElement(Selenium.By.id('join-button')).click();
    console.log("Clicked!");
    await driver.sleep(DEFAULT_TIMEOUT);
    await driver.quit();
  } catch (error) {
    throw new Error(error);
  }
}

function buildChromeOptions() {
  const chromeOptions = new Chrome.Options();
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
