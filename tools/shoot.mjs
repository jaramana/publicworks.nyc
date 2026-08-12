/* Screenshot a URL by driving Chrome over the DevTools Protocol.

   Chrome's --screenshot flag fires at the load event, which is far too early
   for a map, and --virtual-time-budget deadlocks MapLibre because its Web
   Worker never advances under virtual time. So instead: open the page, wait
   for the network to go quiet, wait for any loading indicator to disappear,
   then capture.

   Usage: node shoot.mjs <url> <outfile> [width] [height] [waitMs]
*/

import { writeFileSync } from 'node:fs';

const [, , url, out, w = '1200', h = '900', extraWait = '2500'] = process.argv;
const PORT = process.env.CDP_PORT || '9222';

const listTargets = async () =>
  (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();

// Open a fresh tab and connect to it.
const created = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
const wsUrl = created.webSocketDebuggerUrl;
const ws = new WebSocket(wsUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

let id = 0;
const pending = new Map();
const events = [];
ws.onmessage = (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg.result); pending.delete(msg.id); }
  else if (msg.method) events.push(msg);
};
const send = (method, params = {}) =>
  new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await send('Page.enable');
await send('Network.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: +w, height: +h, deviceScaleFactor: 2, mobile: false,
});

await send('Page.navigate', { url });

// Wait for the load event, then for the network to stay quiet for 1.5s.
const deadline = Date.now() + 45000;
let lastActivity = Date.now();
let seenLoad = false;
const watch = setInterval(() => {
  while (events.length) {
    const e = events.shift();
    if (e.method === 'Page.loadEventFired') seenLoad = true;
    if (e.method.startsWith('Network.request') || e.method.startsWith('Network.response')) lastActivity = Date.now();
  }
}, 100);

while (Date.now() < deadline) {
  await sleep(250);
  if (seenLoad && Date.now() - lastActivity > 1500) break;
}
clearInterval(watch);

// Wait for common "loading" affordances to disappear, if the page has one.
await send('Runtime.evaluate', {
  awaitPromise: true,
  expression: `new Promise((res) => {
    const gone = () => !document.body.innerText.match(/Cargando|Loading|Cargando a rede/i);
    if (gone()) return res(true);
    const t0 = Date.now();
    const iv = setInterval(() => {
      if (gone() || Date.now() - t0 > 20000) { clearInterval(iv); res(true); }
    }, 300);
  })`,
});

await sleep(+extraWait);

const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
writeFileSync(out, Buffer.from(data, 'base64'));

await fetch(`http://127.0.0.1:${PORT}/json/close/${created.id}`);
ws.close();
console.log(`${out} ${Buffer.from(data, 'base64').length} bytes`);
process.exit(0);
