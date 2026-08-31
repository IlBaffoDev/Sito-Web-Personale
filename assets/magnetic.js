(function () {
  // CTA magnetiche: entro un raggio attorno al bottone, questo trasla dolcemente verso
  // il cursore (max pochi px) e torna a molla quando esci. Solo puntatori di precisione.
  if (!window.matchMedia) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!matchMedia('(pointer: fine)').matches) return;

  var RADIUS = 90;   // px oltre il bordo del bottone in cui il magnetismo agisce
  var PULL = 6;      // traslazione massima in px

  var els = Array.prototype.slice.call(document.querySelectorAll('.store-btn, .sticky-nav-cta'));
  if (!els.length) return;

  // un solo listener sul documento per tutti i bottoni: prima ce n'era uno per
  // bottone (6 sulla pagina prodotto), quindi ogni movimento del mouse ovunque
  // nella pagina costava 6 getBoundingClientRect sincroni
  var stati = els.map(function (el) {
    return { el: el, springing: false, attivo: false };
  });

  var rects = null;          // rect cachati: si invalidano su scroll e resize
  var pendingEvent = null;
  var rafId = null;

  function misura() {
    rects = stati.map(function (s) { return s.el.getBoundingClientRect(); });
  }

  function release(s) {
    if (!s.attivo) return;
    s.attivo = false;
    s.springing = true;
    s.el.style.transition = 'transform .45s cubic-bezier(.2,1.6,.35,1)';
    s.el.style.transform = '';
    // willChange solo mentre serve: prima restava permanente su 6 elementi,
    // cioe' 6 layer del compositor promossi per tutta la vita della pagina
    s.el.style.willChange = '';
  }

  function apply() {
    rafId = null;
    var e = pendingEvent;
    if (!e) return;
    if (!rects) misura();

    for (var i = 0; i < stati.length; i++) {
      var s = stati[i], r = rects[i];
      if (!r.width && !r.height) { release(s); continue; }

      var dx = e.clientX - (r.left + r.width / 2);
      var dy = e.clientY - (r.top + r.height / 2);
      var distX = Math.max(0, Math.abs(dx) - r.width / 2);
      var distY = Math.max(0, Math.abs(dy) - r.height / 2);
      var dist = Math.hypot(distX, distY);

      if (dist > RADIUS) { release(s); continue; }

      if (s.springing || !s.attivo) {
        s.el.style.transition = 'none';
        s.el.style.willChange = 'transform';
        s.springing = false;
      }
      s.attivo = true;
      var strength = 1 - dist / RADIUS;
      var max = Math.max(Math.hypot(dx, dy), 1);
      s.el.style.transform = 'translate(' + (dx / max * PULL * strength) + 'px,' +
        (dy / max * PULL * strength) + 'px)';
    }
  }

  document.addEventListener('pointermove', function (e) {
    pendingEvent = e;
    if (!rafId) rafId = requestAnimationFrame(apply);
  }, { passive: true });

  document.addEventListener('pointerleave', function () {
    stati.forEach(release);
  });

  window.addEventListener('scroll', function () { rects = null; }, { passive: true });
  window.addEventListener('resize', function () { rects = null; }, { passive: true });
})();
