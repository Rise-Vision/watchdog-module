/* eslint-disable default-case */

const processMonitor = require("./process-monitor");
const messaging = require("common-display-module/messaging");
const config = require("./config");
const iterations = require("./iterations");
const logger = require("./logger");
const presence = require("./presence");

process.on("uncaughtException", (err)=>{
  logger.file(err.stack);
  process.exit(); // eslint-disable-line no-process-exit
});

process.on("unhandledRejection", (reason)=>{
  logger.file(reason.stack || reason);
  process.exit(); // eslint-disable-line no-process-exit
});

function run(schedule = setInterval) {
  presence.init();
  processMonitor.init();

  messaging.receiveMessages(config.moduleName).then(receiver => {
    receiver.on("message", message => {
      if (!message.topic) {return;}
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
