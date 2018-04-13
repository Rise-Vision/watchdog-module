// Iteration loop, separated to facilitate integration tests

const config = require("./config");
const presence = require("./presence");
const content = require("./content");

const presenceScheduler = createScheduler(config.getDelayBeforeFirstIteration(), config.getWatchInterval());
const contentScheduler = createScheduler(config.getDelayBeforeFirstIteration(), config.getContentWatchInterval());

function execute(schedule = setInterval) {
  // safety catch, stop any previous execution.
  presenceScheduler.stop();
  presenceScheduler.execute(schedule, presence.logUpdatedAndReset);

  contentScheduler.stop();
  contentScheduler.execute(schedule, content.requestScreenshot);
}

function createScheduler(delayBeforeFirstIteration, interval) {
  let timerId = null;
  return {
    execute(schedule = setInterval, action = () => { }) {
      setTimeout(() => {
        timerId = schedule(action, interval);
      }, delayBeforeFirstIteration);
    },

    stop() {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
    }
  };
}

module.exports = {execute};
