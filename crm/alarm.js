<script>
(function () {
  var PEND = <?= json_encode(admin_url('endora_bridge/shop_admin/pending')); ?>, ORD = <?= json_encode(admin_url('endora_bridge/shop_admin')); ?>, last = null, rang = 0;
  function alarm(t) {
    if (Date.now() - rang < 15000) { return; }
    rang = Date.now();
    try {
      var C = new (window.AudioContext || window.webkitAudioContext)(), o = C.createOscillator(), g = C.createGain(), n = C.currentTime, i;
      o.type = 'square'; o.connect(g); g.connect(C.destination); g.gain.setValueAtTime(0, n);
      for (i = 0; i < 20; i++) { o.frequency.setValueAtTime(i % 2 ? 660 : 880, n + i * 0.5); g.gain.setValueAtTime(0.25, n + i * 0.5); g.gain.setValueAtTime(0, n + i * 0.5 + 0.35); }
      o.start(n); o.stop(n + 10);
    } catch (e) {}
    if (navigator.vibrate) { navigator.vibrate([500, 250, 500, 250, 500, 250, 500, 250, 500, 250, 500, 250, 500, 250, 500, 250, 500, 250, 500]); }
    var b = document.getElementById('shopAlarm');
    if (!b) { b = document.createElement('a'); b.id = 'shopAlarm'; b.href = ORD; b.style.cssText = 'position:fixed;left:12px;right:12px;bottom:calc(env(safe-area-inset-bottom) + 12px);z-index:99;background:#c8a96a;color:#0b0a09;font-weight:700;padding:14px;border-radius:14px;text-align:center;box-shadow:0 10px 30px #000'; document.body.appendChild(b); }
    b.textContent = '🛒 ' + (t || 'New software order') + ' – tap to open';
  }
  function poll() {
    fetch(PEND, { credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (j) { if (last !== null && j.latest > last) { alarm('New software order'); } last = j.latest; }).catch(function () {});
  }
  poll(); setInterval(poll, 20000);
  if (navigator.serviceWorker) { navigator.serviceWorker.addEventListener('message', function (e) { if (e.data && e.data.alarm) { alarm(e.data.title); } }); }
})();
</script>
