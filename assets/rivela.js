// Comparsa allo scroll della landing GCV: titoli, schede e pannelli entrano con una dissolvenza
// quando arrivano nello schermo. Senza JS o con «riduci movimento» tutto resta visibile da subito
// (la classe js-rivela su <html> la mette solo questo script).
(function () {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var SEL = '.sezione h2, .banda-scura h2, .kicker, .lead, .fx-griglia, .ip-voce, .pannello-scuro, ' +
            '.w2-passo, .w2-fatto, .w2-card, .calc-risultato, .piano, .mini, .idea, .faq details';
  var els = Array.prototype.slice.call(document.querySelectorAll(SEL));
  if (!els.length) return;
  // ciò che è già nello schermo (ricarica, link a #faq) resta visibile: nasconderlo farebbe lampeggiare
  var alto = window.innerHeight;
  els.forEach(function (el) {
    var r = el.getBoundingClientRect();
    if (r.bottom > 0 && r.top < alto) el.classList.add('visibile');
  });
  document.documentElement.classList.add('js-rivela');
  // i fratelli che entrano insieme partono sfalsati
  els.forEach(function (el) {
    var fratelli = Array.prototype.filter.call(el.parentNode.children, function (c) { return els.indexOf(c) !== -1; });
    el.style.setProperty('--i', Math.min(fratelli.indexOf(el), 6));
  });
  var io = new IntersectionObserver(function (voci) {
    voci.forEach(function (v) {
      if (!v.isIntersecting) return;
      v.target.classList.add('visibile');
      io.unobserve(v.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  els.forEach(function (el) { if (!el.classList.contains('visibile')) io.observe(el); });
})();
