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

  els.forEach(function (el) {
    el.style.willChange = 'transform';
    // la transizione fa da "molla": la togliamo durante il tracking per non lagggare
    var springing = false;

    function onMove(e) {
      var r = el.getBoundingClientRect();
      var cx = r.left + r.width / 2;
      var cy = r.top + r.height / 2;
      var dx = e.clientX - cx;
      var dy = e.clientY - cy;
      var distX = Math.max(0, Math.abs(dx) - r.width / 2);
      var distY = Math.max(0, Math.abs(dy) - r.height / 2);
      var dist = Math.hypot(distX, distY);
      if (dist > RADIUS) { release(); return; }
      if (springing) { el.style.transition = 'none'; springing = false; }
      var strength = 1 - dist / RADIUS;
      var max = Math.max(Math.hypot(dx, dy), 1);
      el.style.transform = 'translate(' + (dx / max * PULL * strength) + 'px,' + (dy / max * PULL * strength) + 'px)';
    }

    function release() {
      if (el.style.transform === '' || el.style.transform === 'none') return;
      springing = true;
      el.style.transition = 'transform .45s cubic-bezier(.2,1.6,.35,1)';
      el.style.transform = '';
    }

    // il tracking vive sul documento ma lavora solo nel raggio: costa un solo
    // getBoundingClientRect per bottone e solo mentre il mouse si muove
    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', release);
  });
})();
