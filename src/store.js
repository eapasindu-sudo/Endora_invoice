'use strict';
// Local data store: one JSON file in the app's data folder, written atomically.
const fs = require('fs');
const path = require('path');
const seed = require('./seed');

const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const today = () => new Date().toISOString().slice(0, 10);

class Store {
  constructor(dir) {
    this.dir = dir;
    this.file = path.join(dir, 'endora-invoice-data.json');
    fs.mkdirSync(dir, { recursive: true });
    if (fs.existsSync(this.file)) {
      this.db = JSON.parse(fs.readFileSync(this.file, 'utf8'));
    } else {
      this.db = { version: 1, settings: JSON.parse(JSON.stringify(seed.settings)), packages: [], addons: [], bookings: [], invoices: [] };
      this.save();
    }
    for (const k of ['packages', 'addons', 'bookings', 'invoices']) this.db[k] = this.db[k] || [];
    this.db.settings = Object.assign(JSON.parse(JSON.stringify(seed.settings)), this.db.settings);
  }

  save() {
    const tmp = this.file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(this.db, null, 1));
    fs.renameSync(tmp, this.file);
  }

  all() { return this.db; }

  setSettings(s) { this.db.settings = Object.assign(this.db.settings, s); this.save(); return this.db.settings; }

  upsert(kind, item) {
    const list = this.db[kind];
    if (!list) throw new Error('Unknown list ' + kind);
    if (!item.id) {
      item.id = uid(kind[0]);
      item.createdAt = new Date().toISOString();
      list.push(item);
    } else {
      const i = list.findIndex((x) => x.id === item.id);
      if (i < 0) list.push(item); else list[i] = Object.assign(list[i], item);
    }
    item.updatedAt = new Date().toISOString();
    this.save();
    return list.find((x) => x.id === item.id);
  }

  remove(kind, id) {
    this.db[kind] = this.db[kind].filter((x) => x.id !== id);
    this.save();
  }

  // Booking → new invoice (copies client and items; numbered in order).
  invoiceFromBooking(bookingId) {
    const b = this.db.bookings.find((x) => x.id === bookingId);
    if (!b) throw new Error('Booking not found');
    const s = this.db.settings;
    const no = s.invoicePrefix + String(s.nextInvoiceNo).padStart(4, '0');
    s.nextInvoiceNo += 1;
    const ev = b.eventDate || today();
    const due = new Date(ev); due.setDate(due.getDate() - 7);
    const inv = {
      no, bookingId, date: today(), dueDate: isNaN(due) ? ev : due.toISOString().slice(0, 10),
      client: Object.assign({}, b.client), eventType: b.eventType, eventDate: b.eventDate, venue: b.venue,
      items: JSON.parse(JSON.stringify(b.items || [])), discount: Number(b.discount) || 0,
      payments: [], notes: '', status: 'Draft',
    };
    const saved = this.upsert('invoices', inv);
    b.invoiceIds = (b.invoiceIds || []).concat(saved.id);
    this.save();
    return saved;
  }

  // First-run setup: optionally add the sample price list (Endora's packages and add-ons).
  loadSamplePackages() { this.db.packages = JSON.parse(JSON.stringify(seed.packages)); this.db.addons = JSON.parse(JSON.stringify(seed.addons)); this.save(); }

  // Replace the package list (e.g. after an import), keeping nothing old.
  replacePackages(list) { this.db.packages = list; this.save(); }
}

function totals(inv) {
  const sub = (inv.items || []).reduce((a, i) => a + (Number(i.qty) || 0) * (Number(i.price) || 0), 0);
  const disc = Number(inv.discount) || 0;
  const total = Math.max(0, sub - disc);
  const paid = (inv.payments || []).reduce((a, p) => a + (Number(p.amount) || 0), 0);
  const due = Math.max(0, total - paid);
  const status = inv.status === 'Cancelled' ? 'Cancelled' : total > 0 && due === 0 ? 'Paid' : paid > 0 ? 'Partly paid' : inv.status === 'Sent' ? 'Sent' : 'Draft';
  return { sub, disc, total, paid, due, status };
}

module.exports = { Store, totals, uid };
