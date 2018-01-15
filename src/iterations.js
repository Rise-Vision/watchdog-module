// Iteration loop, separated to facilitate integration tests

const config = require("./config");
const logger = require("./logger");
const presence = require("./presence");

let timerId = null;

function logPresenceAndReset() {
  return presence.logUpdatedAndReset()
  .catch(error => {
    const detail = error.stack || JSON.stringify(error)

    logger.error(detail, "Error while logging presence.")
  })
}

function execute(schedule = setInterval) {
  // safety catch, stop any previous execution.
  stop();

  const offset = config.getDelayBeforeFirstIteration();

  setTimeout(() => {
    const interval = config.getWatchInterval();

    timerId = schedule(logPresenceAndReset, interval);
  }, offset);
}

function stop() {
  if (timerId) {
    clearInterval(timerId);

    timerId = null;
  }
}

module.exports = {execute, stop};
