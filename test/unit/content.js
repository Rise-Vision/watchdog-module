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
    const handler = simple.spy();

    return content.checkWhiteScreen(filePath, handler).then(() => {
      assert.equal(handler.lastCall.arg, true);
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
    const handler = simple.spy();

    return content.checkWhiteScreen(filePath, handler).then(() => {
      assert.equal(handler.lastCall.arg, false);
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

  it("should not log event when white screen detected only once", () => {
    const scheduler = () => {};
    const interval = 0;

    content.handleWhiteScreen(true, scheduler, interval);

    assert.equal(logger.external.called, false);
  });

  it("should not log event when white screen event is not consecutive", () => {
    const scheduler = () => {};
    const interval = 0;

    content.handleWhiteScreen(false, scheduler, interval);
    content.handleWhiteScreen(true, scheduler, interval);
    content.handleWhiteScreen(false, scheduler, interval);

    assert.equal(logger.external.called, false);
  });

  it("should log event after 3 consecutive detections", () => {
    const scheduler = () => {};
    const interval = 0;

    content.handleWhiteScreen(true, scheduler, interval);
    content.handleWhiteScreen(true, scheduler, interval);
    content.handleWhiteScreen(true, scheduler, interval);

    assert.ok(logger.external.called);
    assert.equal(logger.external.lastCall.arg, "white screen detected");
  });

  it("should broadcast event after 3 consecutive detections", () => {
    const scheduler = () => {};
    const interval = 0;

    content.handleWhiteScreen(true, scheduler, interval);
    content.handleWhiteScreen(true, scheduler, interval);
    content.handleWhiteScreen(true, scheduler, interval);

    assert.ok(messaging.broadcastMessage.called);
    const message = messaging.broadcastMessage.lastCall.arg;
    assert.deepEqual(message, {from: "watchdog", topic: "white-screen-detected"});
  });
});
