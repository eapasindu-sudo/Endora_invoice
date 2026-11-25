(function () {
  var L = {
    en: { lead: "You are invited to the wedding of", dear: "Dear {name},", play: "Play invitation", skip: "Skip to details", sound: "Sound on", mute: "Mute", replay: "Watch again", see: "Open invitation", below: "Details below",
      story: "Our story", events: "The celebrations", gallery: "Moments", map: "Open in Maps", cal: "Add to calendar", rsvp: "Will you join us?", yes: "Yes, I'll be there", no: "Sorry, I can't",
      yourname: "Your name", yourphone: "Your phone number (optional)", howmany: "Attending", note: "A message for the couple (optional)", send: "Send my reply", thanks: "Thank you! Your reply has been sent.", change: "You can change your reply any time.",
      days: "days", hours: "hours", mins: "minutes", secs: "seconds", today: "The day is here", past: "With love, thank you for celebrating with us", pick: "Choose yes or no for each event.",
      by: "Invitation film by", loc: "en-GB", notfound: "This invitation link is not valid. Please check the link you received.", wait: "Sending…", err: "Could not send. Please try again.", music: "Music" },
    si: { lead: "අපේ මංගල උත්සවයට ඔබව ආරාධනා කරමු", dear: "හිතවත් {name},", play: "ආරාධනය නරඹන්න", skip: "විස්තර වෙත යන්න", sound: "ශබ්දය ඇරින්න", mute: "ශබ්දය නවත්වන්න", replay: "නැවත නරඹන්න", see: "ආරාධනය විවෘත කරන්න", below: "විස්තර පහතින්",
      story: "අපේ කතාව", events: "උත්සව", gallery: "මතක", map: "Maps හි විවෘත කරන්න", cal: "Calendar එකට එක් කරන්න", rsvp: "ඔබ පැමිණෙනවාද?", yes: "ඔව්, පැමිණෙනවා", no: "සමාවෙන්න, බැහැ",
      yourname: "ඔබේ නම", yourphone: "ඔබේ දුරකථන අංකය (අවශ්‍ය නම්)", howmany: "පැමිණෙන ගණන", note: "යුවළට පණිවිඩයක් (අවශ්‍ය නම්)", send: "පිළිතුර යවන්න", thanks: "ස්තූතියි! ඔබේ පිළිතුර ලැබුණා.", change: "ඕනෑම වෙලාවක පිළිතුර වෙනස් කළ හැක.",
      days: "දින", hours: "පැය", mins: "මිනිත්තු", secs: "තත්පර", today: "අද ඒ දවසයි", past: "අප සමඟ සතුටු වූ ඔබට ස්තූතියි", pick: "හැම උත්සවයටම ඔව් හෝ නැහැ කියන්න.",
      by: "ආරාධනා චිත්‍රපටය", loc: "si-LK", notfound: "මෙම ආරාධනා සබැඳිය වලංගු නැත. ඔබට ලැබුණු සබැඳිය පරීක්ෂා කරන්න.", wait: "යවමින්…", err: "යවන්න බැරි වුණා. නැවත උත්සාහ කරන්න.", music: "සංගීතය" }
  };

  /* One animated emblem per theme, drawn at the top of the opening card. */
  var ORN = {
    monsoon: '<svg viewBox="0 0 200 110" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.3"><ellipse class="rp r1" cx="100" cy="82" rx="10" ry="3.4"/><ellipse class="rp r2" cx="100" cy="82" rx="10" ry="3.4"/><ellipse class="rp r3" cx="100" cy="82" rx="10" ry="3.4"/></g><path class="drop" d="M100 6c-7 13-7 19 0 23 7-4 7-10 0-23z" fill="currentColor"/><path d="M20 98h160" stroke="currentColor" stroke-width="1" opacity=".35"/></svg>',
    poruwa: '<svg viewBox="0 0 120 150" aria-hidden="true"><defs><radialGradient id="lg"><stop offset="0" stop-color="#ffd37a" stop-opacity=".85"/><stop offset="1" stop-color="#ffd37a" stop-opacity="0"/></radialGradient></defs><circle class="lglow" cx="60" cy="48" r="46" fill="url(#lg)"/><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M32 142h56l-6-10H38z"/><path d="M60 132V88"/><circle cx="60" cy="118" r="5"/><circle cx="60" cy="102" r="4"/><path d="M26 74Q60 106 94 74z" fill="currentColor" fill-opacity=".18"/><path d="M60 92Q34 86 24 66M60 92Q86 86 96 66"/><path d="M19 66h10M91 66h10"/></g><g class="flame"><path d="M60 20C47 40 49 56 60 64 71 56 73 40 60 20z" fill="#ffb23e"/><path d="M60 38C54 48 55 56 60 60 65 56 66 48 60 38z" fill="#fff0b8"/></g><g class="flame f2"><path d="M24 50c-5 8-4 12 0 15 4-3 5-7 0-15z" fill="#ffb23e"/></g><g class="flame f3"><path d="M96 50c-5 8-4 12 0 15 4-3 5-7 0-15z" fill="#ffb23e"/></g></svg>',
    jasmine: '<svg viewBox="0 0 120 120" aria-hidden="true"><g class="bloom">' + [0, 1, 2, 3, 4].map(function (k) { return '<g transform="rotate(' + k * 72 + ' 60 60)"><ellipse class="pt" style="--k:' + k + '" cx="60" cy="32" rx="13" ry="26"/></g>'; }).join('') + '<circle cx="60" cy="60" r="9" class="hub"/><circle cx="60" cy="60" r="3.5" fill="currentColor"/></g></svg>',
    kandyan: '<svg viewBox="0 0 200 200" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.4"><circle class="m1" cx="100" cy="100" r="94" stroke-dasharray="2 7"/><circle cx="100" cy="100" r="82"/><circle class="m2" cx="100" cy="100" r="70" stroke-dasharray="14 5 3 5"/><g class="m3">' + Array.apply(null, Array(12)).map(function (_, k) { return '<path d="M100 38q9 14 0 26q-9-12 0-26z" transform="rotate(' + k * 30 + ' 100 100)"/>'; }).join('') + '</g><circle cx="100" cy="100" r="32"/><circle cx="100" cy="100" r="22" stroke-dasharray="3 4" class="m1"/></g><circle cx="100" cy="100" r="8" fill="currentColor" class="mc"/></svg>',
    nelum: '<svg viewBox="0 0 160 120" aria-hidden="true"><g class="lotus">' + [-72, -48, -24, 24, 48, 72, 0].map(function (a, i) { return '<g transform="rotate(' + a + ' 80 98)"><path class="lp" style="--d:' + (i * 0.16) + 's" d="M80 98C65 74 65 42 80 14c15 28 15 60 0 84z"/></g>'; }).join('') + '</g><g fill="none" stroke="currentColor" stroke-width="1.2" opacity=".6"><ellipse class="wv" cx="80" cy="104" rx="46" ry="6"/><ellipse class="wv w2" cx="80" cy="104" rx="46" ry="6"/></g></svg>'
  };

  var app = document.getElementById('app');
  var parts = location.pathname.split('/').filter(Boolean);
  var slug = (parts[0] || 'demo').toLowerCase(), gt = parts[1] || '';
  try { if (!gt && localStorage.getItem('gt_' + slug)) gt = localStorage.getItem('gt_' + slug); } catch (e) {}

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ics(d) { return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z'; }
  function icsText(s) { return String(s || '').replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n'); }
  function letters(n, base) { return Array.from(n).map(function (ch, i) { return '<x-l style="--i:' + (base + i) + '">' + (ch === ' ' ? '&nbsp;' : esc(ch)) + '</x-l>'; }).join(''); }

  fetch('/c/' + encodeURIComponent(slug) + '.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw 0; return r.json(); })
    .then(function (c) {
      if (!c.events && c.start) { c.events = [{ id: 'e1', title: '', start: c.start, end: c.end, venue: c.venue, address: c.address, map: c.map, note: '' }]; c.sections = ['events', 'countdown', 'rsvp']; }
      if (!gt || typeof api !== 'function' || slug.indexOf('demo') === 0) return [c, null];
      return api('guest', { slug: slug, gt: gt }).then(function (g) { return [c, g && g.known ? g : null]; }).catch(function () { return [c, null]; });
    })
    .then(function (x) { render(x[0], x[1]); })
    .catch(function () { app.innerHTML = '<p class="err">' + L.en.notfound + '</p>'; });

  function render(c, g) {
    var t = L[c.lang] || L.en, theme = c.theme || 'monsoon';
    document.documentElement.setAttribute('data-theme', theme);
    var names = c.names || [], title = names.join(' & ');
    document.title = title + ' – Wedding invitation';
    document.documentElement.lang = c.lang === 'si' ? 'si' : 'en';
    var fd = new Intl.DateTimeFormat(t.loc, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Colombo' });
    var ft = new Intl.DateTimeFormat(t.loc, { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Colombo' });
    var evs = (c.events || []).filter(function (e) { return !g || !g.events.length || g.events.indexOf(e.id) > -1; });
    if (!evs.length) evs = c.events || [];
    var first = evs[0] || { start: new Date().toISOString() };
    var start0 = new Date(first.start);
    var hasVideo = !!c.video, hasMusic = !!c.music && !hasVideo;
    var order = c.sections || ['events', 'countdown', 'rsvp'];

    function evCard(e, i) {
      var s = new Date(e.start), en = e.end ? new Date(e.end) : null;
      return '<article class="ev"><h3>' + esc(e.title || '') + '</h3><p class="date">' + esc(fd.format(s)) + '</p><p class="time">' + esc(ft.format(s)) + (en ? ' – ' + esc(ft.format(en)) : '') + '</p>' +
        (e.venue ? '<p class="venue">' + esc(e.venue) + '</p>' : '') + (e.address ? '<p>' + esc(e.address) + '</p>' : '') + (e.note ? '<p class="evnote">' + esc(e.note) + '</p>' : '') +
        '<div class="btns">' + (e.map ? '<a class="btn" href="' + esc(e.map) + '" target="_blank" rel="noopener">' + t.map + '</a>' : '') + '<button class="btn cal" data-i="' + i + '" type="button">' + t.cal + '</button></div></article>';
    }
    var secHtml = {
      story: function () { return (c.story && c.story.length) ? '<div class="block"><h2>' + t.story + '</h2>' + c.story.map(function (s) { return '<div class="chapter">' + (s.title ? '<h3>' + esc(s.title) + '</h3>' : '') + '<p>' + esc(s.text) + '</p></div>'; }).join('') + '</div>' : ''; },
      events: function () { return '<div class="block"><h2>' + t.events + '</h2>' + evs.map(evCard).join('') + '</div>'; },
      countdown: function () { return '<div class="block"><div class="count" id="count" aria-label="countdown"></div></div>'; },
      gallery: function () { return (c.gallery && c.gallery.length) ? '<div class="block"><h2>' + t.gallery + '</h2><div class="gal">' + c.gallery.map(function (u) { return '<button type="button" class="gi" data-u="' + esc(u) + '"><img loading="lazy" src="' + esc(u) + '" alt=""></button>'; }).join('') + '</div></div>' : ''; },
      rsvp: function () {
        var known = !!g, max = known ? g.max : 4;
        return '<div class="block"><h2>' + t.rsvp + '</h2><form id="rsvp" novalidate>' +
          (known ? '' : '<label for="gname">' + t.yourname + '</label><input id="gname" maxlength="120" autocomplete="name"><label for="gphone">' + t.yourphone + '</label><input id="gphone" inputmode="tel" autocomplete="tel">') +
          evs.map(function (e) { var r = (g && g.rsvp && g.rsvp[e.id]) || {};
            return '<fieldset class="rv" data-e="' + esc(e.id) + '"><legend>' + esc(e.title || '') + '</legend><div class="chips"><label class="chip"><input type="radio" name="s_' + esc(e.id) + '" value="accepted"' + (r.s === 'accepted' ? ' checked' : '') + '><span>' + t.yes + '</span></label><label class="chip"><input type="radio" name="s_' + esc(e.id) + '" value="declined"' + (r.s === 'declined' ? ' checked' : '') + '><span>' + t.no + '</span></label></div>' +
              (max > 1 ? '<label class="cnt">' + t.howmany + ' <select name="n_' + esc(e.id) + '">' + Array.apply(null, Array(max)).map(function (_, k) { return '<option' + ((r.n || max) === k + 1 ? ' selected' : '') + '>' + (k + 1) + '</option>'; }).join('') + '</select></label>' : '') + '</fieldset>'; }).join('') +
          '<label for="gmsg">' + t.note + '</label><textarea id="gmsg" rows="3" maxlength="400">' + esc(g && g.msg || '') + '</textarea>' +
          '<button class="btn fill" type="submit" id="rsend">' + t.send + '</button><p class="msgline" id="rmsg" role="status"></p><p class="note">' + t.change + '</p></form></div>';
      }
    };
    var body = '';
    if (c.message) body += '<div class="block"><p class="msg">' + esc(c.message) + '</p></div>';
    order.forEach(function (k) { if (secHtml[k]) body += secHtml[k](); });
    var greet = g ? '<p class="dear">' + esc(t.dear.replace('{name}', g.name)) + '</p>' : '';
    var n0 = Array.from(names[0] || '').length;

    app.innerHTML =
      '<canvas id="fx" aria-hidden="true"></canvas>' +
      '<section class="stage' + (hasVideo ? ' hasv' : '') + '" id="stage">' +
        (hasVideo ? '<video id="v" playsinline preload="auto"' + (c.poster ? ' poster="' + esc(c.poster) + '"' : '') + ' src="' + esc(c.video) + '"></video>' : '') +
        '<div class="shade"></div>' +
        (hasVideo ? '<div class="hud"><span></span><button id="mute" type="button">' + t.mute + '</button></div><button class="play replay" id="replay" type="button">' + t.replay + '</button>' : '') +
        '<p class="hint">' + t.below + '</p>' +
        '<div class="gate" id="gate"><div class="bars"></div><div class="glow"></div><div class="orn">' + (ORN[theme] || ORN.monsoon) + '</div>' + greet + '<p class="lead">' + t.lead + '</p>' +
          '<h1 class="names" aria-label="' + esc(title) + '"><span aria-hidden="true">' + letters(names[0] || '', 0) + '</span><i aria-hidden="true">&amp;</i><span aria-hidden="true">' + letters(names[1] || '', n0 + 2) + '</span></h1>' +
          '<p class="when">' + esc(fd.format(start0)) + '</p>' +
          '<button class="play" id="open" type="button"><svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2 1l11 6-11 6z"/></svg>' + (hasVideo ? t.play : t.see) + '</button>' +
          (hasVideo ? '<button class="skip" id="skip" type="button">' + t.skip + '</button>' : '') + '</div>' +
      '</section>' +
      '<section class="sheet" id="sheet">' + body + '</section>' +
      (hasMusic ? '<audio id="aud" loop preload="none" src="' + esc(c.music) + '"></audio><button class="mus" id="mus" type="button" aria-label="' + t.music + '">♪</button>' : '') +
      '<div class="lb" id="lb" hidden><img alt=""></div>' +
      '<footer class="foot">' + t.by + ' <a href="https://www.endoraweddingfilms.com" target="_blank" rel="noopener">Endora Wedding Films</a></footer>';

    if (window.startFx) window.startFx(theme);

    /* reveal on scroll */
    var rv = document.querySelectorAll('.sheet .block, .sheet .ev, .sheet .chapter, .sheet .gi');
    if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
      Array.prototype.forEach.call(rv, function (el) { el.classList.add('rv'); io.observe(el); });
    }

    var stage = document.getElementById('stage'), gate = document.getElementById('gate'), v = document.getElementById('v'), aud = document.getElementById('aud');
    function toSheet() { document.getElementById('sheet').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth' }); }
    document.getElementById('open').onclick = function () {
      gate.classList.add('gone');
      if (aud) { var q = aud.play(); if (q && q.catch) q.catch(function () {}); document.getElementById('mus').classList.add('on'); }
      if (!v) { setTimeout(toSheet, 500); return; }
      v.muted = false;
      var p = v.play(); if (p && p.catch) p.catch(function () { v.muted = true; document.getElementById('mute').textContent = t.sound; v.play(); });
    };
    var skip = document.getElementById('skip'); if (skip) skip.onclick = function () { gate.classList.add('gone'); setTimeout(toSheet, 400); };
    if (v) {
      var mb = document.getElementById('mute');
      mb.onclick = function () { v.muted = !v.muted; mb.textContent = v.muted ? t.sound : t.mute; };
      v.addEventListener('ended', function () { stage.classList.add('ended'); });
      document.getElementById('replay').onclick = function () { stage.classList.remove('ended'); v.currentTime = 0; v.play(); };
    }
    var mus = document.getElementById('mus');
    if (mus) mus.onclick = function () { if (aud.paused) { aud.play(); mus.classList.add('on'); } else { aud.pause(); mus.classList.remove('on'); } };

    Array.prototype.forEach.call(document.querySelectorAll('.cal'), function (b) {
      b.onclick = function () {
        var e = evs[+b.getAttribute('data-i')], s = new Date(e.start), en = e.end ? new Date(e.end) : new Date(s.getTime() + 4 * 3600e3);
        var body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Endora Wedding Films//Invitation//EN', 'BEGIN:VEVENT', 'UID:' + slug + '-' + e.id + '@invite.endoraweddingfilms.com', 'DTSTAMP:' + ics(new Date()), 'DTSTART:' + ics(s), 'DTEND:' + ics(en),
          'SUMMARY:' + icsText((e.title || 'Wedding') + ' – ' + title), 'LOCATION:' + icsText([e.venue, e.address].filter(Boolean).join(', ')), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
        var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar' })); a.download = slug + '-' + e.id + '.ics'; document.body.appendChild(a); a.click(); a.remove();
      };
    });

    var lb = document.getElementById('lb');
    Array.prototype.forEach.call(document.querySelectorAll('.gi'), function (b) { b.onclick = function () { lb.querySelector('img').src = b.getAttribute('data-u'); lb.hidden = false; }; });
    lb.onclick = function () { lb.hidden = true; };

    var box = document.getElementById('count');
    if (box) {
      var end0 = first.end ? new Date(first.end) : new Date(start0.getTime() + 4 * 3600e3);
      var tick = function () {
        var ms = start0 - Date.now();
        if (ms <= 0) { box.innerHTML = '<p>' + (Date.now() < end0 ? t.today : t.past) + '</p>'; return; }
        var s = Math.floor(ms / 1000), dd = Math.floor(s / 86400), hh = Math.floor(s % 86400 / 3600), mm = Math.floor(s % 3600 / 60), ss = s % 60;
        box.innerHTML = [[dd, t.days], [hh, t.hours], [mm, t.mins], [ss, t.secs]].map(function (x) { return '<div><b>' + x[0] + '</b><small>' + x[1] + '</small></div>'; }).join('');
      };
      tick(); setInterval(tick, 1000);
    }

    var form = document.getElementById('rsvp');
    if (form) form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var ans = {}, n = 0, msgEl = document.getElementById('rmsg');
      Array.prototype.forEach.call(form.querySelectorAll('.rv'), function (f) {
        var id = f.getAttribute('data-e'), r = form.querySelector('input[name="s_' + id + '"]:checked'); if (!r) return;
        var sel = form.querySelector('select[name="n_' + id + '"]'); ans[id] = { s: r.value, n: sel ? +sel.value : 1 }; n++;
      });
      if (!n) { msgEl.textContent = t.pick; return; }
      var gn = document.getElementById('gname');
      if (gn && !gn.value.trim()) { msgEl.textContent = t.yourname; gn.focus(); return; }
      var b = document.getElementById('rsend'); b.disabled = true; msgEl.textContent = t.wait;
      if (slug.indexOf('demo') === 0) { b.disabled = false; msgEl.textContent = t.thanks; return; }
      api('rsvp', { slug: slug, gt: gt, name: gn ? gn.value : '', phone: document.getElementById('gphone') ? document.getElementById('gphone').value : '', answers: JSON.stringify(ans), msg: document.getElementById('gmsg').value })
        .then(function (r) { b.disabled = false; if (!r.ok) { msgEl.textContent = r.error || t.err; return; } if (r.gt) { gt = r.gt; try { localStorage.setItem('gt_' + slug, r.gt); } catch (e) {} } msgEl.textContent = t.thanks; })
        .catch(function () { b.disabled = false; msgEl.textContent = t.err; });
    });
  }
})();
