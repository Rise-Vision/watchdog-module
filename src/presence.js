/* eslint-disable function-paren-newline, id-length */
const logger = require("./logger");

// Each key is a module name, and the value is a boolean up/down status value.
const statusTable = {};

function updateStatus(updatedStatusTable) {
  const changed = Object.keys(updatedStatusTable).filter(key =>
    statusTable[key] !== updatedStatusTable[key]
  );

  Object.assign(statusTable, updatedStatusTable);

  return logger.all("watching").then(() =>
    changed.reduce((promise, moduleName) =>
      promise.then(() =>
        logger.logModuleAvailability(moduleName, statusTable[moduleName])
      ), Promise.resolve()
    )
  );
}

// exposed for test purposes only.
function getStatusTable() {
  return statusTable;
}
function resetStatusTable() {
  Object.keys(statusTable).forEach(key => statusTable[key] = null);
}

module.exports = {
  getStatusTable,
  resetStatusTable,
  updateStatus
}
