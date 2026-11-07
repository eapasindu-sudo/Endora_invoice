// Screenshots of endoraweddingfilms.com for the booking promo video. Nothing is submitted.
const { chromium } = require('playwright');
const fs = require('fs');
const B = 'https://www.endoraweddingfilms.com';
fs.mkdirSync('out', { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 432, height: 768 }, deviceScaleFactor: 2.5, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' });
  const p = await ctx.newPage();
  const shot = async (n) => { await wait(700); await p.screenshot({ path: `out/${n}.jpg`, type: 'jpeg', quality: 92 }); console.log('shot', n); };
  const full = async (n) => { await wait(500); await p.screenshot({ path: `out/${n}.jpg`, type: 'jpeg', quality: 88, fullPage: true }); console.log('full', n); };
  const reveal = () => p.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-visible', 'visible', 'in')));
  const to = async (sel, off = 80) => { await p.evaluate(([s, o]) => { const e = document.querySelector(s); if (e) window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - o); }, [sel, off]); await wait(900); };
  const safe = async (name, fn) => { try { await fn(); } catch (e) { console.log('skip', name, e.message); } };

  // Home
  await p.goto(B + '/', { waitUntil: 'networkidle', timeout: 90000 }); await wait(4000); await reveal();
  await shot('01_home_hero');
  await safe('date', async () => {
    await to('.date-check'); await shot('02_datecheck');
    const f = await p.$('.date-check__form input[type=date], .date-check__form input');
    const d = new Date(); d.setMonth(d.getMonth() + 9); const iso = d.toISOString().slice(0, 10);
    await f.fill(iso); await shot('03_datecheck_filled');
    await p.click('.date-check__form button[type=submit], .date-check__form button'); await wait(2500); await shot('04_datecheck_result');
  });
  await reveal(); await full('home_full');

  // Pricing + calculator
  await p.goto(B + '/pricing/', { waitUntil: 'networkidle', timeout: 90000 }); await wait(2500); await reveal();
  await shot('05_pricing_top');
  await safe('cards', async () => { await to('.pricing-card, .price-card, [class*=pricing] article, .package', 60); await shot('06_pricing_card'); });
  await safe('calc', async () => {
    await to('#calculator', 20); await shot('07_calc');
    const chips = await p.$$('[data-calc-groups] button, [data-calc-groups] label, [data-calc-groups] input');
    if (chips[0]) { await chips[0].click(); await wait(500); }
    const items = await p.$$('[data-calc-items] button, [data-calc-items] label, [data-calc-items] input');
    if (items[2]) { await items[2].click(); await wait(500); } else if (items[0]) { await items[0].click(); await wait(500); }
    const adds = await p.$$('[data-calc-addons] button, [data-calc-addons] label, [data-calc-addons] input');
    if (adds[0]) { await adds[0].click(); await wait(500); }
    await shot('08_calc_picked');
    await p.evaluate(() => window.scrollBy(0, 420)); await shot('09_calc_total');
  });
  await reveal(); await full('pricing_full');

  // Reserve your date (form filled in, NOT submitted)
  await p.goto(B + '/reserve-your-date/', { waitUntil: 'networkidle', timeout: 90000 }); await wait(2500); await reveal();
  await shot('10_reserve_top');
  await safe('form', async () => {
    await to('[data-bk-form]', 40); await shot('11_form_empty');
    const d = new Date(); d.setMonth(d.getMonth() + 10); d.setDate(14); const iso = d.toISOString().slice(0, 10);
    await p.fill('#bk_wedding_date', iso); await p.dispatchEvent('#bk_wedding_date', 'change'); await wait(2000); await shot('12_form_date');
    await p.fill('#bk_p1', 'Kasun'); await p.fill('#bk_p2', 'Nimesha'); await to('#bk_p1', 140); await shot('13_form_names');
    await p.fill('#bk_email', 'kasun.nimesha@gmail.com'); await p.fill('#bk_phone', '+94 77 123 4567'); await p.fill('#bk_city', 'Kandy'); await p.fill('#bk_venue', 'Earl\'s Regency'); await to('#bk_email', 140); await shot('14_form_contact');
    const sel = await p.$('.bk-pkg-grid select'); if (sel) { const opts = await sel.$$eval('option', (o) => o.map((x) => x.value).filter(Boolean)); if (opts[2] || opts[0]) await sel.selectOption(opts[2] || opts[0]); }
    await to('.bk-pkg-grid', 120); await shot('15_form_package');
    await to('.bk-terms', 300); await shot('16_form_terms');
    await to('[data-bk-submit]', 500); await shot('17_form_submit');
  });
  await full('reserve_full');

  // Reviews, FAQ, sample review page, contact
  for (const [n, u] of [['18_reviews', '/reviews/'], ['19_faq', '/faq/'], ['20_review_form', '/?endora_review=eyJwIjo5OTk5OTksIm4iOiJTYW1wbGUgQ291cGxlIn0.1efbeef118f0a11a3200'], ['21_services', '/services/'], ['22_contact', '/contact/']]) {
    await safe(n, async () => { await p.goto(B + u, { waitUntil: 'networkidle', timeout: 90000 }); await wait(2000); await reveal(); await shot(n); await p.evaluate(() => window.scrollBy(0, 700)); await shot(n + 'b'); });
  }
  await br.close();
})();
