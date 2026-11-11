'use strict';
// Read a price-guide PDF and turn it into packages the user reviews before saving.
// Text PDFs only: a PDF that is a picture (for example exported from Canva as images) has no text to read.

const path = require('path');
const { pathToFileURL } = require('url');

const PRICE = /(?:rs\.?|lkr|රු\.?|\$|usd)\s*([\d][\d,]*(?:\.\d{1,2})?)|\b(\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?)(?:\s*\/-)?|\b(\d{4,7})\s*\/-/gi;
const NAME_WORD = /\b(package|pkg|plan|collection|bundle|gold|silver|platinum|bronze|diamond|basic|standard|premium|deluxe|luxury|classic|signature|essential|elite|royal|full\s*day|half\s*day)\b/i;
const BULLET = /^\s*(?:[-•●▪◦*✓✔➤►>]|\d+[.)])\s*/;

function prices(line) {
  const out = [];
  let m;
  PRICE.lastIndex = 0;
  while ((m = PRICE.exec(line))) {
    const n = Number(String(m[1] || m[2] || m[3]).replace(/,/g, ''));
    if (n >= 1000 && n < 100000000) out.push(n);
  }
  return out;
}

function stripPrice(line) {
  PRICE.lastIndex = 0;
  return line.replace(PRICE, '').replace(/\b(price|only|from|lkr|rs\.?)\b[:\s]*/gi, '').replace(/[\s:|–-]+$/, '').trim();
}

function isNameLine(line) {
  const t = stripPrice(line).replace(BULLET, '');
  if (t.length < 3 || t.length > 45 || /[.:]$/.test(t) || BULLET.test(line)) return false;
  if (NAME_WORD.test(t)) return true;
  const letters = t.replace(/[^A-Za-z]/g, '');
  return letters.length >= 4 && letters === letters.toUpperCase() && t.split(/\s+/).length <= 5;
}

/** lines: array of text lines in reading order. Returns [{ name, includes, priceHD, price4K }]. */
function parsePackages(lines) {
  lines = lines.map((l) => String(l).replace(/\s+/g, ' ').trim()).filter(Boolean);
  let starts = [];
  lines.forEach((l, i) => { if (isNameLine(l)) starts.push(i); });
  // A heading only counts when its block has a price; otherwise it is a section title or an item.
  const blockPrices = (a, b) => lines.slice(a, b).reduce((acc, l) => acc.concat(prices(l)), []);
  starts = starts.filter((s, k) => blockPrices(s, starts[k + 1] ?? lines.length).length);
  if (!starts.length) {
    // no headings: every line with a price ends a package, the line before it is the name
    const out = [];
    let from = 0;
    lines.forEach((l, i) => {
      const p = prices(l);
      if (!p.length) return;
      const own = stripPrice(l);
      const name = own.length >= 3 ? own : (lines[i - 1] || 'Package ' + (out.length + 1));
      out.push({ name, includes: lines.slice(from, own.length >= 3 ? i : i - 1).map((x) => x.replace(BULLET, '')).filter((x) => !prices(x).length), priceHD: p[0], price4K: p[1] || p[0] });
      from = i + 1;
    });
    return out;
  }
  return starts.map((s, k) => {
    const end = starts[k + 1] ?? lines.length;
    const block = lines.slice(s, end);
    const ps = blockPrices(s, end);
    const includes = block.slice(1).filter((l) => {
      const t = stripPrice(l).replace(BULLET, '');
      return t.length >= 2 && !(prices(l).length && t.length < 3);
    }).map((l) => stripPrice(l).replace(BULLET, '')).filter((t) => !/^(price|prices|total|lkr|rs\.?)$/i.test(t));
    return { name: stripPrice(block[0]).replace(BULLET, ''), includes: includes.slice(0, 30), priceHD: ps[0], price4K: ps[1] || ps[0] };
  });
}

/** Text lines from a PDF file, page by page, top to bottom. */
async function pdfLines(file) {
  const base = path.dirname(require.resolve('pdfjs-dist/package.json')).replace('app.asar', 'app.asar.unpacked');
  const pdfjs = await import(pathToFileURL(path.join(base, 'legacy/build/pdf.mjs')).href);
  pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(path.join(base, 'legacy/build/pdf.worker.mjs')).href;
  const data = new Uint8Array(require('fs').readFileSync(file));
  const doc = await pdfjs.getDocument({ data, isEvalSupported: false, useSystemFonts: true }).promise;
  const out = [];
  for (let p = 1; p <= Math.min(doc.numPages, 40); p++) {
    const page = await doc.getPage(p);
    const tc = await page.getTextContent();
    const rows = [];
    for (const it of tc.items) {
      if (!it.str || !it.str.trim()) continue;
      const y = it.transform[5], x = it.transform[4];
      let r = rows.find((q) => Math.abs(q.y - y) < Math.max(3, (it.height || 10) * 0.5));
      if (!r) rows.push((r = { y, parts: [] }));
      r.parts.push({ x, s: it.str });
    }
    rows.sort((a, b) => b.y - a.y);
    for (const r of rows) out.push(r.parts.sort((a, b) => a.x - b.x).map((q) => q.s).join(' ').replace(/\s+/g, ' ').trim());
  }
  await doc.destroy();
  return out;
}

async function importPdf(file) {
  const lines = await pdfLines(file);
  const text = lines.join(' ').replace(/\s/g, '');
  if (text.length < 20) return { ok: false, error: 'This PDF has no text to read. It is probably a picture (for example a Canva design exported as images). Add the packages by hand, or export the PDF again with text.' };
  const list = parsePackages(lines);
  if (!list.length) return { ok: false, error: 'No packages with prices were found in this PDF. Add them by hand with + Add package.' };
  return { ok: true, packages: list };
}

module.exports = { importPdf, parsePackages, prices };
