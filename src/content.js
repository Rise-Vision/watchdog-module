const fs = require("fs");
const PNG = require("pngjs").PNG;
const pixelmatch = require("pixelmatch");
const messaging = require("common-display-module/messaging");
const config = require("./config");
const logger = require("./logger");

function requestScreenshot() {
  return messaging.broadcastMessage({
    from: config.moduleName,
    topic: "local-screenshot-request"
  });
}

function checkWhiteScreen(filePath) {
  return readImage(filePath)
    .then(image => {
      const white = createWhiteImage(image);
      const diff = pixelmatch(image.data, white, null, image.width, image.height);
      if (diff <= 0) {
        logger.external("white screen detected");
      }
    })
    .then(() => fs.unlinkSync(filePath))
    .catch(() => fs.unlinkSync(filePath));
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
  checkWhiteScreen
};
