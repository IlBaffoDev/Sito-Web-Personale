// Scelta della piattaforma (iOS / Android) per le pagine di Gestore Costi Veicoli.
// Caricato NON-defer nel <head>, come theme.js: mette data-os su <html> prima del
// primo paint, così chi arriva da Android non vede lampeggiare i testi iOS.
//
// Uso nel markup:
//   data-os-solo="ios" | "android"   l'elemento si vede solo con quella piattaforma
//   .os-switch > button[data-os-scelta="ios"|"android"]   selettore a due segmenti
// Tutti i selettori della pagina restano allineati: sceglierne uno li sposta tutti.
(function () {
  var radice = document.documentElement;
  var salvata = null;
  try { salvata = localStorage.getItem('gcv-os'); } catch (e) {}
  var ua = (navigator.userAgent || '').toLowerCase();
  var os = salvata === 'ios' || salvata === 'android' ? salvata
    : (ua.indexOf('android') !== -1 ? 'android' : 'ios');
  radice.setAttribute('data-os', os);

  function allinea() {
    var attuale = radice.getAttribute('data-os');
    document.querySelectorAll('[data-os-scelta]').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-os-scelta') === attuale ? 'true' : 'false');
    });
  }

  document.addEventListener('DOMContentLoaded', allinea);

  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('[data-os-scelta]') : null;
    if (!btn) return;
    var scelta = btn.getAttribute('data-os-scelta');
    if (scelta !== 'ios' && scelta !== 'android') return;
    radice.setAttribute('data-os', scelta);
    try { localStorage.setItem('gcv-os', scelta); } catch (e2) {}
    allinea();
    document.dispatchEvent(new CustomEvent('oscambiato', { detail: { os: scelta } }));
  });
})();
