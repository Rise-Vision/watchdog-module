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

Then, supposing watchdog-module is already installed, open another
terminal window and run it:

```bash
node src/index.js
```

At this stage you should see a STARTED event sent to the remote BigQuery table.
