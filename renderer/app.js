'use strict';
/* Endora Invoice – admin panel (no frameworks). All clicks go through data-act handlers. */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const num = (v) => Number(String(v).replace(/[^\d.-]/g, '')) || 0;
let DB = null, VIEW = 'dash', FILTER = '';
const cur = () => DB.settings.currency || 'LKR';
const money = (n) => cur() + ' ' + Number(n || 0).toLocaleString('en-US');
const nice = (d) => { if (!d) return '–'; const x = new Date(d + 'T00:00:00'); return isNaN(x) ? d : x.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); };
const today = () => new Date().toISOString().slice(0, 10);
const EVENT_TYPES = ['Wedding', 'Homecoming', 'Pre-wedding', 'Engagement', 'Social', 'Other event'];
const BSTAT = ['Pencil', 'Confirmed', 'Completed', 'Cancelled'];

function totals(inv) {
  const sub = (inv.items || []).reduce((a, i) => a + num(i.qty) * num(i.price), 0), disc = num(inv.discount), total = Math.max(0, sub - disc);
  const paid = (inv.payments || []).reduce((a, p) => a + num(p.amount), 0), due = Math.max(0, total - paid);
  const status = inv.status === 'Cancelled' ? 'Cancelled' : total > 0 && due === 0 ? 'Paid' : paid > 0 ? 'Partly paid' : inv.status === 'Sent' ? 'Sent' : 'Draft';
  return { sub, disc, total, paid, due, status };
}
const pill = (s) => `<span class="pill p-${esc(String(s).split(' ')[0])}">${esc(s)}</span>`;
function toast(msg, bad) { const t = $('#toast'); t.textContent = msg; t.className = 'toast' + (bad ? ' bad' : ''); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.add('hidden'), 4500); }
async function reload() { DB = await api.db(); render(); }
function modal(html) { $('#mbox').innerHTML = html; $('#modal').classList.remove('hidden'); }
function closeModal() { $('#modal').classList.add('hidden'); }
async function guard(fn) { try { await fn(); } catch (e) { toast(String(e.message || e).replace(/^Error invoking remote method '[^']+': (Error: )?/, ''), true); } }

/* ---------------- Views ---------------- */
function render() {
  $$('#nav a').forEach((a) => a.classList.toggle('on', a.dataset.v === VIEW));
  $('#main').innerHTML = ({ dash, bookings, invoices, packages, settings })[VIEW]();
  if (VIEW === 'bookings' || VIEW === 'invoices') { const f = $('#q'); if (f) { f.value = FILTER; f.focus(); f.setSelectionRange(FILTER.length, FILTER.length); } }
}

function dash() {
  const inv = DB.invoices.map((i) => ({ i, t: totals(i) }));
  const month = today().slice(0, 7);
  const recv = inv.reduce((a, x) => a + x.t.paid, 0);
  const out = inv.filter((x) => x.t.status !== 'Cancelled').reduce((a, x) => a + x.t.due, 0);
  const thisMonth = DB.invoices.reduce((a, i) => a + (i.payments || []).filter((p) => (p.date || '').startsWith(month)).reduce((s, p) => s + num(p.amount), 0), 0);
  const upcoming = DB.bookings.filter((b) => b.eventDate >= today() && b.status !== 'Cancelled').sort((a, b) => a.eventDate.localeCompare(b.eventDate)).slice(0, 8);
  const dueList = inv.filter((x) => x.t.due > 0 && x.t.status !== 'Cancelled').sort((a, b) => (a.i.dueDate || '').localeCompare(b.i.dueDate || '')).slice(0, 8);
  const pencils = DB.bookings.filter((b) => b.status === 'Pencil' && b.pencilUntil && b.pencilUntil < today());
  return `<h1>Dashboard</h1><p class="lead">${esc(DB.settings.company.name)} · ${nice(today())}</p>
  <div class="stats"><div class="card stat"><div class="k">Received this month</div><div class="v g">${money(thisMonth)}</div></div>
  <div class="card stat"><div class="k">Outstanding balance</div><div class="v r">${money(out)}</div></div>
  <div class="card stat"><div class="k">Received (all time)</div><div class="v">${money(recv)}</div></div>
  <div class="card stat"><div class="k">Upcoming events</div><div class="v">${upcoming.length}</div></div></div>
  ${pencils.length ? `<div class="card" style="margin-top:12px;border-color:#6b5520"><b>⚠ Pencil bookings past 7 days:</b> ${pencils.map((b) => esc(b.client.name) + ' (' + nice(b.eventDate) + ')').join(', ')}</div>` : ''}
  <div class="row" style="margin-top:4px"><div><h2>Upcoming events</h2><div class="card">${upcoming.length ? `<table>${upcoming.map((b) => `<tr class="click" data-act="openBooking" data-id="${b.id}"><td><b>${nice(b.eventDate)}</b></td><td>${esc(b.client.name)}${b.client.partner ? ' & ' + esc(b.client.partner) : ''}<div class="muted">${esc(b.eventType)} · ${esc(b.venue || '')}</div></td><td>${pill(b.status)}</td></tr>`).join('')}</table>` : '<span class="muted">No upcoming events.</span>'}</div></div>
  <div><h2>Balances to collect</h2><div class="card">${dueList.length ? `<table>${dueList.map((x) => `<tr class="click" data-act="openInvoice" data-id="${x.i.id}"><td><b>${esc(x.i.no)}</b><div class="muted">${esc(x.i.client.name)}</div></td><td class="muted">due ${nice(x.i.dueDate)}</td><td class="n"><b>${money(x.t.due)}</b></td></tr>`).join('')}</table>` : '<span class="muted">Nothing outstanding.</span>'}</div></div></div>`;
}

function bookings() {
  const q = FILTER.toLowerCase();
  const list = DB.bookings.filter((b) => !q || JSON.stringify([b.client, b.venue, b.eventDate, b.eventType]).toLowerCase().includes(q)).sort((a, b) => (b.eventDate || '').localeCompare(a.eventDate || ''));
  return `<h1>Bookings</h1><p class="lead">Every event you have booked. Make an invoice from any booking.</p>
  <div class="bar"><input id="q" placeholder="Search name, phone, venue, date…" style="max-width:340px" data-in="filter"><span class="sp"></span><button class="btn gold" data-act="newBooking">+ New booking</button></div>
  <div class="card">${list.length ? `<table><tr><th>Event date</th><th>Client</th><th>Event</th><th>Package</th><th class="n">Amount</th><th>Status</th></tr>${list.map((b) => { const t = totals(b); return `<tr class="click" data-act="openBooking" data-id="${b.id}"><td><b>${nice(b.eventDate)}</b></td><td>${esc(b.client.name)}${b.client.partner ? ' & ' + esc(b.client.partner) : ''}<div class="muted">${esc(b.client.phone || '')}</div></td><td>${esc(b.eventType)}<div class="muted">${esc(b.venue || '')}</div></td><td>${esc((b.items || [])[0] ? b.items[0].desc : '')}</td><td class="n">${money(t.total)}</td><td>${pill(b.status)}</td></tr>`; }).join('')}</table>` : '<p class="muted">No bookings yet. Press <b>+ New booking</b>.</p>'}</div>`;
}

function invoices() {
  const q = FILTER.toLowerCase();
  const list = DB.invoices.filter((i) => !q || JSON.stringify([i.no, i.client, i.eventDate]).toLowerCase().includes(q)).sort((a, b) => (b.no || '').localeCompare(a.no || ''));
  return `<h1>Invoices</h1><p class="lead">Make PDFs, record payments and send invoices by WhatsApp or email.</p>
  <div class="bar"><input id="q" placeholder="Search invoice no, client…" style="max-width:340px" data-in="filter"><span class="sp"></span><button class="btn" data-act="pdfFolder">Open PDF folder</button></div>
  <div class="card">${list.length ? `<table><tr><th>No</th><th>Date</th><th>Client</th><th>Event</th><th class="n">Total</th><th class="n">Balance</th><th>Status</th></tr>${list.map((i) => { const t = totals(i); return `<tr class="click" data-act="openInvoice" data-id="${i.id}"><td><b>${esc(i.no)}</b></td><td>${nice(i.date)}</td><td>${esc(i.client.name)}${i.client.partner ? ' & ' + esc(i.client.partner) : ''}</td><td>${esc(i.eventType || '')}<div class="muted">${nice(i.eventDate)}</div></td><td class="n">${money(t.total)}</td><td class="n">${money(t.due)}</td><td>${pill(t.status)}</td></tr>`; }).join('')}</table>` : '<p class="muted">No invoices yet. Open a booking and press <b>Make invoice</b>.</p>'}</div>`;
}

function packages() {
  const groups = [...new Set(DB.packages.map((p) => p.group))];
  return `<h1>Packages</h1><p class="lead">Your price list. Bookings pick from here and fill the invoice by themselves.</p>
  <div class="bar"><span class="sp"></span><button class="btn gold" data-act="editPackage">+ Add package</button></div>
  ${groups.map((g) => `<h2>${esc(g)}</h2><div class="pk">${DB.packages.filter((p) => p.group === g).map((p) => `<div class="card" style="${p.active === false ? 'opacity:.5' : ''}"><div class="grp">${esc(p.group)}${p.active === false ? ' · hidden' : ''}</div><h3>${esc(p.name)}</h3><div class="tag">${esc(p.tagline || '')}${p.hours ? '<br>' + esc(p.hours) : ''}</div><ul>${(p.includes || []).slice(0, 5).map((x) => `<li>${esc(x)}</li>`).join('')}${(p.includes || []).length > 5 ? `<li class="muted">+${p.includes.length - 5} more</li>` : ''}</ul><div class="pr"><span>Full HD ${money(p.priceHD)}</span><span>4K ${money(p.price4K)}</span></div><div style="margin-top:10px"><button class="btn sm" data-act="editPackage" data-id="${p.id}">Edit</button></div></div>`).join('')}</div>`).join('')}
  <h2>Add-ons</h2><div class="card"><table>${DB.addons.map((a) => `<tr><td>${esc(a.name)}</td><td class="n">${money(a.price)}</td><td class="n"><button class="btn sm" data-act="editAddon" data-id="${a.id}">Edit</button></td></tr>`).join('')}</table><div style="margin-top:10px"><button class="btn sm" data-act="editAddon">+ Add-on</button></div></div>`;
}

function settings() {
  const s = DB.settings, c = s.company, b = s.bank;
  const f = (id, label, val, type = 'text') => `<div><label>${label}</label><input id="${id}" type="${type}" value="${esc(val)}"></div>`;
  return `<h1>Settings</h1><p class="lead">Your details on every invoice, backups and email.</p>
  <h2>Company</h2><div class="card"><div class="row">${f('c_name', 'Name', c.name)}${f('c_tag', 'Tagline', c.tagline)}</div><div class="row">${f('c_phone', 'Phone', c.phone)}${f('c_email', 'Email', c.email)}${f('c_web', 'Website', c.website)}</div>${f('c_addr', 'Address', c.address)}</div>
  <h2>Bank</h2><div class="card"><div class="row">${f('b_bank', 'Bank', b.bank)}${f('b_branch', 'Branch', b.branch)}${f('b_name', 'Account name', b.accName)}${f('b_no', 'Account no', b.accNo)}</div></div>
  <h2>Invoices</h2><div class="card"><div class="row">${f('i_pre', 'Invoice number prefix', s.invoicePrefix)}${f('i_next', 'Next number', s.nextInvoiceNo, 'number')}${f('i_cur', 'Currency', s.currency)}${f('i_adv', 'Advance amount', s.advance, 'number')}</div>
  <label>Terms (one per line, printed on every invoice)</label><textarea id="i_terms" rows="5">${esc((s.terms || []).join('\n'))}</textarea></div>
  <h2>Email (Gmail)</h2><div class="card"><p class="muted" style="margin:0">Use a Gmail <b>App password</b> (Google Account → Security → App passwords), not your normal password.</p><div class="row">${f('m_user', 'Gmail address', s.smtp.user)}${f('m_pass', 'App password', s.smtp.pass, 'password')}${f('m_host', 'SMTP server', s.smtp.host)}${f('m_port', 'Port', s.smtp.port, 'number')}</div></div>
  <h2>Backups</h2><div class="card"><p class="muted" style="margin:0">Your data stays on this computer. Once a day (and when you close the app) a copy goes to every folder below: another drive, your Google Drive folder, a USB drive. The newest ${esc(s.backupKeep)} copies are kept.</p>
  <table style="margin-top:8px">${(s.backupDirs || []).map((d, i) => `<tr><td>${esc(d)}</td><td class="n"><button class="btn sm red" data-act="delDir" data-i="${i}">Remove</button></td></tr>`).join('') || '<tr><td class="muted">No backup folder yet.</td></tr>'}</table>
  <div class="bar" style="margin-top:10px"><button class="btn" data-act="addDir">+ Add backup folder</button><button class="btn" data-act="backupNow">Back up now</button><button class="btn" data-act="restore">Restore from a backup…</button><span class="muted">Last backup: ${s.lastBackup ? new Date(s.lastBackup).toLocaleString() : 'never'}</span></div></div>
  <h2>Admin PIN</h2><div class="card"><div class="row">${f('p_pin', 'PIN to open the app (leave empty for none)', s.pin, 'password')}<div></div></div></div>
  <div class="bar" style="margin-top:16px"><button class="btn gold" data-act="saveSettings">Save settings</button></div>`;
}

/* ---------------- Booking form ---------------- */
let EDIT = null;
function bookingForm(b) {
  EDIT = JSON.parse(JSON.stringify(b || { client: {}, eventType: 'Wedding', status: 'Pencil', items: [], discount: 0, quality: 'Full HD' }));
  drawBooking();
}
function drawBooking() {
  const b = EDIT, t = totals(b);
  const pk = DB.packages.filter((p) => p.active !== false);
  modal(`<h1>${b.id ? 'Booking' : 'New booking'}</h1>
  <div class="row"><div><label>Client name *</label><input data-b="client.name" value="${esc(b.client.name)}"></div><div><label>Partner name</label><input data-b="client.partner" value="${esc(b.client.partner)}"></div><div><label>Phone / WhatsApp *</label><input data-b="client.phone" value="${esc(b.client.phone)}"></div><div><label>Email</label><input data-b="client.email" value="${esc(b.client.email)}"></div></div>
  <div class="row"><div><label>Event type</label><select data-b="eventType">${EVENT_TYPES.map((x) => `<option${x === b.eventType ? ' selected' : ''}>${x}</option>`).join('')}</select></div><div><label>Event date *</label><input type="date" data-b="eventDate" value="${esc(b.eventDate)}"></div><div><label>Venue</label><input data-b="venue" value="${esc(b.venue)}"></div><div><label>Status</label><select data-b="status">${BSTAT.map((x) => `<option${x === b.status ? ' selected' : ''}>${x}</option>`).join('')}</select></div></div>
  <div class="row"><div><label>Address (for the invoice)</label><input data-b="client.address" value="${esc(b.client.address)}"></div></div>
  <h2>Package</h2><div class="row"><div style="flex:3"><select id="pkSel"><option value="">— Choose a package to add —</option>${pk.map((p) => `<option value="${p.id}">${esc(p.group)} · ${esc(p.name)} (HD ${money(p.priceHD)} / 4K ${money(p.price4K)})</option>`).join('')}</select></div><div><select id="pkQ"><option${b.quality !== '4K' ? ' selected' : ''}>Full HD</option><option${b.quality === '4K' ? ' selected' : ''}>4K</option></select></div><div style="flex:0 0 auto"><button class="btn" data-act="addPkg">Add</button></div></div>
  <label>Add-ons</label><div class="chips">${DB.addons.map((a) => `<label><input type="checkbox" data-act="toggleAddon" data-id="${a.id}"${(b.items || []).some((i) => i.addonId === a.id) ? ' checked' : ''}> ${esc(a.name)} · ${money(a.price)}</label>`).join('')}</div>
  <h2>Invoice items</h2><table class="items"><tr><th>Description</th><th style="width:70px">Qty</th><th style="width:150px">Price</th><th class="n" style="width:140px">Amount</th><th></th></tr>
  ${(b.items || []).map((i, k) => `<tr><td><input data-it="${k}.desc" value="${esc(i.desc)}">${i.detail ? `<div class="muted" style="font-size:11px;margin-top:3px">${esc(i.detail.split('\n').slice(0, 3).join(' · '))}${i.detail.split('\n').length > 3 ? ' …' : ''}</div>` : ''}</td><td><input data-it="${k}.qty" value="${esc(i.qty)}" type="number"></td><td><input data-it="${k}.price" value="${esc(i.price)}" type="number"></td><td class="n">${money(num(i.qty) * num(i.price))}</td><td><span class="x" data-act="delItem" data-k="${k}">✕</span></td></tr>`).join('')}
  </table><div class="bar" style="margin-top:8px"><button class="btn sm" data-act="addItem">+ Custom line</button><span class="sp"></span><label style="margin:0">Discount</label><input data-b="discount" type="number" value="${esc(b.discount)}" style="width:140px"></div>
  <table class="tot"><tr><td>Subtotal</td><td class="n">${money(t.sub)}</td></tr><tr><td>Discount</td><td class="n">- ${money(t.disc)}</td></tr><tr class="big"><td>Total</td><td class="n">${money(t.total)}</td></tr></table>
  <label>Notes</label><textarea data-b="notes">${esc(b.notes)}</textarea>
  <div class="err" id="bErr"></div>
  <div class="bar" style="margin-top:12px">${b.id ? '<button class="btn red" data-act="delBooking">Delete</button>' : ''}<span class="sp"></span><button class="btn" data-act="close">Cancel</button><button class="btn" data-act="saveBooking">Save</button><button class="btn gold" data-act="saveAndInvoice">Save & make invoice</button></div>
  ${b.invoiceIds && b.invoiceIds.length ? `<p class="muted">Invoices: ${b.invoiceIds.map((id) => { const i = DB.invoices.find((x) => x.id === id); return i ? `<a href="#" data-act="openInvoice" data-id="${id}" style="color:var(--gold)">${esc(i.no)}</a>` : ''; }).join(', ')}</p>` : ''}`);
}
function setPath(o, p, v) { const k = p.split('.'); let x = o; while (k.length > 1) { const a = k.shift(); x[a] = x[a] || {}; x = x[a]; } x[k[0]] = v; }
async function saveBooking() {
  const b = EDIT;
  if (!b.client.name || !b.client.phone || !b.eventDate) { $('#bErr').textContent = 'Add the client name, phone and event date.'; return null; }
  if (b.status === 'Pencil' && !b.pencilUntil) { const d = new Date(); d.setDate(d.getDate() + 7); b.pencilUntil = d.toISOString().slice(0, 10); }
  const clash = DB.bookings.find((x) => x.id !== b.id && x.eventDate === b.eventDate && x.status !== 'Cancelled');
  if (clash && !b._clashOk) { b._clashOk = true; $('#bErr').textContent = `Note: ${clash.client.name} is already booked on this date. Press Save again to keep both.`; return null; }
  delete b._clashOk;
  const saved = await api.upsert('bookings', b);
  EDIT = saved; DB = await api.db();
  return saved;
}

/* ---------------- Invoice view ---------------- */
function invoiceView(id) {
  const i = DB.invoices.find((x) => x.id === id), t = totals(i);
  modal(`<div class="bar"><h1 style="margin:0">${esc(i.no)}</h1>${pill(t.status)}<span class="sp"></span><button class="btn" data-act="close">Close</button></div>
  <div class="row"><div class="card"><div class="muted">Client</div><b>${esc(i.client.name)}${i.client.partner ? ' & ' + esc(i.client.partner) : ''}</b><div>${esc(i.client.phone || '')}</div><div>${esc(i.client.email || '')}</div></div>
  <div class="card"><div class="muted">Event</div><b>${esc(i.eventType || '')}</b><div>${nice(i.eventDate)}</div><div>${esc(i.venue || '')}</div></div>
  <div class="card"><div class="muted">Invoice date / balance due by</div><input type="date" data-inv="date" value="${esc(i.date)}"><input type="date" data-inv="dueDate" value="${esc(i.dueDate)}" style="margin-top:6px"></div></div>
  <h2>Items</h2><table>${(i.items || []).map((x) => `<tr><td>${esc(x.desc)}</td><td class="n">${esc(x.qty)} × ${money(x.price)}</td><td class="n">${money(num(x.qty) * num(x.price))}</td></tr>`).join('')}</table>
  <table class="tot"><tr><td>Subtotal</td><td class="n">${money(t.sub)}</td></tr>${t.disc ? `<tr><td>Discount</td><td class="n">- ${money(t.disc)}</td></tr>` : ''}<tr class="big"><td>Total</td><td class="n">${money(t.total)}</td></tr><tr><td>Paid</td><td class="n">${money(t.paid)}</td></tr><tr class="big"><td>Balance</td><td class="n">${money(t.due)}</td></tr></table>
  <h2>Payments</h2><table>${(i.payments || []).map((p, k) => `<tr><td>${nice(p.date)}</td><td>${esc(p.method)}${p.note ? ' · ' + esc(p.note) : ''}</td><td class="n">${money(p.amount)}</td><td class="n"><span class="x" data-act="delPay" data-k="${k}" style="color:var(--red);cursor:pointer">✕</span></td></tr>`).join('') || '<tr><td class="muted">No payments yet.</td></tr>'}</table>
  <div class="row" style="margin-top:8px"><div><label>Date</label><input type="date" id="payD" value="${today()}"></div><div><label>Amount</label><input type="number" id="payA" value="${t.paid ? t.due : Math.min(DB.settings.advance || 0, t.due) || t.due}"></div><div><label>Method</label><select id="payM"><option>Bank transfer</option><option>Cash</option><option>Card</option><option>Online</option></select></div><div><label>Note</label><input id="payN" placeholder="Advance / balance / slip no"></div><div style="flex:0 0 auto;align-self:flex-end"><button class="btn" data-act="addPay">+ Record payment</button></div></div>
  <label>Notes on the invoice</label><textarea data-inv="notes">${esc(i.notes)}</textarea>
  <div class="bar" style="margin-top:14px"><button class="btn red" data-act="delInvoice">Delete</button><button class="btn" data-act="cancelInvoice">${i.status === 'Cancelled' ? 'Un-cancel' : 'Cancel invoice'}</button><span class="sp"></span>
  <button class="btn" data-act="pdf">PDF</button><button class="btn" data-act="print">Print</button><button class="btn" data-act="email">Email</button><button class="btn gold" data-act="wa">WhatsApp</button></div>`);
  modal.inv = i;
}
async function saveInv(patch) { const i = Object.assign(modal.inv, patch || {}); modal.inv = await api.upsert('invoices', i); DB = await api.db(); }

/* ---------------- Package / add-on editors ---------------- */
function packageForm(id) {
  const p = DB.packages.find((x) => x.id === id) || { group: 'Wedding', name: '', tagline: '', hours: '', moments: [], includes: [], delivery: [], priceHD: 0, price4K: 0, active: true };
  modal.pk = p;
  modal(`<h1>${id ? 'Edit package' : 'New package'}</h1><div class="row"><div><label>Group</label><input id="pk_g" value="${esc(p.group)}" list="grps"><datalist id="grps">${[...new Set(DB.packages.map((x) => x.group))].map((g) => `<option>${esc(g)}</option>`).join('')}</datalist></div><div style="flex:2"><label>Name</label><input id="pk_n" value="${esc(p.name)}"></div></div>
  <div class="row"><div style="flex:2"><label>Tagline</label><input id="pk_t" value="${esc(p.tagline)}"></div><div><label>Coverage hours</label><input id="pk_h" value="${esc(p.hours)}"></div></div>
  <div class="row"><div><label>Moments we capture (one per line)</label><textarea id="pk_m" rows="6">${esc((p.moments || []).join('\n'))}</textarea></div><div><label>Your film includes (one per line)</label><textarea id="pk_i" rows="6">${esc((p.includes || []).join('\n'))}</textarea></div><div><label>Delivery (one per line)</label><textarea id="pk_d" rows="6">${esc((p.delivery || []).join('\n'))}</textarea></div></div>
  <div class="row"><div><label>Full HD price</label><input id="pk_hd" type="number" value="${esc(p.priceHD)}"></div><div><label>4K price</label><input id="pk_4k" type="number" value="${esc(p.price4K)}"></div><div><label>Note</label><input id="pk_note" value="${esc(p.note || '')}"></div><div><label>Show in bookings</label><select id="pk_a"><option value="1"${p.active !== false ? ' selected' : ''}>Yes</option><option value="0"${p.active === false ? ' selected' : ''}>No (hidden)</option></select></div></div>
  <div class="bar" style="margin-top:14px">${id ? '<button class="btn red" data-act="delPackage">Delete</button>' : ''}<span class="sp"></span><button class="btn" data-act="close">Cancel</button><button class="btn gold" data-act="savePackage">Save package</button></div>`);
}
function addonForm(id) {
  const a = DB.addons.find((x) => x.id === id) || { name: '', price: 0 };
  modal.ad = a;
  modal(`<h1>${id ? 'Edit add-on' : 'New add-on'}</h1><div class="row"><div style="flex:3"><label>Name</label><input id="ad_n" value="${esc(a.name)}"></div><div><label>Price</label><input id="ad_p" type="number" value="${esc(a.price)}"></div></div>
  <div class="bar" style="margin-top:14px">${id ? '<button class="btn red" data-act="delAddon">Delete</button>' : ''}<span class="sp"></span><button class="btn" data-act="close">Cancel</button><button class="btn gold" data-act="saveAddon">Save</button></div>`);
}
const lines = (s) => s.split('\n').map((x) => x.trim()).filter(Boolean);
const pkgDetail = (p) => [p.hours].concat(p.includes || []).concat(p.delivery || []).filter(Boolean).join('\n');

/* ---------------- Actions ---------------- */
const ACT = {
  close: closeModal,
  newBooking: () => bookingForm(null),
  openBooking: (el) => bookingForm(DB.bookings.find((x) => x.id === el.dataset.id)),
  openInvoice: (el) => invoiceView(el.dataset.id),
  addPkg: () => {
    const p = DB.packages.find((x) => x.id === $('#pkSel').value); if (!p) return;
    const q = $('#pkQ').value; EDIT.quality = q;
    EDIT.items.unshift({ desc: `${p.name} – ${p.group} package (${q})`, detail: pkgDetail(p), qty: 1, price: q === '4K' ? p.price4K : p.priceHD, packageId: p.id });
    if (EDIT.eventType === 'Wedding' && p.group !== 'Wedding' && EVENT_TYPES.includes(p.group)) EDIT.eventType = p.group;
    drawBooking();
  },
  toggleAddon: (el) => {
    const a = DB.addons.find((x) => x.id === el.dataset.id);
    if (el.checked) EDIT.items.push({ desc: a.name, qty: 1, price: a.price, addonId: a.id });
    else EDIT.items = EDIT.items.filter((i) => i.addonId !== a.id);
    drawBooking();
  },
  addItem: () => { EDIT.items.push({ desc: '', qty: 1, price: 0 }); drawBooking(); },
  delItem: (el) => { EDIT.items.splice(+el.dataset.k, 1); drawBooking(); },
  saveBooking: async () => { const s = await saveBooking(); if (s) { closeModal(); toast('Booking saved.'); render(); } },
  saveAndInvoice: async () => { const s = await saveBooking(); if (!s) return; const inv = await api.invoiceFromBooking(s.id); DB = await api.db(); VIEW = 'invoices'; render(); invoiceView(inv.id); toast('Invoice ' + inv.no + ' created.'); },
  delBooking: async () => { if (!confirm('Delete this booking? Its invoices are kept.')) return; await api.remove('bookings', EDIT.id); closeModal(); reload(); },
  addPay: async () => { const a = num($('#payA').value); if (a <= 0) return toast('Enter the amount.', true); modal.inv.payments = (modal.inv.payments || []).concat({ date: $('#payD').value, amount: a, method: $('#payM').value, note: $('#payN').value }); await saveInv(); invoiceView(modal.inv.id); render(); toast('Payment recorded.'); },
  delPay: async (el) => { if (!confirm('Remove this payment?')) return; modal.inv.payments.splice(+el.dataset.k, 1); await saveInv(); invoiceView(modal.inv.id); render(); },
  cancelInvoice: async () => { await saveInv({ status: modal.inv.status === 'Cancelled' ? 'Draft' : 'Cancelled' }); invoiceView(modal.inv.id); render(); },
  delInvoice: async () => { if (!confirm('Delete invoice ' + modal.inv.no + '? This cannot be undone.')) return; await api.remove('invoices', modal.inv.id); closeModal(); reload(); },
  pdf: () => guard(async () => { await api.pdf(modal.inv.id); toast('PDF saved in Documents › Endora Invoices.'); }),
  print: () => guard(() => api.print(modal.inv.id)),
  email: () => guard(async () => { await api.email(modal.inv.id); if (modal.inv.status === 'Draft') await saveInv({ status: 'Sent' }); invoiceView(modal.inv.id); render(); toast('Email sent to ' + modal.inv.client.email); }),
  wa: () => guard(async () => { await api.whatsapp(modal.inv.id); if (modal.inv.status === 'Draft') await saveInv({ status: 'Sent' }); invoiceView(modal.inv.id); render(); toast('WhatsApp opened. Drag the PDF from the folder into the chat.'); }),
  pdfFolder: () => api.openPdfFolder(),
  editPackage: (el) => packageForm(el.dataset.id),
  savePackage: async () => {
    const p = Object.assign(modal.pk, { group: $('#pk_g').value.trim() || 'Other', name: $('#pk_n').value.trim(), tagline: $('#pk_t').value, hours: $('#pk_h').value, moments: lines($('#pk_m').value), includes: lines($('#pk_i').value), delivery: lines($('#pk_d').value), priceHD: num($('#pk_hd').value), price4K: num($('#pk_4k').value), note: $('#pk_note').value, active: $('#pk_a').value === '1' });
    if (!p.name) return toast('Add the package name.', true);
    await api.upsert('packages', p); closeModal(); reload(); toast('Package saved.');
  },
  delPackage: async () => { if (!confirm('Delete ' + modal.pk.name + '?')) return; await api.remove('packages', modal.pk.id); closeModal(); reload(); },
  editAddon: (el) => addonForm(el.dataset.id),
  saveAddon: async () => { const a = Object.assign(modal.ad, { name: $('#ad_n').value.trim(), price: num($('#ad_p').value) }); if (!a.name) return; await api.upsert('addons', a); closeModal(); reload(); },
  delAddon: async () => { if (!confirm('Delete ' + modal.ad.name + '?')) return; await api.remove('addons', modal.ad.id); closeModal(); reload(); },
  saveSettings: async () => {
    const v = (id) => $('#' + id).value;
    await api.settings({
      company: { name: v('c_name'), tagline: v('c_tag'), phone: v('c_phone'), email: v('c_email'), website: v('c_web'), address: v('c_addr') },
      bank: { bank: v('b_bank'), branch: v('b_branch'), accName: v('b_name'), accNo: v('b_no') },
      invoicePrefix: v('i_pre'), nextInvoiceNo: Math.max(1, num(v('i_next'))), currency: v('i_cur') || 'LKR', advance: num(v('i_adv')), terms: lines(v('i_terms')),
      smtp: Object.assign({}, DB.settings.smtp, { user: v('m_user'), pass: v('m_pass'), host: v('m_host') || 'smtp.gmail.com', port: num(v('m_port')) || 465, secure: num(v('m_port')) !== 587 }),
      pin: v('p_pin'),
    });
    await reload(); toast('Settings saved.');
  },
  addDir: async () => { const d = await api.pickFolder(); if (!d) return; await api.settings({ backupDirs: (DB.settings.backupDirs || []).concat(d) }); await reload(); },
  delDir: async (el) => { const l = DB.settings.backupDirs.slice(); l.splice(+el.dataset.i, 1); await api.settings({ backupDirs: l }); await reload(); },
  backupNow: () => guard(async () => { const r = await api.backupNow(); if (!r.length) return toast('Add a backup folder first.', true); toast(r.map((x) => (x.ok ? '✓ ' : '✕ ') + x.dir + (x.error ? ' – ' + x.error : '')).join('\n'), r.some((x) => !x.ok)); reload(); }),
  restore: () => guard(async () => { if (!confirm('Replace all data in the app with a backup file? (The current data is kept as a copy.)')) return; if (await api.restore()) { await reload(); toast('Backup restored.'); } }),
};

document.addEventListener('click', (e) => {
  const n = e.target.closest('#nav a'); if (n) { VIEW = n.dataset.v; FILTER = ''; render(); return; }
  if (e.target.id === 'modal') return closeModal();
  const a = e.target.closest('[data-act]'); if (!a) return;
  if (a.tagName === 'A') e.preventDefault();
  if (a.type === 'checkbox' && a.dataset.act === 'toggleAddon') return;
  if (ACT[a.dataset.act]) ACT[a.dataset.act](a);
});
document.addEventListener('change', (e) => {
  const el = e.target;
  if (el.dataset.act === 'toggleAddon') return ACT.toggleAddon(el);
  if (el.dataset.b) { setPath(EDIT, el.dataset.b, el.dataset.b === 'discount' ? num(el.value) : el.value); if (el.dataset.b === 'discount') drawBooking(); }
  if (el.dataset.it) { const [k, f] = el.dataset.it.split('.'); EDIT.items[+k][f] = f === 'desc' ? el.value : num(el.value); drawBooking(); }
  if (el.dataset.inv) saveInv({ [el.dataset.inv]: el.value }).then(render);
});
document.addEventListener('input', (e) => { if (e.target.dataset.in === 'filter') { FILTER = e.target.value; render(); } });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#modal').classList.contains('hidden')) closeModal(); });

/* ---------------- Start ---------------- */
(async function start() {
  DB = await api.db();
  $('#ver').textContent = 'v' + (await api.version());
  if (DB.settings.pin) {
    $('#lock').classList.remove('hidden'); $('#pinIn').focus();
    $('#pinIn').addEventListener('input', (e) => { if (e.target.value === DB.settings.pin) $('#lock').classList.add('hidden'); else if (e.target.value.length >= DB.settings.pin.length) $('#pinErr').textContent = 'Wrong PIN'; });
  }
  render();
  api.on('update', (u) => {
    const el = $('#upd'); el.classList.remove('hidden');
    if (u.state === 'ready') el.innerHTML = `Version ${esc(u.version)} is ready.<button class="btn sm gold" id="updBtn">Restart & update</button>`;
    else if (u.state === 'mac') el.innerHTML = `Version ${esc(u.version)} is out.<button class="btn sm gold" id="updBtn">Download</button>`;
    else el.textContent = `Downloading version ${u.version}…`;
    const b = $('#updBtn'); if (b) b.onclick = () => u.state === 'ready' ? api.installUpdate() : api.openUrl('https://github.com/eapasindu-sudo/endora-invoice/releases/latest');
  });
  api.on('backup-done', (r) => { if (r.some((x) => !x.ok)) toast('Backup failed for: ' + r.filter((x) => !x.ok).map((x) => x.dir).join(', '), true); });
})();
