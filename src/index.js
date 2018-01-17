/* eslint-disable default-case */

const common = require("common-display-module");
const config = require("./config");
const iterations = require("./iterations");
const logger = require("./logger");
const presence = require("./presence");

function receiveHeartbeat(message) {
  // viewer reports through websocket channel in local messaging.
  const moduleName =
    message.from === 'ws-client' ? 'viewer' : message.from;

  return presence.setModuleStatusAsUp(moduleName);
}

function run(schedule = setInterval) {
  presence.init();

  common.receiveMessages(config.moduleName).then(receiver => {
    receiver.on("message", message => {
      switch (message.topic.toUpperCase()) {
        case "HEARTBEAT": return receiveHeartbeat(message);
      }
    });

    iterations.execute(schedule);

    return logger.all("started");
  });
}

if (process.env.NODE_ENV !== "test") {
  run();
}

module.exports = {receiveHeartbeat, run};
