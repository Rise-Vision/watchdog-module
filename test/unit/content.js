const assert = require("assert");
const simple = require("simple-mock");

const messaging = require("common-display-module/messaging");
const content = require("../../src/content");

describe("Content - Unit", () => {
  it("should request screenshot", () => {
    simple.mock(messaging, "broadcastMessage").resolveWith();

    return content.requestScreenshot()
    .then(() => {
      assert(messaging.broadcastMessage.called);
      const message = messaging.broadcastMessage.lastCall.arg;
      assert.deepEqual(message, {from: "watchdog", topic: "local-screenshot-request"});
    });
  });
});
