'use strict';

const Selenium = require('selenium-webdriver');
const Chrome = require('selenium-webdriver/chrome');
const Docker = require('./docker');
const { sleep } = require('./helpers/sleep');
const { program } = require('commander');

const DEFAULT_TIMEOUT = 30000;

// Initialize command line options
program
  .option('-b, --bandwidth <value>', 'Set outgoing bandwidth in kilo/mega bits per second (e.g. 128kbps)')
  .option('-l, --packetLoss <value>', 'Set packet loss value in percent (e.g. 20)')
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
  // TODO - wait for the Selenium service to start
  await sleep(3000);

  // Set network limitations that were passed from the command Line
  await setNetworkLimitations(containerName);

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
}

async function setNetworkLimitations(containerName) {
  let ruleSet = '';
  if (typeof program.bandwidth !== 'undefined') {
    ruleSet += ` --rate ${program.bandwidth}`;
  }
  if (typeof program.packetLoss !== 'undefined') {
    ruleSet += ` --loss ${program.packetLoss}`;
  }
  if (typeof program.packetDelay !== 'undefined') {
    ruleSet += ` --delay ${program.packetDelay}`;
    if (typeof program.jitter !== 'undefined') {
      ruleSet += ` --delay-distro ${program.jitter}`;
    }
  } else if (typeof program.jitter !== 'undefined') {
    throw new Error('Jitter cannot be defined without defining packet delay');
  }
  if (ruleSet === '') {
    console.log('No network limitations set');
  } else {
    const commandToExecute = `tcset eth0${ruleSet}`;
    await Docker.executeCommand(containerName, commandToExecute);
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
