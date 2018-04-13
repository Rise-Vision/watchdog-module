function requestScreenshot() {
  console.log(`${new Date()} - send local-screenshot-request message`);
  return Promise.resolve();
}

module.exports = {
  requestScreenshot
};
