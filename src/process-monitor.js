const logger = require("./logger");
const starter = require("./starter");
const childProc = require("child_process");
const defaultWindowsCommand = "wmic process get commandline |findstr asar\\\\watchdog";
const defaultLinuxCommand = "ps -ax |grep asar/watchdog";
const fiveMins = 300000;
const defaultInterval = fiveMins;
const isWindows = process.platform === "win32";
const fiveSeconds = 5000;

module.exports = {
  init(interval = defaultInterval, intervalScheduler = setInterval) {
    const timeoutScheduler = intervalScheduler === setInterval ?
      setTimeout : intervalScheduler;

    intervalScheduler(checkProcess.bind(null, timeoutScheduler), interval);
  }
};

function checkProcess(timeoutScheduler) {
  const command = isWindows ? defaultWindowsCommand : defaultLinuxCommand;
  const options = {
    timeout: fiveSeconds,
    windowsHide: true
  };

  childProc.exec(command, options, (err, stdout, stderr)=>{ // eslint-disable-line max-statements
    const playerNotFound = !stdout.includes("player-electron");
    const localMessagingNotFound = !stdout.includes("local-messaging");
    const found = err === null && !playerNotFound && !localMessagingNotFound;
    const otherCommandError = err && err.code !== 1;
    const stack = err && err.stack;

    if (found) {return;}

    if (otherCommandError || stack && stack.startsWith('Error: Command failed')) { // eslint-disable-line no-mixed-operators
      return logger.external("process monitor error", `${stack} ${stderr}`);
    }

    if (playerNotFound || localMessagingNotFound) {
      const module = playerNotFound ? "player" : "local-messaging";
      logger.external(`no ${module} watchdog`, `restarting | ${stack} ${stderr}`);
      timeoutScheduler(starter.restart, fiveSeconds);
      return;
    }

    logger.external("unexpected state", stdout || stderr);
  });
}
