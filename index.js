'use strict';

const Selenium = require('selenium-webdriver');
const Chrome = require('selenium-webdriver/chrome');
const Docker = require('./docker');
const TrafficControl = require('./traffic_control');
const { sleep } = require('./helpers/sleep');
const { program } = require('commander');

// Default timeout for Selenium commands: 30 seconds
const DEFAULT_TIMEOUT = 30000;
// Room test duration: 60 seconds
const ROOM_DURATION = 60000;

// Initialize command line options
program
  .requiredOption('-a, --address <address>', 'Ngrok tunnel address of the Twilio SDK server')
  .option('-b, --bandwidth <value>', 'Set outgoing bandwidth in kilo/mega bits per second (e.g. 128kbps)')
  .option('-l, --packetLoss <value>', 'Set packet loss value in percent (e.g. 20%)')
  .option('-d, --packetDelay <value>', 'Set packet delay in milliseconds (e.g. 200ms)')
  .option('-j, --jitter <value>', 'Set jitter in milliseconds (e.g. 20ms)');
program.parse(process.argv);

runTest().catch(error => {
  // Catch any error that is thrown in the test and exit the process
  console.error(error);
  process.exit(1);
});

async function runTest() {
  // Build and run the Docker image
  await Docker.buildImage();
  const containerName = await Docker.runContainer();

  console.log(containerName);
  // Wait 5 seconds for the Selenium service to start
  await sleep(5000);

  // Set network limitations that were passed from the command Line
  await TrafficControl.setNetworkLimitations(containerName, program);

  console.log('Starting the test...');
  // Create the Selenium WebDriver
  const driver = await new Selenium.Builder()
  .setChromeOptions(buildChromeOptions())
  .usingServer('http://localhost:4444/wd/hub')
  .forBrowser('chrome')
  .build();

  // Connect to the Twilio Video quickstart page
  await driver.get(`${program.address}/quickstart/?roomName=test&identity=docker_chrome`);
  console.log("Page loaded");
  await driver.wait(Selenium.until.elementLocated(Selenium.By.id('join-room')), DEFAULT_TIMEOUT);
  // Find the join room menu and wait until it is visible
  const joinRoomMenu = await driver.findElement(Selenium.By.id('join-room'));
  await driver.wait(Selenium.until.elementIsVisible(joinRoomMenu), DEFAULT_TIMEOUT);
  // Wait for 1 second to click the element
  await sleep(1000);
  // Click the Join button
  await driver.findElement(Selenium.By.id('join-button')).click();
  console.log("Room joined");
  await driver.sleep(ROOM_DURATION);
  // Get the connection time from the page
  const connectTime = await driver.findElement(Selenium.By.id('connect-time')).getText();
  // Disconnect from the room after the test ends
  await driver.findElement(Selenium.By.id('leave-room')).click();
  await driver.quit();

  console.log('Test finished!');
  console.log(`Connection time: ${connectTime} milliseconds`);

  // Kill the Docker image
  await Docker.killContainer(containerName);
}

function buildChromeOptions() {
  const chromeOptions = new Chrome.Options();
  // Fake video/audio streams
  chromeOptions.addArguments('--use-fake-ui-for-media-stream');
  chromeOptions.addArguments('--use-fake-device-for-media-stream');
  // Additional options for video/audio permissions
  chromeOptions.addArguments('--disable-web-security');
  chromeOptions.addArguments('--allow-running-insecure-content');
  chromeOptions.addArguments('--allow-insecure-localhost');

  return chromeOptions;
}
