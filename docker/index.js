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
  runContainer: async () => {
    const command = 'docker-compose up -d';
    return await executeCommand(command, __dirname).then(() => {
      // Return the name of the docker container: set to docker_chrome in docker-compose.yaml
      return 'docker_chrome';
    }).catch(error => {
      throw new Error(`Could not run the Docker container. Error: ${error}`);
    });
  },
  killContainer: async (containerName) => {
    const command = 'docker-compose kill';
    await executeCommand(command, __dirname).catch(error => {
      throw new Error(`Could not kill the Docker container ${containerName}. Error: ${error}`);
    });
  },
  executeCommand: async (containerName, commandToExecute) => {
    const command = `docker exec ${containerName} ${commandToExecute}`;
    await executeCommand(command, __dirname).then(stdout => {
      console.log(stdout);
    }).catch(error => {
      throw new Error(error);
    });
  }
};
