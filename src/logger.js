/* eslint-disable function-paren-newline */
const common = require("common-display-module");
const {
  bqProjectName, bqDataset, bqTable, failedEntryFile, logFolder,
  moduleName, getModuleVersion
} = require("./config");

const externalLogger = require("common-display-module/external-logger")(bqProjectName, bqDataset, failedEntryFile);
const logger = require("rise-common-electron/logger")(externalLogger, logFolder, moduleName);

let moduleVersions = {};

// Creates the detail data structure that the logging functions expect.
// Assigns "event_details" and "display_id", that are expected in the events table
function detailsFor(eventDetails, data = {}) {
  return common.getDisplayId().then(displayId =>
    Object.assign({
      "event_details": eventDetails,
      "display_id": displayId,
      "version": getModuleVersion() || "unknown"
    }, data)
  );
}

function error(eventDetails, userFriendlyMessage) {
  return detailsFor(eventDetails)
  .then(detail => logger.error(detail, userFriendlyMessage, bqTable));
}

function all(eventType, eventDetails = "", data = {}) {
  return detailsFor(eventDetails, data)
    .then(detail => logger.all(eventType, detail, null, bqTable));
}

function external(eventType, eventDetails = "", data = {}) {
  return detailsFor(eventDetails, data)
  .then(detail => logger.external(eventType, detail, bqTable));
}

function logModuleAvailability(watchedModuleName, isAvailable) {
  const eventType = isAvailable ? "module-up" : "module-down";
  const watchedModuleVersion = getWatchedModuleVersion(watchedModuleName);
  const eventDetails = `${watchedModuleName}${watchedModuleVersion}`;

  return external(eventType, eventDetails);
}

function getWatchedModuleVersion(name) {
  if (!moduleVersions[name]) {
    moduleVersions[name] = common.getModuleVersion(name);
  }

  return moduleVersions[name] || "";
}

function reset() {moduleVersions = {};}

module.exports = {
  file: logger.file,
  debug: logger.debug,
  error,
  external,
  all,
  logModuleAvailability,
  reset
};
