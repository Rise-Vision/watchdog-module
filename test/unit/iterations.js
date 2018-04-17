const assert = require("assert");
const simple = require("simple-mock");

const config = require("../../src/config");
simple.mock(config, "getDelayBeforeFirstIteration").returnWith(0);

const iterations = require("../../src/iterations");
const presence = require("../../src/presence");
const content = require("../../src/content");

describe("Iterations - Unit", () => {

  beforeEach(() => {
    simple.mock(presence, "logUpdatedAndReset").resolveWith(true);
    simple.mock(content, "requestScreenshot").resolveWith(true);
  });

  afterEach(() => {
    simple.restore();
  });

  it("should start iterations and call presence logging", done => {
    const testPresence = (action, interval) => {
      assert.equal(interval, config.getWatchInterval());

      action().then(() => {
        assert(presence.logUpdatedAndReset.called);
        assert.equal(presence.logUpdatedAndReset.callCount, 1);

        return action();
      })
      .then(() => {
        assert.equal(presence.logUpdatedAndReset.callCount, 2);

        done();
      });
    };

    const scheduleFn = simple.stub();
    scheduleFn.callFn(testPresence).callFn(() => {});
    iterations.execute(scheduleFn);
  });

  it("should start iterations and call content to request screenshot", done => {
    const testContent = (action, interval) => {
      assert.equal(interval, config.getContentWatchInterval());

      action().then(() => {
        assert(content.requestScreenshot.called);
        assert.equal(content.requestScreenshot.callCount, 1);

        return action();
      })
      .then(() => {
        assert.equal(content.requestScreenshot.callCount, 2);

        done();
      });
    };

    const scheduleFn = simple.stub();
    scheduleFn.callFn(() => {}).callFn(testContent);
    iterations.execute(scheduleFn);
  });

});
