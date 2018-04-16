/* eslint-disable default-case */

const processMonitor = require("./process-monitor");
const messaging = require("common-display-module/messaging");
const config = require("./config");
const iterations = require("./iterations");
const logger = require("./logger");
const presence = require("./presence");
const content = require("./content");

process.on("uncaughtException", (err)=>{
  logger.file(err.stack);
  process.exit(); // eslint-disable-line no-process-exit
});

process.on("unhandledRejection", (reason)=>{
  logger.file(reason.stack || reason);
  process.exit(); // eslint-disable-line no-process-exit
});

function run(schedule = setInterval) {
  return config.init()
  .then(() => {
    presence.init();
    processMonitor.init();

    return messaging.receiveMessages(config.moduleName).then(receiver => {
      receiver.on("message", message => {
        if (!message.topic) {return;}
        switch (message.topic.toUpperCase()) {
          case "HEARTBEAT":
            return presence.setModuleStatusAsUp(message.from);
          case "LOCAL-SCREENSHOT-RESULT":
            return content.checkWhiteScreen(message.filePath);
        }
      });

      iterations.execute(schedule);

      return logger.all("started");
    });
  })
  .catch(error => logger.error(error.stack, 'startup error'));
}

if (process.env.NODE_ENV !== "test") {
  run();
}

module.exports = {run};
