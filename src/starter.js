const childProcess = require("child_process");
const commonConfig = require("common-display-module");
const platform = require("rise-common-electron").platform;
const path = require("path");

function restartPlatform(extraParameters) {
  const commonArgs = ["--unattended", "--skip-countdown"];
  const command = platform.isWindows() ?
    "cmd.exe" :
    path.join(commonConfig.getScriptDir(), "start.sh");
  const args = platform.isWindows() ?
    ["/c", path.join(commonConfig.getScriptDir(), "background.jse"), "start.bat"].concat(commonArgs) :
    commonArgs;

  if (extraParameters) {
    extraParameters.forEach((param)=>{
      args.push(param);
    });
  }

  childProcess.spawn(command, args, {
    detached: true,
    stdio: "ignore"
  }).unref();
}

module.exports = {
  restart(extraParameters) {
    restartPlatform(extraParameters);
  }
};
