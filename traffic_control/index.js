'use strict';

const Docker = require('../docker');

module.exports = {
  setNetworkLimitations: async (containerName, program) => {
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
      const portExclusion = `--exclude-src-port 4444`; // Do not limit traffic for Selenium connection on port 4444
      const commandToExecute = `tcset eth0${ruleSet} ${portExclusion}`;
      await Docker.executeCommand(containerName, commandToExecute);
    }
  }
};
