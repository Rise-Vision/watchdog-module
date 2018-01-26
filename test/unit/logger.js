/* eslint-env mocha */
/* eslint-disable max-statements */
const assert = require("assert");
const common = require("common-display-module");
const messaging = require("common-display-module/messaging");
const simple = require("simple-mock");

const logger = require("../../src/logger");

describe("Logger - Unit", ()=>
{

  beforeEach(()=>
  {
    const settings = {displayid: "DIS123"};

    simple.mock(messaging, "broadcastMessage").returnWith();
    simple.mock(common, "getDisplaySettings").resolveWith(settings);
    simple.mock(common, "getModuleVersion").returnWith("1.1");
  });

  afterEach(()=> {
    simple.restore()
  });

  it("should send up module availability", () => {
    return logger.logModuleAvailability('display-control', true)
    .then(() => {
      assert(messaging.broadcastMessage.called);

      // this is the actual event object sent to the logging module
      const event = messaging.broadcastMessage.lastCall.args[0]

      // I sent the event
      assert.equal(event.from, "watchdog")
      // it's a log event
      assert.equal(event.topic, "log")

      const data = event.data
      assert.equal(data.projectName, "client-side-events")
      assert.equal(data.datasetName, "Module_Events")
      assert.equal(data.table, "watchdog_events")
      assert.equal(data.failedEntryFile, "watchdog-failed.log")

      // the BigQuery row entry, see design doc for individual element description
      const row = data.data
      assert.equal(row.event, "module-up")
      assert.equal(row.event_details, "display-control")
      assert.equal(row.display_id, "DIS123")
      assert.equal(row.version, "1.1")
      // ts will be inserted in logging module, so we won't be checking it here
    })
  });

  it("should send down module availability", () => {
    return logger.logModuleAvailability('display-control', false)
    .then(() => {
      assert(messaging.broadcastMessage.called);

      // this is the actual event object sent to the logging module
      const event = messaging.broadcastMessage.lastCall.args[0]

      // I sent the event
      assert.equal(event.from, "watchdog")
      // it's a log event
      assert.equal(event.topic, "log")

      const data = event.data
      assert.equal(data.projectName, "client-side-events")
      assert.equal(data.datasetName, "Module_Events")
      assert.equal(data.table, "watchdog_events")
      assert.equal(data.failedEntryFile, "watchdog-failed.log")

      // the BigQuery row entry, see design doc for individual element description
      const row = data.data
      assert.equal(row.event, "module-down")
      assert.equal(row.event_details, "display-control")
      assert.equal(row.display_id, "DIS123")
      assert.equal(row.version, "1.1")
      // ts will be inserted in logging module, so we won't be checking it here
    })
  });

});
