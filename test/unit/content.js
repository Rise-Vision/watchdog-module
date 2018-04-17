const assert = require("assert");
const simple = require("simple-mock");
const fs = require("fs");
const os = require("os");
const path = require("path");

const messaging = require("common-display-module/messaging");
const logger = require("../../src/logger");
const content = require("../../src/content");

describe("Content - Unit", () => {

  beforeEach(() => simple.mock(logger, "external"))

  it("should request screenshot", () => {
    simple.mock(messaging, "broadcastMessage").resolveWith();

    return content.requestScreenshot()
    .then(() => {
      assert.ok(messaging.broadcastMessage.called);
      const message = messaging.broadcastMessage.lastCall.arg;
      assert.deepEqual(message, {from: "watchdog", topic: "local-screenshot-request"});
    });
  });

  function assertWhiteScreen(fileName) {
    const filePath = path.join(os.tmpdir(), fileName);
    fs.copyFileSync(path.resolve("test", "fixture", fileName), filePath);

    return content.checkWhiteScreen(filePath).then(() => {
      assert.ok(logger.external.called);
      const message = logger.external.lastCall.arg;
      assert.equal(message, "white screen detected");
      assert.equal(fs.existsSync(filePath), false);
    });
  }

  it("should detect white screen when testing white screenshot", () => {
    return assertWhiteScreen("white.png");
  });

  it("should detect white screen when testing transparent screenshot", () => {
    return assertWhiteScreen("transparent.png");
  });

  function assertNonWhiteScreen(fileName) {
    const filePath = path.join(os.tmpdir(), fileName);
    fs.copyFileSync(path.resolve("test", "fixture", fileName), filePath);

    return content.checkWhiteScreen(filePath).then(() => {
      assert.equal(logger.external.called, false);
      assert.equal(fs.existsSync(filePath), false);
    });
  }

  it("should not detect white screen when testing dot screenshot", () => {
    return assertNonWhiteScreen("dot.png");
  });

  it("should not detect white screen when testing emoji screenshot", () => {
    return assertNonWhiteScreen("emoji.png");
  });

  it("should not detect white screen when testing red oval screenshot", () => {
    return assertNonWhiteScreen("red_oval.png");
  });

  it("should not detect white screen when testing text screenshot", () => {
    return assertNonWhiteScreen("text.png");
  });

  it("should not detect white screen when testing regular screenshot", () => {
    return assertNonWhiteScreen("regular.png");
  });
});
