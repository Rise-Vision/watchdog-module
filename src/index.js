/* eslint-disable default-case */

const messaging = require("common-display-module/messaging");
const config = require("./config");
const iterations = require("./iterations");
const logger = require("./logger");
const presence = require("./presence");

function run(schedule = setInterval) {
  presence.init();

  messaging.receiveMessages(config.moduleName).then(receiver => {
    receiver.on("message", message => {
      switch (message.topic.toUpperCase()) {
        case "HEARTBEAT":
          return presence.setModuleStatusAsUp(message.from);
      }
    });

    iterations.execute(schedule);

    return logger.all("started");
  });
}

if (process.env.NODE_ENV !== "test") {
  run();
}

module.exports = {run};
