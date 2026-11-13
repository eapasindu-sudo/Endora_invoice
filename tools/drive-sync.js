'use strict';
// Copies the newest installer of every Endora Live Tools app into Google Drive:
//   Endora Live Tools/<App>/<installer>  – a new version is uploaded, older ones are deleted.
// Runs in GitHub Actions (hourly and after each release). Needs the secrets GDRIVE_CLIENT_ID,
// GDRIVE_CLIENT_SECRET and GDRIVE_REFRESH_TOKEN. Writes drive-manifest.json for the download links.
const fs = require('fs');

const CRM = 'https://www.endoraweddingfilms.com/perfex_crm/endora_bridge/shop/';
const APPS = { 'atem-switcher': 'ATEM Web Switcher', 'atem-tally': 'ATEM Tally for DJI RC Pro', 'atem-ccu': 'ATEM CCU', 'cricket-scorer': 'Cricket Scorer', playout: 'Endora Playout + CG Composer', replay: 'Endora Replay', 'led-display': 'Endora LED Display', album: 'Endora Album', invoice: 'Endora Invoice' };
const KEEP = /\.(exe|dmg|apk|msi|pkg)$/i;

let TOKEN = '';
async function token() {
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: process.env.GDRIVE_CLIENT_ID, client_secret: process.env.GDRIVE_CLIENT_SECRET, refresh_token: process.env.GDRIVE_REFRESH_TOKEN, grant_type: 'refresh_token' }) });
  const j = await r.json();
  if (!j.access_token) throw new Error('Google sign-in failed: ' + JSON.stringify(j));
  TOKEN = j.access_token;
}
async function g(path, opt = {}) {
  const r = await fetch('https://www.googleapis.com/drive/v3/' + path, { ...opt, headers: { Authorization: 'Bearer ' + TOKEN, ...(opt.headers || {}) } });
  if (!r.ok && r.status !== 204) throw new Error(path + ' ' + r.status + ' ' + (await r.text()));
  return r.status === 204 ? {} : r.json();
}
const q = (s) => encodeURIComponent(s);
async function folder(name, parent) {
  const found = await g(`files?q=${q(`name='${name.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.folder' and trashed=false` + (parent ? ` and '${parent}' in parents` : ''))}&fields=files(id)`);
  if (found.files.length) return found.files[0].id;
  const f = await g('files?fields=id', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder', parents: parent ? [parent] : undefined }) });
  await g(`files/${f.id}/permissions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: 'reader', type: 'anyone' }) });
  return f.id;
}
async function upload(parent, name, url) {
  const src = await fetch(url, { headers: { 'User-Agent': 'endora-drive-sync' } });
  if (!src.ok) throw new Error('download ' + url + ' ' + src.status);
  const buf = Buffer.from(await src.arrayBuffer());
  const start = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id', { method: 'POST', headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json', 'X-Upload-Content-Length': String(buf.length) }, body: JSON.stringify({ name, parents: [parent] }) });
  if (!start.ok) throw new Error('upload start ' + start.status + ' ' + (await start.text()));
  const put = await fetch(start.headers.get('location'), { method: 'PUT', headers: { 'Content-Length': String(buf.length) }, body: buf });
  if (!put.ok) throw new Error('upload ' + put.status + ' ' + (await put.text()));
  return (await put.json()).id;
}
async function installers(app) {
  const j = await (await fetch(CRM + 'download?p=' + app)).json();
  const url = String(j.url || '');
  // Mac build published beside a Windows one on our own server
  let extra = [];
  try { const m = await (await fetch(CRM + 'download?p=' + app + '&mac=1')).json(); if (m.url && m.url !== url && !/github\.com/.test(m.url)) extra = [{ name: decodeURIComponent(m.url.split('/').pop().split('?')[0]), url: m.url }]; } catch (e) {}
  const m = url.match(/^https:\/\/github\.com\/([^/]+\/[^/]+)\/releases\/latest/);
  if (!m) return (url ? [{ name: decodeURIComponent(url.split('/').pop().split('?')[0]), url }] : []).concat(extra);
  const rel = await (await fetch(`https://api.github.com/repos/${m[1]}/releases/latest`, { headers: { 'User-Agent': 'endora-drive-sync' } })).json();
  return (rel.assets || []).filter((a) => KEEP.test(a.name)).map((a) => ({ name: a.name, url: a.browser_download_url }));
}

(async () => {
  await token();
  const root = await folder('Endora Live Tools');
  const manifest = { updated: new Date().toISOString(), root, apps: {} };
  for (const [app, title] of Object.entries(APPS)) {
    try {
      const want = (await installers(app)).filter((x) => KEEP.test(x.name));
      if (!want.length) { console.log(app, 'no installer link'); continue; }
      const dir = await folder(title, root);
      const have = (await g(`files?q=${q(`'${dir}' in parents and trashed=false`)}&fields=files(id,name)&pageSize=100`)).files;
      const files = [];
      for (const w of want) {
        let f = have.find((h) => h.name === w.name);
        if (!f) { console.log(app, 'uploading', w.name); f = { id: await upload(dir, w.name, w.url), name: w.name }; }
        files.push(f);
      }
      for (const h of have) if (!want.some((w) => w.name === h.name)) { console.log(app, 'deleting old', h.name); await g('files/' + h.id, { method: 'DELETE' }); }
      manifest.apps[app] = { folder: dir, files };
    } catch (e) { console.log(app, 'ERROR', e.message); }
  }
  fs.writeFileSync('drive-manifest.json', JSON.stringify(manifest, null, 1));
  console.log(JSON.stringify(manifest, null, 1));
})().catch((e) => { console.error(e.message); process.exit(1); });
