// Anti-flash del tema: caricato NON-defer nel <head>, prima del primo paint.
// Mette .dark su <html> leggendo la scelta salvata o prefers-color-scheme.
// La CSP blocca gli script inline, per questo vive in un file esterno.
(function () {
  var saved = null;
  try { saved = localStorage.getItem('gcv-theme'); } catch (e) {}
  var dark = saved ? saved === 'dark'
    : (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  if (dark) document.documentElement.classList.add('dark');

  // stato iniziale dei bottoni (esistono solo a DOM pronto)
  document.addEventListener('DOMContentLoaded', function () {
    var isDark = document.documentElement.classList.contains('dark');
    document.querySelectorAll('.theme-toggle').forEach(function (b) {
      b.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    });
  });

  // se l'utente non ha mai scelto, la pagina segue il sistema anche mentre e'
  // aperta (prima il tema era deciso una volta sola al caricamento)
  if (!saved && window.matchMedia) {
    var mq = matchMedia('(prefers-color-scheme: dark)');
    var onSystemChange = function (e) {
      var scelto = null;
      try { scelto = localStorage.getItem('gcv-theme'); } catch (e3) {}
      if (scelto) return;
      document.documentElement.classList.toggle('dark', e.matches);
      document.querySelectorAll('.theme-toggle').forEach(function (b) {
        b.setAttribute('aria-pressed', e.matches ? 'true' : 'false');
      });
      document.dispatchEvent(new CustomEvent('temacambiato', { detail: { dark: e.matches } }));
    };
    if (mq.addEventListener) mq.addEventListener('change', onSystemChange);
    else if (mq.addListener) mq.addListener(onSystemChange);
  }

  // toggle: i bottoni .theme-toggle arrivano dopo nel DOM — deleghiamo al documento
  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('.theme-toggle') : null;
    if (!btn) return;
    var toDark = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', toDark);
    try { localStorage.setItem('gcv-theme', toDark ? 'dark' : 'light'); } catch (e2) {}
    document.querySelectorAll('.theme-toggle').forEach(function (b) {
      b.setAttribute('aria-pressed', toDark ? 'true' : 'false');
    });
    // chi mostra asset diversi per tema (la gallery della landing) deve poter
    // risincronizzarsi: senza questo evento restava fermo allo stato del load
    document.dispatchEvent(new CustomEvent('temacambiato', { detail: { dark: toDark } }));
  });
})();
