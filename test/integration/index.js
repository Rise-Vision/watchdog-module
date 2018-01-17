/* eslint-env mocha */
/* eslint-disable max-statements, no-magic-numbers */
const assert = require("assert");
const common = require("common-display-module");
const simple = require("simple-mock");

const config = require("../../src/config");
const presence = require("../../src/presence");
const watchdog = require("../../src/index");

const FIVE_MINUTES = 300000;

describe("Watchdog - Integration", ()=>
{

  beforeEach(() =>
  {
    const settings = {displayid: "DIS123"};

    simple.mock(common, "broadcastMessage").returnWith();
    simple.mock(common, "getClientList").returnWith();
    simple.mock(common, "getDisplaySettings").resolveWith(settings);
    simple.mock(common, "getModuleVersion").returnWith("1.1");
    simple.mock(config, "getDelayBeforeFirstIteration").returnWith(0);
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

  it("should start iterations and call presence logging", done => {
    let eventHandler = null;

    function Receiver() {
      this.on = (type, handler) =>
      {
        eventHandler = handler;

        handler({topic: "heartbeat", from: "player-electron"});
        handler({topic: "heartbeat", from: "local-messaging"});
        handler({topic: "heartbeat", from: "local-storage"});
        handler({topic: "heartbeat", from: "logging"});
      }
    }

    simple.mock(common, "receiveMessages").resolveWith(new Receiver());

    watchdog.run((action, interval) => {
      assert.equal(interval, FIVE_MINUTES);

      action().then(() => {
        assert(common.broadcastMessage.called);

        // started event + watching event + 7 status events
        assert.equal(common.broadcastMessage.callCount, 9);

        common.broadcastMessage.calls.slice(1).forEach(call => {

          // this is the actual event object sent to the logging module
          const event = call.args[0]

          // I sent the event
          assert.equal(event.from, "watchdog")
          // it's a log event
          assert.equal(event.topic, "log")

          const data = event.data
          assert.equal(data.projectName, "client-side-events")
          assert.equal(data.datasetName, "Module_Events")
          assert.equal(data.table, "watchdog_events")
          assert.equal(data.failedEntryFile, "watchdog-failed.log")

          // the BigQuery row entry
          const row = data.data
          assert.equal(row.display_id, "DIS123")
          assert.equal(row.version, "1.1")

          const validEvents =
            ['started', 'watching', 'module-up', 'module-down'];
          assert(validEvents.includes(row.event));

          if (row.event !== 'started' && row.event !== 'watching') {
            switch (row.event_details)
            {
              case "player-electron": case "local-messaging": case "local-storage":
              case "logging":
                assert(row.event, "module-up");
                break;
              case "display-control": case "system-metrics": case "viewer":
                assert(row.event, "module-down");
                break;
              default:
                assert.fail(`invalid log module argument ${row.event_details}`);
            }
          }
        });

        eventHandler({topic: "heartbeat", from: "player-electron"});
        eventHandler({topic: "heartbeat", from: "local-messaging"});
        eventHandler({topic: "heartbeat", from: "local-storage"});
        eventHandler({topic: "heartbeat", from: "ws-client"});

        return action();
      })
      .then(() => {
        // 9 previous events + watching + 2 change events
        assert.equal(common.broadcastMessage.callCount, 12);

        common.broadcastMessage.calls.slice(9).forEach(call => {

          // this is the actual event object sent to the logging module
          const event = call.args[0]

          // I sent the event
          assert.equal(event.from, "watchdog")
          // it's a log event
          assert.equal(event.topic, "log")

          const data = event.data
          assert.equal(data.projectName, "client-side-events")
          assert.equal(data.datasetName, "Module_Events")
          assert.equal(data.table, "watchdog_events")
          assert.equal(data.failedEntryFile, "watchdog-failed.log")

          // the BigQuery row entry
          const row = data.data
          assert.equal(row.display_id, "DIS123")
          assert.equal(row.version, "1.1")

          const validEvents = ['watching', 'module-up', 'module-down'];
          assert(validEvents.includes(row.event));

          if (row.event !== 'watching') {
            switch (row.event_details)
            {
              case "logging":
                assert(row.event, "module-down");
                break;
              case "viewer":
                assert(row.event, "module-up");
                break;
              default:
                assert.fail(`invalid log module argument ${row.event_details}`);
            }
          }
        });

        eventHandler({topic: "heartbeat", from: "player-electron"});
        eventHandler({topic: "heartbeat", from: "local-messaging"});
        eventHandler({topic: "heartbeat", from: "local-storage"});
        eventHandler({topic: "heartbeat", from: "ws-client"});

        done();
      })
    });
  });

});
