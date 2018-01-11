/* eslint-disable function-paren-newline, id-length */
const logger = require("./logger");

// Holds the last status that have been sent to logging.
// Each key is a module name, and the value is a boolean up/down status value.
const previousStatusTable = {};

// Updates the last status with a whole set of updated status for each module.
function updateStatusTable(updatedStatusTable) {
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

// Exposed for test purposes only.
function resetPreviousStatusTable() {
  Object.keys(previousStatusTable).forEach(key => previousStatusTable[key] = null);
}

module.exports = {
  resetPreviousStatusTable,
  updateStatusTable
}
