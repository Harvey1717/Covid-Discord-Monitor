const CoronaMonitor = require('./CoronaMonitor');
const config = require('../../config.json');

module.exports = class MonitorManger {
  async start() {
    for (let monitorConfig of config.monitorsConfig) {
      new CoronaMonitor(monitorConfig);
    }
  }
};
