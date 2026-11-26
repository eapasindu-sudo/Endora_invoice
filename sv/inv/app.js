(function () {
  var L = {
    en: { lead: "You are invited to the wedding of", dear: "Dear {name},", play: "Play invitation", skip: "Skip to details", sound: "Sound on", mute: "Mute", replay: "Watch again", see: "Open invitation", below: "Details below",
      story: "Our story", events: "The celebrations", gallery: "Moments", map: "Open in Maps", cal: "Add to calendar", rsvp: "Will you join us?", yes: "Yes, I'll be there", no: "Sorry, I can't",
      yourname: "Your name", yourphone: "Your phone number (optional)", howmany: "Attending", note: "A message for the couple (optional)", send: "Send my reply", thanks: "Thank you! Your reply has been sent.", change: "You can change your reply any time.",
      days: "days", hours: "hours", mins: "minutes", secs: "seconds", today: "The day is here", past: "With love, thank you for celebrating with us", pick: "Choose yes or no for each event.",
       seat: "Find your seat", seatph: "Type your name", seatgo: "Search", seatnone: "We could not find that name yet. Ask a host on the day.", tbl: "Table", seatno: "Seat", yourseat: "Your seat",
      wall: "Share your moments", wallnote: "Leave a wish, a photo or a voice message for the couple.", addphoto: "Add a photo", rec: "Record a voice message", stop: "Stop recording", post: "Post", posted: "Posted. Thank you!", wish: "Your wish", recorded: "Voice message ready",
      album: "Our album", albumbtn: "View the photos", filmbtn: "Watch the wedding film", nowall: "Be the first to share a moment.",
      tap: "Tap to open", tapv: "Tap to play", save: "Save the date", navd: "Details", navm: "Moments", navw: "Wishes", navr: "RSVP", call: "Call us", wa: "Reply on WhatsApp", wahi: "Hi! About the wedding of {couple}:", by: "Invitation film by", loc: "en-GB", notfound: "This invitation link is not valid. Please check the link you received.", wait: "Sending…", err: "Could not send. Please try again.", music: "Music" },
    si: { lead: "අපේ මංගල උත්සවයට ඔබව ආරාධනා කරමු", dear: "හිතවත් {name},", play: "ආරාධනය නරඹන්න", skip: "විස්තර වෙත යන්න", sound: "ශබ්දය ඇරින්න", mute: "ශබ්දය නවත්වන්න", replay: "නැවත නරඹන්න", see: "ආරාධනය විවෘත කරන්න", below: "විස්තර පහතින්",
      story: "අපේ කතාව", events: "උත්සව", gallery: "මතක", map: "Maps හි විවෘත කරන්න", cal: "Calendar එකට එක් කරන්න", rsvp: "ඔබ පැමිණෙනවාද?", yes: "ඔව්, පැමිණෙනවා", no: "සමාවෙන්න, බැහැ",
      yourname: "ඔබේ නම", yourphone: "ඔබේ දුරකථන අංකය (අවශ්‍ය නම්)", howmany: "පැමිණෙන ගණන", note: "යුවළට පණිවිඩයක් (අවශ්‍ය නම්)", send: "පිළිතුර යවන්න", thanks: "ස්තූතියි! ඔබේ පිළිතුර ලැබුණා.", change: "ඕනෑම වෙලාවක පිළිතුර වෙනස් කළ හැක.",
      days: "දින", hours: "පැය", mins: "මිනිත්තු", secs: "තත්පර", today: "අද ඒ දවසයි", past: "අප සමඟ සතුටු වූ ඔබට ස්තූතියි", pick: "හැම උත්සවයටම ඔව් හෝ නැහැ කියන්න.",
       seat: "ඔබේ අසුන සොයන්න", seatph: "ඔබේ නම ලියන්න", seatgo: "සොයන්න", seatnone: "එම නම තවම හමු වුණේ නැහැ. දවසේ දී සත්කාරකයෙකුගෙන් අහන්න.", tbl: "මේසය", seatno: "අසුන", yourseat: "ඔබේ අසුන",
      wall: "ඔබේ මතක බෙදාගන්න", wallnote: "යුවළට සුබපැතුමක්, ඡායාරූපයක් හෝ හඬ පණිවිඩයක් තබන්න.", addphoto: "ඡායාරූපයක් එක් කරන්න", rec: "හඬ පණිවිඩයක් පටිගත කරන්න", stop: "නවත්වන්න", post: "පළ කරන්න", posted: "පළ කළා. ස්තූතියි!", wish: "ඔබේ සුබපැතුම", recorded: "හඬ පණිවිඩය සූදානම්",
      album: "අපේ ඇල්බමය", albumbtn: "ඡායාරූප බලන්න", filmbtn: "මංගල චිත්‍රපටය නරඹන්න", nowall: "පළමුවෙන් මතකයක් බෙදාගන්න.",
      tap: "විවෘත කිරීමට ස්පර්ශ කරන්න", save: "දිනය සටහන් කර ගන්න", navd: "විස්තර", navm: "මතක", navw: "සුබපැතුම්", navr: "පිළිතුර", tapv: "නැරඹීමට ස්පර්ශ කරන්න", call: "අමතන්න", wa: "WhatsApp එකෙන් පිළිතුරු දෙන්න", wahi: "{couple} ගේ මංගල උත්සවය ගැන:", by: "ආරාධනා චිත්‍රපටය", loc: "si-LK", notfound: "මෙම ආරාධනා සබැඳිය වලංගු නැත. ඔබට ලැබුණු සබැඳිය පරීක්ෂා කරන්න.", wait: "යවමින්…", err: "යවන්න බැරි වුණා. නැවත උත්සාහ කරන්න.", music: "සංගීතය" }
  };

  /* One animated emblem per theme, drawn at the top of the opening card. */
  var ORN = {
    monsoon: '<svg viewBox="0 0 200 110" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.3"><ellipse class="rp r1" cx="100" cy="82" rx="10" ry="3.4"/><ellipse class="rp r2" cx="100" cy="82" rx="10" ry="3.4"/><ellipse class="rp r3" cx="100" cy="82" rx="10" ry="3.4"/></g><path class="drop" d="M100 6c-7 13-7 19 0 23 7-4 7-10 0-23z" fill="currentColor"/><path d="M20 98h160" stroke="currentColor" stroke-width="1" opacity=".35"/></svg>',
    poruwa: '<svg viewBox="0 0 120 150" aria-hidden="true"><defs><radialGradient id="lg"><stop offset="0" stop-color="#ffd37a" stop-opacity=".85"/><stop offset="1" stop-color="#ffd37a" stop-opacity="0"/></radialGradient></defs><circle class="lglow" cx="60" cy="48" r="46" fill="url(#lg)"/><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M32 142h56l-6-10H38z"/><path d="M60 132V88"/><circle cx="60" cy="118" r="5"/><circle cx="60" cy="102" r="4"/><path d="M26 74Q60 106 94 74z" fill="currentColor" fill-opacity=".18"/><path d="M60 92Q34 86 24 66M60 92Q86 86 96 66"/><path d="M19 66h10M91 66h10"/></g><g class="flame"><path d="M60 20C47 40 49 56 60 64 71 56 73 40 60 20z" fill="#ffb23e"/><path d="M60 38C54 48 55 56 60 60 65 56 66 48 60 38z" fill="#fff0b8"/></g><g class="flame f2"><path d="M24 50c-5 8-4 12 0 15 4-3 5-7 0-15z" fill="#ffb23e"/></g><g class="flame f3"><path d="M96 50c-5 8-4 12 0 15 4-3 5-7 0-15z" fill="#ffb23e"/></g></svg>',
    jasmine: '<svg viewBox="0 0 120 120" aria-hidden="true"><g class="bloom">' + [0, 1, 2, 3, 4].map(function (k) { return '<g transform="rotate(' + k * 72 + ' 60 60)"><ellipse class="pt" style="--k:' + k + '" cx="60" cy="32" rx="13" ry="26"/></g>'; }).join('') + '<circle cx="60" cy="60" r="9" class="hub"/><circle cx="60" cy="60" r="3.5" fill="currentColor"/></g></svg>',
    kandyan: '<svg viewBox="0 0 200 200" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.4"><circle class="m1" cx="100" cy="100" r="94" stroke-dasharray="2 7"/><circle cx="100" cy="100" r="82"/><circle class="m2" cx="100" cy="100" r="70" stroke-dasharray="14 5 3 5"/><g class="m3">' + Array.apply(null, Array(12)).map(function (_, k) { return '<path d="M100 38q9 14 0 26q-9-12 0-26z" transform="rotate(' + k * 30 + ' 100 100)"/>'; }).join('') + '</g><circle cx="100" cy="100" r="32"/><circle cx="100" cy="100" r="22" stroke-dasharray="3 4" class="m1"/></g><circle cx="100" cy="100" r="8" fill="currentColor" class="mc"/></svg>',
    nelum: '<svg viewBox="0 0 160 120" aria-hidden="true"><g class="lotus">' + [-72, -48, -24, 24, 48, 72, 0].map(function (a, i) { return '<g transform="rotate(' + a + ' 80 98)"><path class="lp" style="--d:' + (i * 0.16) + 's" d="M80 98C65 74 65 42 80 14c15 28 15 60 0 84z"/></g>'; }).join('') + '</g><g fill="none" stroke="currentColor" stroke-width="1.2" opacity=".6"><ellipse class="wv" cx="80" cy="104" rx="46" ry="6"/><ellipse class="wv w2" cx="80" cy="104" rx="46" ry="6"/></g></svg>'
  };

  ORN.blush = (function () {
    var cx = 80, cy = 62, r = 42, g = '';
    for (var k = 0; k < 8; k++) {
      var th = 75 - k * 21, rad = th * Math.PI / 180, x = cx + r * Math.cos(rad), y = cy + r * Math.sin(rad);
      g += '<ellipse class="lf" style="--k:' + k + '" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="4.6" ry="10" transform="rotate(' + (th + 28) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"/>';
      g += '<ellipse class="lf in2" style="--k:' + k + '" cx="' + (cx + (r - 9) * Math.cos(rad)).toFixed(1) + '" cy="' + (cy + (r - 9) * Math.sin(rad)).toFixed(1) + '" rx="3.4" ry="7" transform="rotate(' + (th - 24) + ' ' + (cx + (r - 9) * Math.cos(rad)).toFixed(1) + ' ' + (cy + (r - 9) * Math.sin(rad)).toFixed(1) + ')"/>';
    }
    var a = function (d) { var rr = d * Math.PI / 180; return (cx + r * Math.cos(rr)).toFixed(1) + ' ' + (cy + r * Math.sin(rr)).toFixed(1); };
    var side = '<path class="stem" d="M' + a(80) + ' A' + r + ' ' + r + ' 0 0 0 ' + a(-78) + '" fill="none" stroke="currentColor" stroke-width="1.2"/>' + g;
    return '<svg viewBox="0 0 160 124" aria-hidden="true"><g>' + side + '</g><g transform="translate(160 0) scale(-1 1)">' + side + '</g><path d="M80 112l5 6-5 6-5-6z" fill="currentColor"/></svg>';
  })();

  ORN.mangalam = '';

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
    var lang = c.lang; try { var ls = localStorage.getItem('inv_lang'); if (ls && L[ls]) lang = ls; } catch (e) {}
    var t = L[lang] || L.en, theme = c.theme || 'monsoon';
    document.documentElement.setAttribute('data-theme', theme);
    var names = c.names || [], title = names.join(' & ');
    document.title = title + ' – Wedding invitation';
    document.documentElement.lang = L[lang] ? lang : 'en';
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
      events: function () { return '<div class="block" id="b-events"><h2>' + t.events + '</h2>' + evs.map(evCard).join('') + '</div>'; },
      countdown: function () { return '<div class="block"><div class="count" id="count" aria-label="countdown"></div></div>'; },
      gallery: function () { return (c.gallery && c.gallery.length) ? '<div class="block" id="b-gallery"><h2>' + t.gallery + '</h2><div class="gal">' + c.gallery.map(function (u) { return '<button type="button" class="gi" data-u="' + esc(u) + '"><img loading="lazy" src="' + esc(u) + '" alt=""></button>'; }).join('') + '</div></div>' : ''; },
      seat: function () {
        var mine = g && g.tbl ? '<div class="seatcard"><small>' + t.yourseat + '</small><b>' + t.tbl + ' ' + esc(g.tbl) + (g.seat ? ' · ' + t.seatno + ' ' + esc(g.seat) : '') + '</b></div>' : '';
        return '<div class="block" id="b-seat"><h2>' + t.seat + '</h2>' + mine + '<form id="seatf" class="inl"><input id="seatq" placeholder="' + t.seatph + '" autocomplete="off" aria-label="' + t.seatph + '"><button class="btn" type="submit">' + t.seatgo + '</button></form><div id="seatres" aria-live="polite"></div></div>';
      },
      wall: function () {
        return '<div class="block" id="b-wall"><h2>' + t.wall + '</h2><p class="note">' + t.wallnote + '</p><form id="wallf" novalidate>' +
          '<input id="wname" maxlength="80" placeholder="' + t.yourname + '" value="' + esc(g ? g.name : '') + '" aria-label="' + t.yourname + '"><textarea id="wtext" rows="3" maxlength="500" placeholder="' + t.wish + '" aria-label="' + t.wish + '"></textarea>' +
          '<div class="btns"><label class="btn" for="wphoto">' + t.addphoto + '</label><input id="wphoto" type="file" accept="image/*" hidden>' + (window.MediaRecorder ? '<button class="btn" type="button" id="wrec">' + t.rec + '</button>' : '') + '</div>' +
          '<p class="note" id="wchosen"></p><button class="btn fill" type="submit" id="wsend">' + t.post + '</button><p class="msgline" id="wmsg" role="status"></p></form><div id="wfeed" class="feed"></div></div>';
      },
      album: function () {
        var a = c.album || {};
        if (!a.url && !a.film) return '';
        return '<div class="block"><h2>' + t.album + '</h2>' + (a.note ? '<p class="msg" style="font-size:20px">' + esc(a.note) + '</p>' : '') + '<div class="btns">' + (a.url ? '<a class="btn fill" href="' + esc(a.url) + '" target="_blank" rel="noopener">' + t.albumbtn + '</a>' : '') + (a.film ? '<a class="btn" href="' + esc(a.film) + '" target="_blank" rel="noopener">' + t.filmbtn + '</a>' : '') + '</div></div>';
      },
      rsvp: function () {
        var known = !!g, max = known ? g.max : 4;
        return '<div class="block" id="b-rsvp"><h2>' + t.rsvp + '</h2><form id="rsvp" novalidate>' +
          (known ? '' : '<label for="gname">' + t.yourname + '</label><input id="gname" maxlength="120" autocomplete="name"><label for="gphone">' + t.yourphone + '</label><input id="gphone" inputmode="tel" autocomplete="tel">') +
          evs.map(function (e) { var r = (g && g.rsvp && g.rsvp[e.id]) || {};
            return '<fieldset class="rv" data-e="' + esc(e.id) + '"><legend>' + esc(e.title || '') + '</legend><div class="chips"><label class="chip"><input type="radio" name="s_' + esc(e.id) + '" value="accepted"' + (r.s === 'accepted' ? ' checked' : '') + '><span>' + t.yes + '</span></label><label class="chip"><input type="radio" name="s_' + esc(e.id) + '" value="declined"' + (r.s === 'declined' ? ' checked' : '') + '><span>' + t.no + '</span></label></div>' +
              (max > 1 ? '<label class="cnt">' + t.howmany + ' <select name="n_' + esc(e.id) + '">' + Array.apply(null, Array(max)).map(function (_, k) { return '<option' + ((r.n || max) === k + 1 ? ' selected' : '') + '>' + (k + 1) + '</option>'; }).join('') + '</select></label>' : '') + '</fieldset>'; }).join('') +
          '<label for="gmsg">' + t.note + '</label><textarea id="gmsg" rows="3" maxlength="400">' + esc(g && g.msg || '') + '</textarea>' +
          '<button class="btn fill" type="submit" id="rsend">' + t.send + '</button>' + (c.rsvp_phone ? '<a class="btn" style="margin-top:12px;width:100%" target="_blank" rel="noopener" href="https://wa.me/' + esc(c.rsvp_phone) + '?text=' + encodeURIComponent(t.wahi.replace('{couple}', title)) + '">' + t.wa + '</a><a class="btn" style="margin-top:12px;width:100%" href="tel:+' + esc(c.rsvp_phone) + '">' + t.call + '</a>' : '') + '<p class="msgline" id="rmsg" role="status"></p><p class="note">' + t.change + '</p></form></div>';
      }
    };
    var body = '';
    if (c.message) body += '<div class="block"><p class="msg">' + esc(c.message) + '</p></div>';
    order.forEach(function (k) { if (secHtml[k]) body += secHtml[k](); });
    if (c.gallery && c.gallery.length) body = '<div class="hero"><img src="' + esc(c.gallery[0]) + '" alt=""></div>' + body;
    var sd = new Intl.DateTimeFormat(t.loc, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Colombo' }).format(start0);
    body += '<div class="block savedate"><p class="sdl">' + t.save + '</p><p class="date">' + esc(sd) + '</p><p class="sdn">' + esc(title) + '</p></div>';
    if (theme === 'mangalam') {
      var pc = c.parents || {}, dv = {}, ENG = { timeZone: 'Asia/Colombo' };
      new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Colombo' }).formatToParts(start0).forEach(function (x) { dv[x.type] = x.value; });
      var up = function (s) { return esc(String(s || '').toUpperCase()); };
      var ord = function (d) { d = +d; var s = (d % 10 == 1 && d != 11) ? 'st' : (d % 10 == 2 && d != 12) ? 'nd' : (d % 10 == 3 && d != 13) ? 'rd' : 'th'; return d + '<sup>' + s + '</sup>'; };
      var wdn = new Intl.DateTimeFormat('en-GB', { weekday: 'long', timeZone: 'Asia/Colombo' }).format(start0);
      var cardH = '<div class="block mg-card"><h1>SRI SUBA MANGALAM !</h1><p class="mg-s">YOU ARE INVITED TO<br>THE WEDDING OF</p><span class="mg-dia"></span>' +
        '<p class="mg-n">' + up(names[0]) + '</p><p class="mg-and">&amp;</p><p class="mg-n">' + up(names[1]) + '</p>' +
        ((pc.bride || pc.groom) ? '<div class="mg-par"><p>' + (pc.bride ? 'DAUGHTER OF<br>' + up(pc.bride) : '') + '</p><p>' + (pc.groom ? 'SON OF<br>' + up(pc.groom) : '') + '</p></div>' : '') +
        '<div class="mg-date"><span>' + up(dv.month) + '</span><b data-n="' + esc(dv.day) + '">' + esc(dv.day) + '</b><span>' + esc(dv.year) + '</span></div>' +
        '<p class="mg-wd">' + esc(fd.format(start0)) + '</p>' +
        (c.gallery && c.gallery[0] ? '<img class="mg-img" src="' + esc(c.gallery[0]) + '" alt="">' : '') + '</div>';
      var chs = (c.story || []).map(function (s) { return '<div class="mg-ch"><b class="mg-yr">' + esc(s.title || '') + '</b><div><h3>' + up(s.head || '') + '</h3><p>' + esc(s.text || '') + '</p></div></div>'; }).join('');
      var venue0 = (evs[0] && (evs[0].address || evs[0].venue)) || '';
      var storyH = '<div class="block mg-story"><img class="mg-sh" src="/t/mangalam/story-head.jpg" alt=""><div class="mg-sb"><span class="mg-dia k"></span><p class="mg-pre">OUR STORY</p><h2>Together Forever</h2>' +
        (c.message ? '<p class="mg-msg">' + esc(c.message) + '</p>' : '') +
        '<p class="mg-dt">' + up(wdn) + ', ' + ord(dv.day).toUpperCase() + ' ' + up(dv.month) + ' ' + esc(dv.year) + '</p>' +
        '<p class="mg-tw">TOGETHER WITH THEIR FAMILIES</p><p class="mg-req">REQUEST THE HONOUR OF YOUR PRESENCE<br>AT THE CELEBRATION OF THEIR MARRIAGE.</p>' +
        (venue0 ? '<hr><p class="mg-venue">' + up(venue0) + '</p><hr>' : '') +
        (chs ? '<p class="mg-jt">A JOURNEY TOGETHER</p><div class="mg-tl">' + chs + '</div>' : '') + '</div><img class="mg-sf" src="/t/mangalam/story-foot.jpg" alt=""></div>';
      var evH = '<div class="block" id="b-events"><p class="mg-pre">CELEBRATE WITH US</p><h2>WEDDING EVENTS</h2>' + evs.map(function (e, i) {
        var s = new Date(e.start), q = {}; new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Colombo' }).formatToParts(s).forEach(function (x) { q[x.type] = x.value; });
        return '<article class="ev mg-ev">' + (/poruwa/i.test(e.title || '') ? '<img class="mg-arch" src="/t/mangalam/arch.png" alt="">' : '<div class="mg-note"></div>') +
          '<h3>' + esc(e.title || '') + '</h3><p class="mg-row r-cal">' + ord(q.day).toUpperCase() + ' ' + up(q.month) + ' ' + esc(q.year) + '</p><p class="mg-row r-clk">' + up(new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Colombo' }).format(s)) + '</p>' +
          (e.venue ? '<p class="mg-row r-pin">' + up(e.venue) + '</p>' : '') +
          '<div class="btns">' + (e.map ? '<a class="btn" href="' + esc(e.map) + '" target="_blank" rel="noopener">' + t.map + '</a>' : '') + '<button class="btn cal" data-i="' + i + '" type="button">' + t.cal + '</button></div></article>';
      }).join('') + '</div>';
      var saveH = '<div class="block mg-save"><h2><i class="mg-calic"></i>SAVE THE DATE</h2><span class="mg-dia k"></span><p>WE JOYFULLY AWAIT YOUR PRESENCE.<br>PLEASE LET US KNOW<br>IF YOU WILL BE JOINING US.</p></div>';
      body = cardH + storyH;
      order.forEach(function (k) {
        if (k === 'story') return;
        if (k === 'events') { body += evH; return; }
        if (k === 'rsvp') body += saveH;
        if (secHtml[k]) body += secHtml[k]();
      });
    }
    var navItems = [['b-events', t.navd], ['b-gallery', t.navm], ['b-wall', t.navw], ['b-rsvp', t.rsvp.length > 14 ? t.navr : t.rsvp]].filter(function (x) { return body.indexOf('id="' + x[0] + '"') > -1; });
    var nav = '<nav class="bnav" aria-label="Sections">' + navItems.map(function (x) { return '<button type="button" data-go="' + x[0] + '">' + esc(x[1]) + '</button>'; }).join('') + '</nav>';
    var greet = g ? '<p class="dear">' + esc(t.dear.replace('{name}', g.name)) + '</p>' : '';
    var n0 = Array.from(names[0] || '').length, greetName = g ? g.name : '', noMotion = matchMedia('(prefers-reduced-motion:reduce)').matches;

    app.innerHTML =
      '<canvas id="fx" aria-hidden="true"></canvas>' +
      '<section class="stage' + (hasVideo ? ' hasv' : '') + '" id="stage">' +
        (hasVideo ? '<video id="v" playsinline preload="auto"' + (c.poster ? ' poster="' + esc(c.poster) + '"' : '') + ' src="' + esc(c.video) + '"></video>' : '') +
        '<div class="shade"></div>' +
        (hasVideo ? '<div class="hud"><span></span><button id="mute" type="button">' + t.mute + '</button></div><button class="play replay" id="replay" type="button">' + t.replay + '</button>' : '') +
        '<p class="hint">' + t.below + '</p>' +
        '<div class="gate wait" id="gate"><div class="bars"></div><div class="glow"></div><div class="orn">' + (ORN[theme] || ORN.monsoon) + '</div>' + greet + '<p class="lead">' + t.lead + '</p>' +
          '<h1 class="names" aria-label="' + esc(title) + '"><span aria-hidden="true">' + letters(names[0] || '', 0) + '</span><i aria-hidden="true">&amp;</i><span aria-hidden="true">' + letters(names[1] || '', n0 + 2) + '</span></h1>' +
          '<p class="when">' + esc(fd.format(start0)) + '</p>' +
          '<button class="play" id="open" type="button"><svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2 1l11 6-11 6z"/></svg>' + (hasVideo ? t.play : t.see) + '</button>' +
          (hasVideo ? '<button class="skip" id="skip" type="button">' + t.skip + '</button>' : '') + '</div>' +
      '<div class="env" id="env" role="button" tabindex="0" aria-label="' + t.tap + '"><div class="env-back"></div><div class="flap"></div><div class="pocket"></div>' +
        '<div class="env-txt"><p>' + t.lead + '</p><b>' + esc(title) + '</b></div>' +
        '<button class="seal" id="envtap" type="button" aria-label="' + t.tap + '"><span>' + esc((names[0] || '').charAt(0)) + '&amp;' + esc((names[1] || '').charAt(0)) + '</span></button><p class="taphint">' + (greetName ? esc(t.dear.replace('{name}', greetName)) + ' ' : '') + t.tap + '</p></div>' +
      '</section>' +
      '<section class="sheet" id="sheet">' + body + '</section>' +
      (hasMusic ? '<audio id="aud" loop preload="none" src="' + esc(c.music) + '"></audio><button class="mus" id="mus" type="button" aria-label="' + t.music + '">♪</button>' : '') +
      '<div class="lb" id="lb" hidden><img alt=""></div>' +
      nav + '<footer class="foot">' + t.by + ' <a href="https://www.endoraweddingfilms.com" target="_blank" rel="noopener">Endora Wedding Films</a></footer>';

    if (window.startFx) window.startFx(theme);


    /* Mangalam: text decipher animation, like the film */
    var mg = theme === 'mangalam' && !noMotion;
    function scr(el, delay, dur) {
      if (!el || el._sc) return; el._sc = 1;
      var src = el.textContent, n = src.length, html0 = el.innerHTML, G = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      if (!n) return;
      el.style.minHeight = el.offsetHeight + 'px';
      setTimeout(function () { el.style.visibility = '';
        var t0 = performance.now();
        (function f(now) {
          var p = Math.min(1, (now - t0) / dur), k = Math.floor(p * n), o = esc(src.slice(0, k)), g = '';
          for (var i = k; i < Math.min(n, k + 3); i++) g += src[i] === ' ' ? ' ' : G[Math.floor(Math.random() * G.length)];
          o += esc(g) + '<span style="opacity:0">' + esc(src.slice(Math.min(n, k + 3))) + '</span>';
          if (p < 1) { el.innerHTML = o; requestAnimationFrame(f); } else { el.innerHTML = html0; el.style.minHeight = ''; }
        })(t0);
      }, delay);
    }
    function mgHide(sel, root) { Array.prototype.forEach.call((root || document).querySelectorAll(sel), function (el) { el.style.visibility = 'hidden'; }); }
    function mgReveal(box) {
      var i = 0;
      Array.prototype.forEach.call(box.querySelectorAll('h1,h2,h3,p:not(.note),.date,.time,.venue,small,legend'), function (el) {
        if (el.closest('.btns,form,.feed')) return; scr(el, 150 + (i++) * 140, 700 + Math.min(900, el.textContent.length * 14));
      });
    }
    if (mg) { var ld0 = document.querySelector('#gate .lead'); if (ld0) ld0.innerHTML = 'THE WEDDING OF'; }
    if (mg) mgHide('#gate .lead,#gate .names > *,#gate .when');
    function mgCount(box) {
      var b = box.querySelector && box.querySelector('.mg-date b'); if (!b) return; var n = parseInt(b.getAttribute('data-n'), 10) || 0, t0 = performance.now();
      (function f(now) { var p = Math.min(1, (now - t0) / 1400); b.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); })(t0);
    }
    var mgGateDone = 0;
    function mgGate() {
      if (!mg || mgGateDone) return; mgGateDone = 1;
      scr(gate.querySelector('.lead'), 100, 1300); Array.prototype.forEach.call(gate.querySelectorAll('.names > *'), function (el, k) { scr(el, 900 + k * 500, 1100); }); scr(gate.querySelector('.when'), 2000, 1200);
    }

    /* reveal on scroll */
    var rv = document.querySelectorAll('.sheet .block, .sheet .ev, .sheet .chapter, .sheet .gi');
    if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); if (mg) { mgReveal(e.target); mgCount(e.target); } io.unobserve(e.target); } }); }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
      Array.prototype.forEach.call(rv, function (el) { el.classList.add('rv'); io.observe(el); });
    }

    var stage = document.getElementById('stage'), gate = document.getElementById('gate'), v = document.getElementById('v'), aud = document.getElementById('aud');
    function toSheet() { document.getElementById('sheet').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth' }); }
    var env = document.getElementById('env');
    function openEnv() {
      if (!env || env.classList.contains('open')) return;
      env.classList.add('open');
      setTimeout(function () { gate.classList.remove('wait'); env.classList.add('leave'); mgGate(); }, 1300);
      setTimeout(function () { env.remove(); }, 2900);
    }
    if (env) {
      if (noMotion) { env.remove(); gate.classList.remove('wait'); }
      else { env.addEventListener('click', openEnv); env.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEnv(); } }); }
    }
    document.getElementById('open').onclick = function () {
      gate.classList.add('gone'); document.body.classList.add('opened');
      if (aud) { var q = aud.play(); if (q && q.catch) q.catch(function () {}); document.getElementById('mus').classList.add('on'); }
      if (!v) { setTimeout(toSheet, 500); return; }
      v.muted = false;
      var p = v.play(); if (p && p.catch) p.catch(function () { v.muted = true; document.getElementById('mute').textContent = t.sound; v.play(); });
    };
    var skip = document.getElementById('skip'); if (skip) skip.onclick = function () { gate.classList.add('gone'); document.body.classList.add('opened'); setTimeout(toSheet, 400); };
    if (v) {
      var mb = document.getElementById('mute');
      mb.onclick = function () { v.muted = !v.muted; mb.textContent = v.muted ? t.sound : t.mute; };
      v.addEventListener('ended', function () { stage.classList.add('ended'); });
      document.getElementById('replay').onclick = function () { stage.classList.remove('ended'); v.currentTime = 0; v.play(); };
    }
    Array.prototype.forEach.call(document.querySelectorAll('.bnav button'), function (b) { b.onclick = function () { var el = document.getElementById(b.getAttribute('data-go')); if (el) el.scrollIntoView({ behavior: noMotion ? 'auto' : 'smooth', block: 'start' }); }; });
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

    /* find your seat */
    var sf = document.getElementById('seatf');
    if (sf) sf.addEventListener('submit', function (e) {
      e.preventDefault(); var r = document.getElementById('seatres'), q = document.getElementById('seatq').value.trim();
      if (q.length < 3) return;
      if (slug.indexOf('demo') === 0) { r.innerHTML = '<div class="seatcard"><b>' + esc(q) + '</b><small>' + t.tbl + ' 7 · ' + t.seatno + ' 3</small></div>'; return; }
      api('seat_find', { slug: slug, q: q }).then(function (x) { r.innerHTML = (x.found && x.found.length) ? x.found.map(function (f) { return '<div class="seatcard"><b>' + esc(f.name) + '</b><small>' + t.tbl + ' ' + esc(f.tbl) + (f.seat ? ' · ' + t.seatno + ' ' + esc(f.seat) : '') + '</small></div>'; }).join('') : '<p class="note">' + t.seatnone + '</p>'; });
    });
    /* guest wall: photos, wishes, voice messages */
    var wf = document.getElementById('wallf');
    if (wf) {
      var feed = document.getElementById('wfeed'), audioBlob = null, mr = null, chosen = document.getElementById('wchosen'), recb = document.getElementById('wrec');
      var drawWall = function (items) {
        feed.innerHTML = items.length ? items.map(function (i) { return '<figure class="pol ' + i.kind + '">' + (i.kind === 'photo' ? '<img loading="lazy" src="' + esc(i.url) + '" alt="">' : '') + (i.kind === 'audio' ? '<audio controls preload="none" src="' + esc(i.url) + '"></audio>' : '') + ((i.text || i.name) ? '<figcaption>' + (i.text ? '<span>' + esc(i.text) + '</span>' : '') + (i.name ? '<b>' + esc(i.name) + '</b>' : '') + '</figcaption>' : '') + '</figure>'; }).join('') : '<p class="note">' + t.nowall + '</p>';
      };
      if (slug.indexOf('demo') === 0) drawWall([{ kind: 'wish', name: 'Kasun', text: 'Congratulations, we are so happy for you both!' }, { kind: 'wish', name: 'Amma', text: 'May your home always be full of light.' }]);
      else api('wall', { slug: slug }).then(function (x) { drawWall(x.items || []); });
      document.getElementById('wphoto').onchange = function () { chosen.textContent = this.files[0] ? this.files[0].name : ''; };
      if (recb) recb.onclick = function () {
        if (mr && mr.state === 'recording') { mr.stop(); return; }
        navigator.mediaDevices.getUserMedia({ audio: true }).then(function (st) {
          var ch = []; mr = new MediaRecorder(st); mr.ondataavailable = function (e) { if (e.data.size) ch.push(e.data); };
          mr.onstop = function () { st.getTracks().forEach(function (k) { k.stop(); }); audioBlob = new Blob(ch, { type: mr.mimeType || 'audio/webm' }); recb.textContent = t.rec; chosen.textContent = t.recorded; clearTimeout(mr._t); };
          mr.start(); recb.textContent = t.stop; mr._t = setTimeout(function () { if (mr.state === 'recording') mr.stop(); }, 45000);
        }).catch(function () {});
      };
      wf.addEventListener('submit', function (e) {
        e.preventDefault(); var m = document.getElementById('wmsg'), fd = new FormData(), ph = document.getElementById('wphoto').files[0];
        fd.append('slug', slug); fd.append('name', document.getElementById('wname').value); fd.append('text', document.getElementById('wtext').value);
        if (ph) fd.append('photo', ph); else if (audioBlob) fd.append('audio', audioBlob, 'voice.' + (audioBlob.type.indexOf('mp4') > -1 ? 'm4a' : 'webm'));
        if (!ph && !audioBlob && !document.getElementById('wtext').value.trim()) { m.textContent = t.wish; return; }
        if (slug.indexOf('demo') === 0) { m.textContent = t.posted; return; }
        var b = document.getElementById('wsend'); b.disabled = true; m.textContent = t.wait;
        fetch(API_BASE + 'wall_post', { method: 'POST', body: fd }).then(function (r) { return r.json(); }).then(function (x) {
          b.disabled = false; if (!x.ok) { m.textContent = x.error || t.err; return; }
          m.textContent = t.posted; drawWall(x.items); wf.reset(); audioBlob = null; chosen.textContent = '';
        }).catch(function () { b.disabled = false; m.textContent = t.err; });
      });
    }
    var fq = new URLSearchParams(location.search).get('f');
    if (fq) { var tg = document.getElementById('b-' + fq); if (tg) { document.getElementById('gate').classList.add('gone'); setTimeout(function () { tg.scrollIntoView(); }, 300); } }

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
