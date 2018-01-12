/* eslint-env mocha */
/* eslint-disable max-statements, no-magic-numbers */
const assert = require("assert");
const simple = require("simple-mock");

const config = require("../../src/config");
const iterations = require("../../src/iterations");
const presence = require("../../src/presence");

const FIVE_MINUTES = 300000;

describe("Iterations - Unit", ()=>
{

  beforeEach(() =>
  {
    simple.mock(config, "getDelayBeforeFirstIteration").returnWith(0);
    simple.mock(presence, "logUpdatedAndReset").resolveWith(true);
  });

  afterEach(() => {
    simple.restore();
  });

  it("should start iterations and call presence logging", done => {
    iterations.execute((action, interval) => {
      assert.equal(interval, FIVE_MINUTES);

      action().then(() => {
        assert(presence.logUpdatedAndReset.called);
        assert.equal(presence.logUpdatedAndReset.callCount, 1);

        return action();
      })
      .then(() => {
        assert.equal(presence.logUpdatedAndReset.callCount, 2);

        done();
      })
    });
  });

});
