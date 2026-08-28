(function () {
  var btn = document.getElementById('gallery-theme-toggle');
  var imgs = Array.prototype.slice.call(document.querySelectorAll('.gallery-card-img[data-src-dark]'));
  if (!btn || !imgs.length) return;

  var label = btn.querySelector('[data-label]');
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // se la pagina parte in dark mode, il carosello parte con gli screenshot scuri
  if (document.documentElement.classList.contains('dark')) {
    btn.setAttribute('aria-pressed', 'true');
    if (label) label.textContent = 'Guarda in tema chiaro';
    imgs.forEach(function (img) {
      img.src = img.getAttribute('data-src-dark');
    });
  }

  btn.addEventListener('click', function () {
    var toDark = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', toDark ? 'true' : 'false');
    if (label) label.textContent = toDark ? 'Guarda in tema chiaro' : 'Guarda in tema scuro';

    function swap() {
      imgs.forEach(function (img) {
        img.src = toDark ? img.getAttribute('data-src-dark') : img.getAttribute('data-src-light');
      });
    }

    if (reduceMotion) {
      swap();
      return;
    }

    imgs.forEach(function (img) { img.style.opacity = '0'; });
    setTimeout(function () {
      swap();
      imgs.forEach(function (img) { img.style.opacity = '1'; });
    }, 220);
  });
})();
