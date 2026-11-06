'use strict';
// Invoice as a printable A4 HTML page (Electron turns it into the PDF).
const { totals } = require('./store');

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const money = (n, cur) => cur + ' ' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nice = (d) => { if (!d) return ''; const x = new Date(d + 'T00:00:00'); return isNaN(x) ? d : x.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); };

function invoiceHtml(inv, settings, logoDataUrl) {
  const c = settings.company, b = settings.bank, cur = settings.currency || 'LKR';
  const t = totals(inv);
  const rows = (inv.items || []).map((i) => `<tr><td><b>${esc(i.desc)}</b>${i.detail ? `<div class="d">${esc(i.detail)}</div>` : ''}</td><td class="n">${esc(i.qty)}</td><td class="n">${money(i.price, '')}</td><td class="n">${money((Number(i.qty) || 0) * (Number(i.price) || 0), '')}</td></tr>`).join('');
  const pays = (inv.payments || []).map((p) => `<tr><td>${esc(nice(p.date))}</td><td>${esc(p.method || '')}${p.note ? ' · ' + esc(p.note) : ''}</td><td class="n">${money(p.amount, cur)}</td></tr>`).join('');
  const stamp = t.status === 'Paid' ? '<div class="stamp">PAID</div>' : '';
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(inv.no)}</title><style>
@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;font-family:"Segoe UI",Helvetica,Arial,sans-serif;color:#2a2420;font-size:12px}
.pg{width:210mm;min-height:297mm;padding:16mm 16mm 14mm;position:relative}
.top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #c8a96a;padding-bottom:12px}
.brand{display:flex;gap:12px;align-items:center}.brand img{height:58px}.brand .nm{font-family:Georgia,serif;font-size:21px;letter-spacing:.06em;color:#2a2420}.brand .sub{font-size:10px;letter-spacing:.12em;color:#a88a4d;margin-top:3px}
.co{text-align:right;font-size:11px;line-height:1.6;color:#5b5048}
h1{font-family:Georgia,serif;font-weight:normal;font-size:30px;letter-spacing:.2em;color:#7a1f2b;margin:18px 0 4px}
.meta{display:flex;justify-content:space-between;gap:20px;margin-top:6px}.box{background:#faf6ee;border-radius:8px;padding:10px 12px;flex:1;line-height:1.6}
.box b.l{display:block;font-size:9px;letter-spacing:.2em;color:#a88a4d;text-transform:uppercase;margin-bottom:2px}
table{width:100%;border-collapse:collapse;margin-top:16px}th{background:#2a2420;color:#f4efe6;font-weight:600;text-align:left;padding:8px;font-size:10px;letter-spacing:.12em;text-transform:uppercase}
td{padding:8px;border-bottom:1px solid #eee3d0;vertical-align:top}.n{text-align:right;white-space:nowrap}.d{color:#7d7066;font-size:10.5px;margin-top:3px;white-space:pre-line}
.sum{width:46%;margin-left:auto;margin-top:8px}.sum td{border:none;padding:4px 8px}.sum .tot td{font-size:15px;font-weight:700;border-top:2px solid #c8a96a;padding-top:8px}.sum .due td{background:#7a1f2b;color:#fff;font-weight:700;font-size:14px}
.pay{margin-top:14px}.pay th{background:#efe6d6;color:#2a2420}
.foot{display:flex;gap:16px;margin-top:18px}.foot .box{font-size:10.5px}.terms li{margin-bottom:3px}
.thanks{text-align:center;font-family:Georgia,serif;font-style:italic;color:#a88a4d;margin-top:18px;font-size:14px}
.stamp{position:absolute;top:70mm;right:22mm;border:3px solid #1f7a3f;color:#1f7a3f;font-size:30px;font-weight:800;letter-spacing:.2em;padding:6px 16px;transform:rotate(-12deg);opacity:.8;border-radius:8px}
</style></head><body><div class="pg">${stamp}
<div class="top"><div class="brand">${logoDataUrl ? `<img src="${logoDataUrl}">` : ''}<div><div class="nm">${esc(c.name)}</div>${c.tagline ? `<div class="sub">${esc(c.tagline)}</div>` : ''}</div></div>
<div class="co"><b>${esc(c.name)}</b><br>${esc(c.address)}<br>${esc(c.phone)}<br>${esc(c.email)}<br>${esc(c.website)}</div></div>
<h1>INVOICE</h1>
<div class="meta"><div class="box"><b class="l">Billed to</b><b>${esc(inv.client.name)}${inv.client.partner ? ' &amp; ' + esc(inv.client.partner) : ''}</b><br>${esc(inv.client.phone || '')}${inv.client.email ? '<br>' + esc(inv.client.email) : ''}${inv.client.address ? '<br>' + esc(inv.client.address) : ''}</div>
<div class="box"><b class="l">Event</b>${esc(inv.eventType || '')}<br>${esc(nice(inv.eventDate))}${inv.venue ? '<br>' + esc(inv.venue) : ''}</div>
<div class="box"><b class="l">Invoice</b>No: <b>${esc(inv.no)}</b><br>Date: ${esc(nice(inv.date))}<br>Balance due by: ${esc(nice(inv.dueDate))}</div></div>
<table><tr><th>Description</th><th class="n">Qty</th><th class="n">Price (${esc(cur)})</th><th class="n">Amount (${esc(cur)})</th></tr>${rows}</table>
<table class="sum"><tr><td>Subtotal</td><td class="n">${money(t.sub, cur)}</td></tr>${t.disc ? `<tr><td>Discount</td><td class="n">- ${money(t.disc, cur)}</td></tr>` : ''}<tr class="tot"><td>Total</td><td class="n">${money(t.total, cur)}</td></tr><tr><td>Paid</td><td class="n">${money(t.paid, cur)}</td></tr><tr class="due"><td>Balance due</td><td class="n">${money(t.due, cur)}</td></tr></table>
${pays ? `<table class="pay"><tr><th>Payment date</th><th>Method</th><th class="n">Amount</th></tr>${pays}</table>` : ''}
<div class="foot"><div class="box"><b class="l">Bank details</b>${esc(b.bank)} – ${esc(b.branch)}<br>Account name: ${esc(b.accName)}<br>Account no: <b>${esc(b.accNo)}</b><br><span style="color:#7d7066">Please send the bank slip on WhatsApp after paying.</span></div>
<div class="box"><b class="l">Terms</b><ul class="terms" style="margin:0;padding-left:14px">${(settings.terms || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></div>
${inv.notes ? `<div class="box" style="margin-top:12px"><b class="l">Notes</b>${esc(inv.notes)}</div>` : ''}
<div class="thanks">Thank you for choosing ${esc(c.name)}.</div>
</div></body></html>`;
}

module.exports = { invoiceHtml, money, nice };
