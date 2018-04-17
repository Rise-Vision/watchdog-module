const assert = require("assert");
const common = require("common-display-module");
const simple = require("simple-mock");

const config = require("../../src/config");

describe("Config - Unit", () => {

  afterEach(() => simple.restore());

  it("should use default content watch interval if not configured", () => {
    simple.mock(common, "getDisplayProperty").resolveWith(null);

    return config.init()
    .then(() => {
      const interval = config.getContentWatchInterval();

      // by default, half the regular watch interval.
      assert.equal(interval, 150000);
    });
  });

  it("should use contentwatchinterval if configured", () => {
    simple.mock(common, "getDisplayProperty").resolveWith("10");

    return config.init()
    .then(() => {
      const interval = config.getContentWatchInterval();

      assert.equal(interval, 600000);
    });
  });
});
