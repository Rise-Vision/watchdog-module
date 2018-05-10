const fs = require("fs");
const PNG = require("pngjs").PNG;
const pixelmatch = require("pixelmatch");
const messaging = require("common-display-module/messaging");
const config = require("./config");
const logger = require("./logger");

const MAX_CONSECUTIVE_EVENTS = 3;
let repeatedWhiteScreenTimer = null;
let whiteScreenEvents = 0;

function requestScreenshot() {
  return messaging.broadcastMessage({
    from: config.moduleName,
    topic: "local-screenshot-request"
  });
}

function checkWhiteScreen(filePath, handler = handleWhiteScreen) {
  return readImage(filePath)
    .then(image => {
      const white = createWhiteImage(image);
      const diff = pixelmatch(image.data, white, null, image.width, image.height);
      const whiteScreenDetected = diff <= 0;
      handler(whiteScreenDetected);
    })
    .then(() => fs.unlinkSync(filePath))
    .catch(() => fs.unlinkSync(filePath));
}

function handleWhiteScreen(whiteScreenDetected, schedule = setTimeout, interval = config.getRepeatedWhiteScreenCheckInterval()) {
  if (!whiteScreenDetected) {
    clearTimeout(repeatedWhiteScreenTimer);
    return;
  }

  repeatedWhiteScreenTimer = schedule(requestScreenshot, interval);
  whiteScreenEvents += 1;
  if (whiteScreenEvents >= MAX_CONSECUTIVE_EVENTS) {
    whiteScreenEvents = 0;
    logger.external("white screen detected");
    clearTimeout(repeatedWhiteScreenTimer);
  }
}

function readImage(filePath) {
  return new Promise((resolve, reject) => {
    const image = fs.createReadStream(filePath)
      .pipe(new PNG())
      .on('parsed', () => {
        resolve(image);
      })
      .on('error', reject);
  });
}

function createWhiteImage(image) {
  const whitePixel = 255;
  return Buffer.alloc(image.data.length, whitePixel);
}

module.exports = {
  requestScreenshot,
  checkWhiteScreen,
  handleWhiteScreen
};
