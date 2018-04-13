function requestScreenshot() {
  console.log('send local-screenshot-request message');
  return Promise.resolve();
}

module.exports = {
  requestScreenshot
};
