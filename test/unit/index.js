/* eslint-env mocha */
/* eslint-disable max-statements, no-magic-numbers */
const assert = require("assert");
const simple = require("simple-mock");

const watchdog = require("../../src");
const presence = require("../../src/presence");

describe("Watchdog - Unit", ()=>
{

  beforeEach(() =>
  {
    simple.mock(presence, "setModuleStatusAsUp").returnWith();
  });

  afterEach(() => simple.restore());

  it("should report regular modules", () => {
    watchdog.receiveHeartbeat({topic: 'heartbeat', from: 'player-electron'});

    assert.equal(presence.setModuleStatusAsUp.callCount, 1);
    assert.equal(presence.setModuleStatusAsUp.lastCall.args[0], 'player-electron');
  });

  it("should report viewer heartbeat", () => {
    watchdog.receiveHeartbeat({topic: 'heartbeat', from: 'ws-client'});

    assert.equal(presence.setModuleStatusAsUp.callCount, 1);
    assert.equal(presence.setModuleStatusAsUp.lastCall.args[0], 'viewer');
  });

});
