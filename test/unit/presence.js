/* eslint-env mocha */
/* eslint-disable max-statements, no-magic-numbers */
const assert = require("assert");
const common = require("common-display-module");
const simple = require("simple-mock");

const logger = require("../../src/logger");
const presence = require("../../src/presence");

describe("Presence - Unit", ()=>
{

  beforeEach(() =>
  {
    simple.mock(logger, "all").resolveWith(true);
    simple.mock(logger, "logModuleAvailability").resolveWith(true);
    simple.mock(common, "getManifest").returnWith({
      "launcher": {version: ""},
      "player-electron": {version: ""},
      "local-messaging": {version: ""},
      "local-storage": {version: ""},
      "logging": {version: ""},
      "display-control": {version: ""},
      "system-metrics": {version: ""},
      "watchdog": {version: ""}
    });
  });

  afterEach(() => {
    simple.restore();
    presence.reset();
  });

  it("should update presence and log changes", () => {
    return presence.logUpdated({
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

      return presence.logUpdated({
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

      return presence.logUpdated({
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
        switch (call.args[0]) {
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

  it("should report all modules as down if no HEARBEAT arrives", () => {
    presence.init();

    return presence.logUpdatedAndReset().then(() => {
      // watching always logs
      assert.equal(logger.all.callCount, 1);
      assert.equal(logger.all.lastCall.args[0], "watching");

      // 6 modules
      assert.equal(logger.logModuleAvailability.callCount, 6);
      logger.logModuleAvailability.calls.forEach(call => {
        assert([
          "player-electron", "local-messaging", "local-storage", "logging",
          "display-control", "system-metrics", "viewer"
        ].includes(call.args[0]));

        // as no heatbeat, all modules down
        assert.equal(call.args[1], false);
      });
    });
  });

  it("should report modules as up if a HEARBEAT arrives", () => {
    presence.init();

    presence.setModuleStatusAsUp("player-electron");
    presence.setModuleStatusAsUp("local-messaging");
    presence.setModuleStatusAsUp("local-storage");
    presence.setModuleStatusAsUp("logging");

    return presence.logUpdatedAndReset().then(() => {
      // watching always logs
      assert.equal(logger.all.callCount, 1);
      assert.equal(logger.all.lastCall.args[0], "watching");

      // 6 modules
      assert.equal(logger.logModuleAvailability.callCount, 6);

      logger.logModuleAvailability.calls.forEach(call => {
        switch (call.args[0]) {
          case "player-electron": case "local-messaging": case "local-storage":
          case "logging":
            assert(call.args[1]);
            break;
          case "display-control": case "system-metrics": case "viewer":
            assert(!call.args[1]);
            break;
          default:
            assert.fail(`invalid log module argument ${call.args[0]}`);
        }
      });

      presence.setModuleStatusAsUp("player-electron");
      presence.setModuleStatusAsUp("local-messaging");
      presence.setModuleStatusAsUp("local-storage");
      // presence.setModuleStatusAsUp("viewer");
      presence.setModuleStatusAsUp("display-control");

      return presence.logUpdatedAndReset().then(() => {
        // watching always logs
        assert.equal(logger.all.callCount, 2);
        assert.equal(logger.all.lastCall.args[0], "watching");

        // 6 previous calls + 2 modules changed status, logging went to off, display-control went to on
        assert.equal(logger.logModuleAvailability.callCount, 8);

        logger.logModuleAvailability.calls.slice(6).forEach(call => {
          switch (call.args[0]) {
            case "logging":
              assert(!call.args[1]);
              break;
            case "viewer":
            case "display-control":
              assert(call.args[1]);
              break;
            default:
              assert.fail(`invalid log module argument ${call.args[0]}`);
          }
        });
      });
    });
  });

  it("should not log presence for modules not being watched", () => {
    presence.init();

    // launcher is not currently being watched
    presence.setModuleStatusAsUp("launcher");

    return presence.logUpdatedAndReset().then(() => {
      // watching always logs
      assert.equal(logger.all.callCount, 1);
      assert.equal(logger.all.lastCall.args[0], "watching");

      // 6 modules
      assert.equal(logger.logModuleAvailability.callCount, 6);
      logger.logModuleAvailability.calls.forEach(call => {
        assert([
          "player-electron", "local-messaging", "local-storage", "logging",
          "display-control", "system-metrics", "viewer"
        ].includes(call.args[0]));

        // as no heatbeat, all modules down
        assert.equal(call.args[1], false);
      });
    });
  });

});
