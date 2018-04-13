/* eslint-disable function-paren-newline, id-length */
const common = require("common-display-module");
const config = require("./config");
const logger = require("./logger");

// Watchdog won't add these modules to its status table.
const EXCLUDED_WATCHED_MODULES = [config.moduleName, "launcher"];

// Maps module name to boolean up/down status value.
// Must be initialized with the module names before it starts receiving HEARTBEAT updates.
const currentStatusTable = {};

// Holds the last status that have been sent to logging.
// Each key is a module name, and the value is a boolean up/down status value.
const previousStatusTable = {};

function init() {
  const manifest = common.getManifest();

  Object.keys(manifest).filter(moduleName =>
    !EXCLUDED_WATCHED_MODULES.includes(moduleName)
  )
  .forEach(moduleName => currentStatusTable[moduleName] = false);

  // add viewer manually, it's not in module-manifest.json
  // disable until a later card
  // currentStatusTable.viewer = false;
}

function setModuleStatusAsUp(moduleName) {
  // only update modules being watched.
  if (moduleName in currentStatusTable) {
    currentStatusTable[moduleName] = true;
  }
}

function logUpdatedAndReset() {
  const updated = Object.assign({}, currentStatusTable);

  // So it can start receiving new updates.
  resetCurrentStatusTable();

  return logUpdated(updated)
  .catch(error => {
    const detail = error.stack || JSON.stringify(error)

    logger.error(detail, "Error while logging presence.")
  });
}

// Updates the last status with a whole set of updated status for each module.
function logUpdated(updatedStatusTable) {
  const changed = Object.keys(updatedStatusTable).filter(key =>
    previousStatusTable[key] !== updatedStatusTable[key]
  );

  Object.assign(previousStatusTable, updatedStatusTable);

  return logger.all("watching").then(() =>
    changed.reduce((promise, moduleName) =>
      promise.then(() =>
        logger.logModuleAvailability(moduleName, updatedStatusTable[moduleName])
      ), Promise.resolve()
    )
  );
}

function resetCurrentStatusTable() {
  Object.keys(currentStatusTable).forEach(key => currentStatusTable[key] = false);
}

function resetPreviousStatusTable() {
  Object.keys(previousStatusTable).forEach(key => previousStatusTable[key] = null);
}

// Reset all internal structures for testing purposes.
function reset() {
  resetCurrentStatusTable();
  resetPreviousStatusTable();
}

module.exports = {
  init,
  logUpdated,
  logUpdatedAndReset,
  setModuleStatusAsUp,
  reset
}
