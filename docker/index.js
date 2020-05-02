'use strict';

const { executeCommand } = require('../helpers/execute-command');

module.exports = {
  buildImage: async () => {
    console.log('Building Docker image');
    const command = 'docker-compose build';
    await executeCommand(command, __dirname).then(stdout => {
      console.log(stdout);
    }).catch(error => {
      throw new Error(`Could not build the Docker image. Error: ${error}`);
    });
  },
  runImage: async () => {
    const command = 'docker-compose up -d';
    await executeCommand(command, __dirname).then(stdout => {
      console.log(stdout);
      // Return the name of the docker container: set to docker_chrome in docker-compose.yaml
      return 'docker_chrome';
    }).catch(error => {
      throw new Error(`Could not run the Docker image. Error: ${error}`);
    });
  }
};
