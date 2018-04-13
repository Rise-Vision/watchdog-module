const messaging = require("common-display-module/messaging");
const config = require("./config");

function requestScreenshot() {
  return messaging.broadcastMessage({
    from: config.moduleName,
    topic: "local-screenshot-request"
  });
}

module.exports = {
  requestScreenshot
};
