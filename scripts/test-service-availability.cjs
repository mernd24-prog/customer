const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../src/api/client.js'), 'utf8');
const start = source.indexOf('let serviceUnavailable = false;');
const end = source.indexOf('const FORCE_LOGOUT_CODES');
const events = [];
let resolveProbe, rejectProbe, probes = 0;
const context = {
  navigator: { onLine: true },
  window: { dispatchEvent: event => events.push(event.detail) },
  CustomEvent: function(name, options) { this.detail = options.detail; },
  API_BASE_URL: 'http://test', API_TIMEOUT_MS: 30000,
  axios: { get(url) { assert.equal(url, 'http://test/ready'); probes++; return new Promise((resolve, reject) => { resolveProbe = resolve; rejectProbe = reject; }); } },
};
vm.createContext(context);
vm.runInContext(source.slice(start, end).replace(/export const /g, 'const ') + '\nglobalThis.check = checkBackendAvailability;', context);
(async () => {
  const first = context.check(), second = context.check();
  assert.equal(first, second);
  assert.equal(probes, 1);
  resolveProbe({});
  assert.equal(await first, true);
  assert.equal(events.length, 0, 'healthy backend must not open dialog');
  const failed = context.check();
  rejectProbe({ response: { status: 503 } });
  assert.equal(await failed, false);
  assert.equal(events.at(-1).available, false);
  const recovered = context.check(); resolveProbe({});
  assert.equal(await recovered, true);
  assert.equal(events.at(-1).available, true);
  context.navigator.onLine = false;
  assert.equal(await context.check(), false);
  assert.equal(events.at(-1).kind, 'offline');
  console.log('PASS: readiness coalescing, healthy endpoint, outage, recovery and offline.');
})().catch(error => { console.error(error); process.exitCode = 1; });
