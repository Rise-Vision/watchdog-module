# watchdog-module / Module Monitor
Monitors display modules according to the local module manifest

## Development

Install:

```bash
npm install
```

Unit and integration tests:

```bash
npm run test
```

### Manual testing

A rvplayer install with valid RiseDisplayNetworkII.ini and
module-manifest.json files is needed. Rise Vision Player must not be
running.

Clone local-messaging-module, install and run it:

```bash
git clone https://github.com/Rise-Vision/local-messaging-module.git
npm install
node src/index.js
```

Do the same for logging-module in a different terminal window:

```bash
git clone https://github.com/Rise-Vision/logging-module.git
npm install
node src/index.js
```

Clone, install and run additional modules if desired.

Then, supposing watchdog-module is already installed, open another
terminal window and run it:

```bash
OFFSET=0 WATCH_INTERVAL=1 node src/index.js
```

- OFFSET can be set to 0 to avoid having an initial wait.
- WATCH_INTERVAL can be set to change the interval length, but if set to less
than 5 (minutes) HEARTBEAT events from modules may be lost.

As a result, in the remote BigQuery table 'started', 'watching', 'module-up'
and 'module-down' events will be appended.
