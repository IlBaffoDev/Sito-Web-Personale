(function () {
  var btn = document.getElementById('gallery-theme-toggle');
  var imgs = Array.prototype.slice.call(document.querySelectorAll('.gallery-card-img[data-src-dark]'));
  if (!btn || !imgs.length) return;

  var label = btn.querySelector('[data-label]');
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // la piattaforma la sceglie assets/piattaforma.js (data-os su <html>): iPhone o Android
  function android() {
    return document.documentElement.getAttribute('data-os') === 'android';
  }

  function scuro() {
    return btn.getAttribute('aria-pressed') === 'true';
  }

  function swap(toDark) {
    var and = android();
    imgs.forEach(function (img) {
      var attr = and ? (toDark ? 'data-src-android-dark' : 'data-src-android')
                     : (toDark ? 'data-src-dark' : 'data-src-light');
      var src = img.getAttribute(attr) || img.getAttribute(toDark ? 'data-src-dark' : 'data-src-light');
      if (img.getAttribute('src') !== src) img.src = src;
    });
  }

  function dissolvi(toDark, animato) {
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

  // stato del bottone e degli screenshot, sempre insieme: erano queste due cose
  // a divergere quando il tema cambiava da fuori
  function applica(toDark, animato) {
    btn.setAttribute('aria-pressed', toDark ? 'true' : 'false');
    if (label) label.textContent = toDark ? 'Guarda in tema chiaro' : 'Guarda in tema scuro';
    dissolvi(toDark, animato);
  }

  // parte col tema della pagina e con la piattaforma scelta (chi arriva da Android vede il Pixel)
  applica(document.documentElement.classList.contains('dark'), false);

  btn.addEventListener('click', function () {
    applica(!scuro(), true);
  });

  // il toggle globale in navbar cambia .dark in qualsiasi momento: senza questo
  // la gallery restava con gli screenshot del tema di partenza e con l'etichetta
  // del bottone che diceva il contrario di quello che avrebbe fatto
  document.addEventListener('temacambiato', function (e) {
    var toDark = !!(e.detail && e.detail.dark);
    if (scuro() !== toDark) applica(toDark, true);
  });

  // un selettore iPhone/Android qualsiasi della pagina cambia anche la galleria
  document.addEventListener('oscambiato', function () {
    dissolvi(scuro(), true);
  });
})();
