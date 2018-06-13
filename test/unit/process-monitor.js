/* eslint-env mocha */
/* eslint-disable max-statements */
const assert = require("assert");
const simple = require("simple-mock");
const childProc = require("child_process");

const logger = require("../../src/logger");
const starter = require("../../src/starter");
const monitor = require("../../src/process-monitor");

const processFoundStdoutWindows = "...player-electron.asar\\watchdog\\index.js";
const processFoundStdoutLinux = "...player-electron.asar/watchdog/index.js";

const scheduler = fn=>fn();

describe("Process Monitor - Unit", ()=>{
  beforeEach(()=>{
    simple.mock(logger, "external").callFn(console.log);
    simple.mock(starter, "restart").returnWith();
  });

  afterEach(()=>{
    simple.restore()
  });

  it("should do nothing when process is present on linux", () => {
    simple.mock(childProc, "exec").callFn((cmd, opts, cb)=>{
      cb(null, `${cmd} ${processFoundStdoutLinux}`);
    });

    monitor.init(0, scheduler);

    assert.equal(logger.external.callCount, 0);
    assert.equal(starter.restart.callCount, 0);
  });

  it("should do nothing when process is present on windows", () => {
    simple.mock(childProc, "exec").callFn((cmd, opts, cb)=>{
      cb(null, `${processFoundStdoutWindows}`);
    });

    monitor.init(0, scheduler);

    assert.equal(logger.external.callCount, 0);
    assert.equal(starter.restart.callCount, 0);
  });

  it("should log and call restart when not found on linux", () => {
    simple.mock(childProc, "exec").callFn((cmd, opts, cb)=>{
      cb({code: 1}, `${cmd}`);
    });

    monitor.init(0, scheduler);

    assert.equal(logger.external.lastCall.args[0], "no player watchdog");
    assert.equal(logger.external.callCount, 1);
    assert.equal(starter.restart.callCount, 1);
  });

  it("should log and call restart when not found on windows", () => {
    simple.mock(childProc, "exec").callFn((cmd, opts, cb)=>{
      cb({code: 1}, "");
    });

    monitor.init(0, scheduler);

    assert.equal(logger.external.lastCall.args[0], "no player watchdog");
    assert.equal(logger.external.callCount, 1);
    assert.equal(starter.restart.callCount, 1);
  });

  it("should log when there's an unexpected command error on Linux", () => {
    simple.mock(childProc, "exec").callFn((cmd, opts, cb)=>{
      cb({code: 2}, "", "something bad");
    });

    monitor.init(0, scheduler);

    assert.equal(logger.external.lastCall.args[0], "process monitor error");
    assert.equal(logger.external.callCount, 1);
    assert.equal(starter.restart.callCount, 0);
  });

  it("should log and call restart when not found on windows", () => {
    simple.mock(childProc, "exec").callFn((cmd, opts, cb)=>{
      cb({code: 2}, "", "something bad");
    });

    monitor.init(0, scheduler);

    assert.equal(logger.external.lastCall.args[0], "process monitor error");
    assert.equal(logger.external.callCount, 1);
    assert.equal(starter.restart.callCount, 0);
  });

  it("should log when the command fails, even if code is 1", () => {
    simple.mock(childProc, "exec").callFn((cmd, opts, cb)=>{
      cb({
        code: 1,
        stack: "Error: Command failed: wmic process get commandline |findstr asar\\watchdog ERROR: Description = Invalid namespace at ChildProcess.exithandler (child_process.js:223:12)"
      }, "", "");
    });

    monitor.init(0, scheduler);

    assert.equal(logger.external.lastCall.args[0], "process monitor error");
    assert.equal(logger.external.callCount, 1);
    assert.equal(starter.restart.callCount, 0);
  });

  it("should log unexpected state if stdout is empty after successful command", () => {
    simple.mock(childProc, "exec").callFn((cmd, opts, cb)=>{
      cb({code: 0}, "", "");
    });

    monitor.init(0, scheduler);

    assert.equal(logger.external.lastCall.args[0], "process monitor error");
    assert.equal(logger.external.callCount, 1);
    assert.equal(starter.restart.callCount, 0);
  });
});
