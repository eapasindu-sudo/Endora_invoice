// Runs without Electron: store, totals, invoice numbering, backups and the invoice page.
const assert = require('assert'), fs = require('fs'), os = require('os'), path = require('path');
const { Store, totals } = require('../src/store');
const { invoiceHtml } = require('../src/invoice-html');
const { backupNow } = require('../src/backup');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'einv-'));
const s = new Store(dir);
assert.strictEqual(s.all().packages.length, 0); s.loadSamplePackages(); assert.ok(s.all().packages.length >= 13, 'sample packages');
const b = s.upsert('bookings', { client: { name: 'A', phone: '0771234567' }, eventDate: '2027-01-10', items: [{ desc: 'X', qty: 1, price: 100000 }, { desc: 'Y', qty: 2, price: 5000 }], discount: 10000 });
const i1 = s.invoiceFromBooking(b.id), i2 = s.invoiceFromBooking(b.id);
assert.strictEqual(i1.no, 'INV-0001'); assert.strictEqual(i2.no, 'INV-0002');
assert.strictEqual(i1.dueDate, '2027-01-03');
i1.payments = [{ amount: 20000 }]; let t = totals(i1);
assert.deepStrictEqual([t.sub, t.total, t.paid, t.due, t.status], [110000, 100000, 20000, 80000, 'Partly paid']);
i1.payments.push({ amount: 80000 }); assert.strictEqual(totals(i1).status, 'Paid');
const again = new Store(dir); assert.strictEqual(again.all().invoices.length, 2, 'data persists');
assert.ok(invoiceHtml(i1, s.all().settings, '').includes('INV-0001'));
const bdir = fs.mkdtempSync(path.join(os.tmpdir(), 'einvb-'));
for (let k = 0; k < 3; k++) { const r = backupNow(s.file, null, [bdir], 30); assert.ok(r[0].ok); }
assert.ok(fs.readdirSync(path.join(bdir, 'Endora Invoice Backups')).some((f) => f.endsWith('.json')));
console.log('All tests passed');

// price-list PDF import: the text parser
const { parsePackages } = require('../src/pdf-import');
const pk = parsePackages(['WEDDING 2027', 'SILVER PACKAGE', 'Rs. 85,000', '• 1 photographer', 'GOLD PACKAGE', 'Rs. 125,000 /-', '• 2 photographers', '• Album']);
assert.deepStrictEqual(pk.map((p) => [p.name, p.priceHD, p.includes.length]), [['SILVER PACKAGE', 85000, 1], ['GOLD PACKAGE', 125000, 2]]);
console.log('PDF import parser OK');

// licence: trial, activation, expiry, revoke, offline grace
{
  const { Licence } = require('../src/licence');
  const dir = require('fs').mkdtempSync(require('path').join(require('os').tmpdir(), 'lic-'));
  let now = Date.parse('2026-11-01T10:00:00Z'), answer = { ok: true, valid: true, name: 'Test', expires: null };
  const L = new Licence(dir, 'invoice', { trialDays: 14, now: () => now, machine: 'm1', fetch: async () => ({ json: async () => answer }) });
  assert.strictEqual(L.status().state, 'trial'); assert.strictEqual(L.status().daysLeft, 14);
  now += 15 * 86400000; assert.strictEqual(L.status().state, 'none');
  (async () => {
    assert.strictEqual((await L.activate('ewf-inv-aaaa')).state, 'licensed');
    now += 8 * 86400000; assert.strictEqual(L.status().state, 'offline');
    assert.strictEqual((await L.refresh()).state, 'licensed');
    answer = { ok: true, valid: true, expires: '2026-11-25' }; await L.refresh(true);
    now = Date.parse('2026-11-26T10:00:00Z'); assert.strictEqual(L.status().state, 'expired');
    answer = { ok: true, valid: false, reason: 'revoked' }; assert.strictEqual((await L.refresh(true)).state, 'revoked');
    const L2 = new Licence(dir, 'invoice', { now: () => now, machine: 'm1', fetch: async () => ({ json: async () => answer }) });
    assert.strictEqual(L2.s.key, 'EWF-INV-AAAA');
    console.log('Licence OK');
  })().catch((e) => { console.error(e); process.exit(1); });
}
