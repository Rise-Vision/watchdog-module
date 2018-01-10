const common = require("common-display-module");

const moduleName = "watchdog";

module.exports = {
  bqProjectName: "client-side-events",
  bqDataset: "Module_Events",
  bqTable: "watchdog_events",
  failedEntryFile: "watchdog-failed.log",
  logFolder: common.getModulePath(moduleName),
  moduleName,
  getModuleVersion() {
    return common.getModuleVersion(moduleName)
  }
};
