/* eslint-env mocha */
/* eslint-disable max-statements, no-magic-numbers */
const assert = require("assert");
const simple = require("simple-mock");

const logger = require("../../src/logger");
const presence = require("../../src/presence");

describe("Presence - Unit", ()=>
{

  beforeEach(() =>
  {
    simple.mock(logger, "all").resolveWith(true);
    simple.mock(logger, "logModuleAvailability").resolveWith(true);
  });

  afterEach(() => {
    simple.restore();
    presence.resetPreviousStatusTable();
  });

  it("should update presence and log changes", () => {
    return presence.updateStatusTable({
      "display-control": true, "logging": false, "local-storage": true
    })
    .then(() => {
      assert(logger.all.called);
      assert.equal(logger.all.callCount, 1);
      assert.equal(logger.all.lastCall.args[0], "watching");

      assert(logger.logModuleAvailability.called);
      assert.equal(logger.logModuleAvailability.callCount, 3);
      logger.logModuleAvailability.calls.forEach(call => {
        switch (call.args[0])
        {
          case "display-control": case "local-storage":
            assert(call.args[1]);
            break;
          case "logging":
            assert(!call.args[1]);
            break;
          default:
            assert.fail(`invalid log module argument ${call.args[0]}`);
        }
      });

      return presence.updateStatusTable({
        "display-control": false, "logging": false, "local-storage": true
      })
    })
    .then(() => {
      // watching always logs
      assert.equal(logger.all.callCount, 2);
      assert.equal(logger.all.lastCall.args[0], "watching");

      // just one change ( display-control )
      assert.equal(logger.logModuleAvailability.callCount, 4);
      assert.equal(logger.logModuleAvailability.lastCall.args[0], "display-control");
      assert.equal(logger.logModuleAvailability.lastCall.args[1], false);

      return presence.updateStatusTable({
        "display-control": false, "logging": true, "local-storage": false
      })
    })
    .then(() => {
      // watching always logs
      assert.equal(logger.all.callCount, 3);
      assert.equal(logger.all.lastCall.args[0], "watching");

      // two changes ( logging and local-storage )
      assert.equal(logger.logModuleAvailability.callCount, 6);
      logger.logModuleAvailability.calls.slice(4).forEach(call => {
        switch (call.args[0])
        {
          case "local-storage":
            assert(!call.args[1]);
            break;
          case "logging":
            assert(call.args[1]);
            break;
          default:
            assert.fail(`invalid log module argument ${call.args[0]}`);
        }
      });
    });
  });

});
