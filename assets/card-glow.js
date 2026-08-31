(function () {
  if (window.matchMedia && (matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(pointer: coarse)').matches)) return;

  // solo i div: la regola che legge --mx/--my e' div.widget-panel::after, e
  // l'hero e' una <section class="widget-panel"> — prima ci si scriveva sopra
  // a ogni movimento del mouse su piu' di uno schermo di altezza, per nulla
  var cards = Array.prototype.slice.call(
    document.querySelectorAll('.feature-grid > div, .pricing-card, div.widget-panel')
  );
  if (!cards.length) return;

  cards.forEach(function (card) {
    var rafId = null;
    var pending = null;

    function apply() {
      rafId = null;
      if (!pending) return;
      card.style.setProperty('--mx', pending.x + 'px');
      card.style.setProperty('--my', pending.y + 'px');
    }

    // il rect si legge nel listener ma la scrittura passa da rAF, cosi' piu'
    // eventi nello stesso frame costano una sola applicazione di stile
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      pending = { x: e.clientX - r.left, y: e.clientY - r.top };
      if (!rafId) rafId = requestAnimationFrame(apply);
    }, { passive: true });
  });
})();
