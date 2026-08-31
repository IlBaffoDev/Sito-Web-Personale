(function () {
  var btn = document.getElementById('gallery-theme-toggle');
  var imgs = Array.prototype.slice.call(document.querySelectorAll('.gallery-card-img[data-src-dark]'));
  if (!btn || !imgs.length) return;

  var label = btn.querySelector('[data-label]');
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function swap(toDark) {
    imgs.forEach(function (img) {
      img.src = img.getAttribute(toDark ? 'data-src-dark' : 'data-src-light');
    });
  }

  // stato del bottone e degli screenshot, sempre insieme: erano queste due cose
  // a divergere quando il tema cambiava da fuori
  function applica(toDark, animato) {
    btn.setAttribute('aria-pressed', toDark ? 'true' : 'false');
    if (label) label.textContent = toDark ? 'Guarda in tema chiaro' : 'Guarda in tema scuro';

    if (!animato || reduceMotion) {
      swap(toDark);
      return;
    }
    imgs.forEach(function (img) { img.style.opacity = '0'; });
    setTimeout(function () {
      swap(toDark);
      imgs.forEach(function (img) { img.style.opacity = '1'; });
    }, 220);
  }

  // se la pagina parte in dark mode, il carosello parte con gli screenshot scuri
  if (document.documentElement.classList.contains('dark')) applica(true, false);

  btn.addEventListener('click', function () {
    applica(btn.getAttribute('aria-pressed') !== 'true', true);
  });

  // il toggle globale in navbar cambia .dark in qualsiasi momento: senza questo
  // la gallery restava con gli screenshot del tema di partenza e con l'etichetta
  // del bottone che diceva il contrario di quello che avrebbe fatto
  document.addEventListener('temacambiato', function (e) {
    var toDark = !!(e.detail && e.detail.dark);
    if ((btn.getAttribute('aria-pressed') === 'true') !== toDark) applica(toDark, true);
  });
})();
