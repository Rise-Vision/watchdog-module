// Iteration loop, separated to facilitate integration tests

const config = require("./config");
const logger = require("./logger");
const presence = require("./presence");

let timerId = null;

function logPresenceAndReset() {
  presence.logUpdatedAndReset()
  .catch(error => {
    const detail = error.stack || JSON.stringify(error)

    logger.error(detail, "Error while logging presence.")
  })
}

function startLoggingPresence() {
  const interval = config.watchIntervalDuration();

  timerId = setInterval(logPresenceAndReset, interval);
}

function execute() {
  // safety catch, stop any previous execution.
  stop();

  const offset = config.delayBeforeFirstIteration();

  setTimeout(startLoggingPresence, offset);
}

function stop() {
  if (timerId) {
    clearInterval(timerId);

    timerId = null;
  }
}

module.exports = {execute, stop};
