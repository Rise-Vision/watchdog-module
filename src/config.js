const common = require("common-display-module");

const MINUTES = 60000;
const DEFAULT_OFFSET = 1;
const DEFAULT_WATCH_INTERVAL = 5;

const moduleName = "watchdog";

// Can be set via environment variable OFFSET. 0 means no delay.
function getDelayBeforeFirstIteration() {
  const value = Number(process.env.OFFSET || DEFAULT_OFFSET);

  return value * MINUTES;
}

// Can be set via environment variable WATCH_INTERVAL, which is useful for testing purposes.
// Should not be set to less than the HEARBEAT interval in common-display-module.
function getWatchInterval() {
  const value = Number(process.env.WATCH_INTERVAL || DEFAULT_WATCH_INTERVAL);

  return value * MINUTES;
}

module.exports = {
  bqProjectName: "client-side-events",
  bqDataset: "Module_Events",
  bqTable: "watchdog_events",
  failedEntryFile: "watchdog-failed.log",
  logFolder: common.getModulePath(moduleName),
  moduleName,
  getModuleVersion() {
    return common.getModuleVersion(moduleName)
  },
  getDelayBeforeFirstIteration,
  getWatchInterval
};
