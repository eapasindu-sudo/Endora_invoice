'use strict';
// Copies the newest full-site backup from the Endora server to Google Drive ("Endora Site Backups/<date>")
// and deletes Drive backups older than 7 days. Folder is private (not shared).
// Secrets: GDRIVE_CLIENT_ID, GDRIVE_CLIENT_SECRET, GDRIVE_REFRESH_TOKEN, BACKUP_KEY
const fs = require('fs');
const BASE = 'https://www.endoraweddingfilms.com/endora-backup-dl.php';
const KEY = process.env.BACKUP_KEY;
let TOKEN = '';
async function token() {
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: process.env.GDRIVE_CLIENT_ID, client_secret: process.env.GDRIVE_CLIENT_SECRET, refresh_token: process.env.GDRIVE_REFRESH_TOKEN, grant_type: 'refresh_token' }) });
  const j = await r.json();
  if (!j.access_token) throw new Error('Google sign-in failed');
  TOKEN = j.access_token;
}
async function g(path, opt = {}) {
  const r = await fetch('https://www.googleapis.com/drive/v3/' + path, { ...opt, headers: { Authorization: 'Bearer ' + TOKEN, ...(opt.headers || {}) } });
  if (!r.ok && r.status !== 204) throw new Error(path.split('?')[0] + ' ' + r.status + ' ' + (await r.text()));
  return r.status === 204 ? {} : r.json();
}
const q = encodeURIComponent;
async function folder(name, parent) {
  const f = await g(`files?q=${q(`name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false` + (parent ? ` and '${parent}' in parents` : ''))}&fields=files(id)`);
  if (f.files.length) return f.files[0].id;
  return (await g('files?fields=id', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder', parents: parent ? [parent] : undefined }) })).id;
}
async function api(action, extra = '') {
  const r = await fetch(`${BASE}?a=${action}${extra}`, { headers: { 'X-Backup-Key': KEY } });
  if (!r.ok) throw new Error('server ' + action + ' ' + r.status);
  return r;
}
async function upload(parent, name, file, size) {
  const start = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id', { method: 'POST', headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json', 'X-Upload-Content-Length': String(size) }, body: JSON.stringify({ name, parents: [parent] }) });
  if (!start.ok) throw new Error('upload start ' + start.status + ' ' + (await start.text()));
  const loc = start.headers.get('location');
  const fd = fs.openSync(file, 'r');
  const CH = 32 * 1024 * 1024;
  for (let off = 0; off < size; off += CH) {
    const len = Math.min(CH, size - off), buf = Buffer.alloc(len);
    fs.readSync(fd, buf, 0, len, off);
    for (let t = 1; ; t++) {
      const r = await fetch(loc, { method: 'PUT', headers: { 'Content-Length': String(len), 'Content-Range': `bytes ${off}-${off + len - 1}/${size}` }, body: buf });
      if (r.status === 308 || r.ok) break;
      if (t >= 4) throw new Error('upload chunk ' + r.status);
      await new Promise((s) => setTimeout(s, 3000 * t));
    }
  }
  fs.closeSync(fd);
}
(async () => {
  if (!KEY) throw new Error('BACKUP_KEY secret missing');
  await token();
  const info = await (await api('list')).json();
  if (!info.name || !info.files.length) throw new Error('no backup on server');
  const root = await folder('Endora Site Backups');
  const day = info.name.replace(/^backup-/, '');
  const have = await g(`files?q=${q(`name='${day}' and '${root}' in parents and trashed=false`)}&fields=files(id)`);
  if (have.files.length) { console.log('already in Drive', day); }
  else {
    const fid = await folder(day, root);
    for (const f of info.files) {
      const out = '/tmp/' + f.name;
      const r = await api('get', '&f=' + q(f.name));
      await require('stream/promises').pipeline(require('stream').Readable.fromWeb(r.body), fs.createWriteStream(out));
      if (fs.statSync(out).size !== f.size) throw new Error('size mismatch ' + f.name);
      await upload(fid, f.name, out, f.size);
      fs.unlinkSync(out);
      console.log('uploaded', f.name, f.size);
    }
  }
  // keep 7 days
  const cut = Date.now() - 7 * 86400000;
  const all = await g(`files?q=${q(`'${root}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`)}&fields=files(id,name)&pageSize=200`);
  for (const f of all.files) {
    const m = f.name.match(/^(\d{4})-(\d\d)-(\d\d)/);
    if (m && new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00Z`).getTime() < cut) { await g('files/' + f.id, { method: 'DELETE' }); console.log('deleted old', f.name); }
  }
})().catch((e) => { console.error(e.message); process.exit(1); });
