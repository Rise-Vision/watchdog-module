// Iteration loop, separated to facilitate integration tests

const config = require("./config");
const logger = require("./logger");
const presence = require("./presence");

function logPresenceAndReset() {
  return presence.logUpdatedAndReset()
  .catch(error => {
    const detail = error.stack || JSON.stringify(error)

    logger.error(detail, "Error while logging presence.")
  })
}

function execute(schedule = setTimeout) {
  const offset = config.delayBeforeFirstIteration();

  setTimeout(() => {
    const interval = config.watchIntervalDuration();

    schedule(logPresenceAndReset, interval);
  }, offset);
}

module.exports = {execute};
