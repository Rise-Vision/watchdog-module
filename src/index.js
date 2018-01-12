const common = require("common-display-module");
const config = require("./config");
const logger = require("./logger");
const presence = require("./presence");

presence.init();

common.receiveMessages(config.moduleName).then(() => {
  // message handling will go here ( check presence data from local messaging in a following card )

  return logger.all("started");
});
