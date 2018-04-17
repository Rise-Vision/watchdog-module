// Iteration loop, separated to facilitate integration tests

const config = require("./config");
const presence = require("./presence");
const content = require("./content");

function execute(schedule = setInterval) {
  const presenceScheduler = createScheduler(config.getDelayBeforeFirstIteration(), config.getWatchInterval());
  presenceScheduler.execute(schedule, presence.logUpdatedAndReset);

  const contentScheduler = createScheduler(config.getDelayBeforeFirstIteration(), config.getContentWatchInterval());
  contentScheduler.execute(schedule, content.requestScreenshot);
}

function createScheduler(delayBeforeFirstIteration, interval) {
  return {
    execute(schedule = setInterval, action = () => {}) {
      if (interval <= 0) {return;}
      setTimeout(() => schedule(action, interval), delayBeforeFirstIteration);
    }
  };
}

module.exports = {execute};
