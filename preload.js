'use strict';
const { contextBridge, ipcRenderer } = require('electron');
const call = (ch) => (...a) => ipcRenderer.invoke(ch, ...a);
contextBridge.exposeInMainWorld('api', {
  db: call('db'), version: call('version'), settings: call('settings'), upsert: call('upsert'), remove: call('remove'),
  invoiceFromBooking: call('invoice-from-booking'), replacePackages: call('replace-packages'),
  pdf: call('pdf'), print: call('print'), email: call('email'), whatsapp: call('whatsapp'), openPdfFolder: call('open-pdf-folder'),
  pickFolder: call('pick-folder'), backupNow: call('backup-now'), restore: call('restore'), openUrl: call('open-url'),
  installUpdate: call('update-install'), loadSamples: call('load-samples'), importPdf: call('import-pdf'), logoUrl: call('logo-url'), pickLogo: call('pick-logo'),
  on: (ch, fn) => ipcRenderer.on(ch, (e, d) => fn(d)),
});
