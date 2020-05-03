'use strict';

const childProcess = require('child_process');

module.exports = {
  /**
   * Executes a command on the host
   * @param {string} command - Command that needs to be executed
   * @param {string} workingDirectory - Directory where the command needs to be executed
   * @returns {Promise<any>} - Resolves the Promise with the command output or rejects it with the error message of the command
   */
  executeCommand: (command, workingDirectory = '.') => {
    console.log(`Executing command: ${command}`);
    return new Promise((resolve, reject) => {
      childProcess.exec(command, { cwd: workingDirectory }, (error, stdout) => {
        if (error) {
          reject(error);
        }

        resolve(stdout);
      });
    });
  }
};
