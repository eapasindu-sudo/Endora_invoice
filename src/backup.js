'use strict';
// Copies the data file (and the invoice PDFs) into each backup folder: another drive, a Google Drive folder…
const fs = require('fs');
const path = require('path');

function stamp() { const d = new Date(); return d.toISOString().slice(0, 10) + '_' + String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0'); }

function backupNow(dataFile, pdfDir, dirs, keep) {
  const results = [];
  for (const dir of dirs || []) {
    try {
      const target = path.join(dir, 'Endora Invoice Backups');
      fs.mkdirSync(target, { recursive: true });
      fs.copyFileSync(dataFile, path.join(target, 'endora-invoice-data_' + stamp() + '.json'));
      // PDFs: copy only new / changed ones
      if (pdfDir && fs.existsSync(pdfDir)) {
        const pd = path.join(target, 'Invoices PDF');
        fs.mkdirSync(pd, { recursive: true });
        for (const f of fs.readdirSync(pdfDir)) {
          const s = path.join(pdfDir, f), d = path.join(pd, f);
          if (!fs.existsSync(d) || fs.statSync(d).mtimeMs < fs.statSync(s).mtimeMs) fs.copyFileSync(s, d);
        }
      }
      // keep the newest N data backups
      const old = fs.readdirSync(target).filter((f) => /^endora-invoice-data_.*\.json$/.test(f)).sort().reverse();
      for (const f of old.slice(Math.max(1, keep || 30))) fs.unlinkSync(path.join(target, f));
      results.push({ dir, ok: true });
    } catch (e) {
      results.push({ dir, ok: false, error: e.message });
    }
  }
  return results;
}

module.exports = { backupNow };
