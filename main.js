'use strict';
const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { Store, totals } = require('./src/store');
const { invoiceHtml } = require('./src/invoice-html');
const { backupNow } = require('./src/backup');

let win, store, pdfDir;
const isMac = process.platform === 'darwin';

if (!app.requestSingleInstanceLock()) app.quit();
app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });

function logoDataUrl() {
  try { return 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, 'renderer', 'logo.png')).toString('base64'); } catch (e) { return ''; }
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 820, minWidth: 1000, minHeight: 640, backgroundColor: '#14100d', title: 'Endora Invoice',
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false },
  });
  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
}

// ---------- PDF ----------
async function makePdf(id) {
  const inv = store.all().invoices.find((x) => x.id === id);
  if (!inv) throw new Error('Invoice not found');
  const html = invoiceHtml(inv, store.all().settings, logoDataUrl());
  const tmp = path.join(app.getPath('temp'), 'endora-invoice-' + inv.id + '.html');
  fs.writeFileSync(tmp, html);
  const w = new BrowserWindow({ show: false, webPreferences: { offscreen: true } });
  await w.loadFile(tmp);
  const pdf = await w.webContents.printToPDF({ pageSize: 'A4', printBackground: true, margins: { top: 0, bottom: 0, left: 0, right: 0 } });
  w.destroy();
  fs.mkdirSync(pdfDir, { recursive: true });
  const name = (inv.no + ' ' + (inv.client.name || '') + (inv.client.partner ? ' & ' + inv.client.partner : '')).replace(/[\\/:*?"<>|]/g, '').trim() + '.pdf';
  const file = path.join(pdfDir, name);
  fs.writeFileSync(file, pdf);
  return file;
}

// ---------- Backups ----------
function runBackup(force) {
  const s = store.all().settings;
  if (!s.backupDirs || !s.backupDirs.length) return [];
  if (!force && s.lastBackup && Date.now() - Date.parse(s.lastBackup) < 20 * 3600 * 1000) return [];
  const r = backupNow(store.file, pdfDir, s.backupDirs, s.backupKeep);
  if (r.some((x) => x.ok)) store.setSettings({ lastBackup: new Date().toISOString() });
  if (win) win.webContents.send('backup-done', r);
  return r;
}

// ---------- Email ----------
async function sendEmail(id) {
  const s = store.all().settings, inv = store.all().invoices.find((x) => x.id === id);
  if (!inv.client.email) throw new Error('This client has no email address.');
  if (!s.smtp.user || !s.smtp.pass) throw new Error('Add your Gmail address and app password in Settings first.');
  const nodemailer = require('nodemailer');
  const file = await makePdf(id);
  const t = totals(inv);
  const tr = nodemailer.createTransport({ host: s.smtp.host, port: Number(s.smtp.port), secure: !!s.smtp.secure, auth: { user: s.smtp.user, pass: s.smtp.pass } });
  await tr.sendMail({
    from: s.smtp.from || `"${s.company.name}" <${s.smtp.user}>`, to: inv.client.email,
    subject: `Invoice ${inv.no} | ${s.company.name}`,
    text: `Dear ${inv.client.name},\n\nPlease find your invoice ${inv.no} attached.\nBalance due: ${s.currency} ${t.due.toLocaleString('en-US')}\n\nBank: ${s.bank.bank} (${s.bank.branch}) – ${s.bank.accName} – ${s.bank.accNo}\n\nThank you!\n${s.company.name}\n${s.company.phone}`,
    attachments: [{ filename: path.basename(file), path: file }],
  });
  return true;
}

// ---------- WhatsApp (opens WhatsApp with the message ready; the PDF is shown in its folder to attach) ----------
async function whatsapp(id) {
  const s = store.all().settings, inv = store.all().invoices.find((x) => x.id === id);
  const file = await makePdf(id);
  const t = totals(inv);
  let ph = String(inv.client.phone || '').replace(/\D/g, '');
  if (ph.startsWith('0')) ph = '94' + ph.slice(1);
  if (ph.length === 9) ph = '94' + ph;
  const msg = `Hi ${inv.client.name} 💍\n\nYour invoice ${inv.no} from ${s.company.name} is attached.\nTotal: ${s.currency} ${t.total.toLocaleString('en-US')}\nBalance due: ${s.currency} ${t.due.toLocaleString('en-US')}\n\n${s.bank.bank} (${s.bank.branch}) – ${s.bank.accName} – ${s.bank.accNo}\n\nAfter paying, please send a photo of the bank slip here. Thank you!`;
  shell.showItemInFolder(file);
  await shell.openExternal((ph ? 'https://wa.me/' + ph : 'https://wa.me/') + '?text=' + encodeURIComponent(msg));
  return file;
}

// ---------- Updates ----------
function setupUpdates() {
  if (!app.isPackaged) return;
  let autoUpdater;
  try { autoUpdater = require('electron-updater').autoUpdater; } catch (e) { return; }
  // Mac builds are not code-signed, so macOS will not let them replace themselves: show a download link instead.
  autoUpdater.autoDownload = !isMac;
  autoUpdater.on('update-available', (i) => win && win.webContents.send('update', { state: isMac ? 'mac' : 'downloading', version: i.version }));
  autoUpdater.on('update-downloaded', (i) => win && win.webContents.send('update', { state: 'ready', version: i.version }));
  autoUpdater.on('error', () => {});
  const check = () => autoUpdater.checkForUpdates().catch(() => {});
  setTimeout(check, 8000);
  setInterval(check, 4 * 3600 * 1000);
  ipcMain.handle('update-install', () => autoUpdater.quitAndInstall());
}

app.whenReady().then(() => {
  store = new Store(app.getPath('userData'));
  pdfDir = path.join(app.getPath('documents'), 'Endora Invoices');

  ipcMain.handle('db', () => store.all());
  ipcMain.handle('version', () => app.getVersion());
  ipcMain.handle('settings', (e, s) => store.setSettings(s));
  ipcMain.handle('upsert', (e, kind, item) => store.upsert(kind, item));
  ipcMain.handle('remove', (e, kind, id) => store.remove(kind, id));
  ipcMain.handle('invoice-from-booking', (e, id) => store.invoiceFromBooking(id));
  ipcMain.handle('replace-packages', (e, list) => store.replacePackages(list));
  ipcMain.handle('pdf', async (e, id) => { const f = await makePdf(id); shell.openPath(f); return f; });
  ipcMain.handle('print', async (e, id) => {
    const inv = store.all().invoices.find((x) => x.id === id);
    const tmp = path.join(app.getPath('temp'), 'endora-print-' + id + '.html');
    fs.writeFileSync(tmp, invoiceHtml(inv, store.all().settings, logoDataUrl()));
    const w = new BrowserWindow({ show: false }); await w.loadFile(tmp);
    w.webContents.print({ printBackground: true }, () => w.destroy());
  });
  ipcMain.handle('email', (e, id) => sendEmail(id));
  ipcMain.handle('whatsapp', (e, id) => whatsapp(id));
  ipcMain.handle('open-pdf-folder', () => { fs.mkdirSync(pdfDir, { recursive: true }); shell.openPath(pdfDir); });
  ipcMain.handle('pick-folder', async () => { const r = await dialog.showOpenDialog(win, { properties: ['openDirectory', 'createDirectory'] }); return r.canceled ? '' : r.filePaths[0]; });
  ipcMain.handle('backup-now', () => runBackup(true));
  ipcMain.handle('restore', async () => {
    const r = await dialog.showOpenDialog(win, { filters: [{ name: 'Endora Invoice backup', extensions: ['json'] }], properties: ['openFile'] });
    if (r.canceled) return false;
    const data = JSON.parse(fs.readFileSync(r.filePaths[0], 'utf8'));
    if (!data.settings || !Array.isArray(data.invoices)) throw new Error('This is not an Endora Invoice backup file.');
    fs.copyFileSync(store.file, store.file + '.before-restore');
    store.db = data; store.save();
    return true;
  });
  ipcMain.handle('open-url', (e, u) => shell.openExternal(u));

  createWindow();
  setupUpdates();
  setTimeout(() => runBackup(false), 15000);
  setInterval(() => runBackup(false), 3600 * 1000);
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('before-quit', () => { try { runBackup(false); } catch (e) {} });
app.on('window-all-closed', () => { if (!isMac) app.quit(); });
