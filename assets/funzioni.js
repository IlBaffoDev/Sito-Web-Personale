// Carosello a schede della sezione #funzioni (landing GCV): una schermata dell'app per volta,
// scelta dalle schede o dalle frecce. L'immagine segue la piattaforma (data-os, piattaforma.js)
// e il tema: ogni <img class="fx-img"> porta le quattro varianti in data-src-*. Il bottone .fx-tema cambia
// solo le schermate (chiare/scure), non la pagina; quando cambia il tema della pagina le schermate lo seguono.
(function () {
  var root = document.getElementById('funzioni');
  if (!root) return;
  var tabs = Array.prototype.slice.call(root.querySelectorAll('.fx-tab'));
  var imgs = Array.prototype.slice.call(root.querySelectorAll('.fx-img'));
  var testi = Array.prototype.slice.call(root.querySelectorAll('.fx-testo'));
  var N = tabs.length;
  if (!N || imgs.length !== N || testi.length !== N) return;
  var html = document.documentElement;
  var step = 0;
  var bottoneTema = root.querySelector('.fx-tema');
  var etichetta = bottoneTema ? bottoneTema.querySelector('[data-fx-etichetta]') : null;
  var scure = html.classList.contains('dark');

  function aggiornaBottone() {
    if (!bottoneTema) return;
    bottoneTema.setAttribute('aria-pressed', scure ? 'true' : 'false');
    bottoneTema.setAttribute('aria-label', scure ? 'Schermate dell\'app in tema chiaro' : 'Schermate dell\'app in tema scuro');
    if (etichetta) etichetta.textContent = scure ? 'Schermate chiare' : 'Schermate scure';
  }

  function sorgente(img) {
    var and = html.getAttribute('data-os') === 'android';
    var attr = and ? (scure ? 'data-src-android-dark' : 'data-src-android')
                   : (scure ? 'data-src-dark' : 'data-src-light');
    return img.getAttribute(attr) || img.getAttribute('data-src-light');
  }

  function aggiornaImg(img) {
    var src = sorgente(img);
    if (img.getAttribute('src') !== src) img.src = src;
  }

  function rianima(el) {
    el.classList.remove('slide-in');
    void el.offsetWidth; // riparte l'animazione d'entrata
    el.classList.add('slide-in');
  }

  function mostra(i, fuoco) {
    step = (i + N) % N;
    tabs.forEach(function (t, j) {
      var on = j === step;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    imgs.forEach(function (img, j) { img.hidden = j !== step; });
    testi.forEach(function (t, j) { t.hidden = j !== step; });
    aggiornaImg(imgs[step]);
    rianima(imgs[step]);
    rianima(testi[step]);
    if (fuoco) tabs[step].focus();
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { mostra(i, false); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); mostra(step + 1, true); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); mostra(step - 1, true); }
      else if (e.key === 'Home') { e.preventDefault(); mostra(0, true); }
      else if (e.key === 'End') { e.preventDefault(); mostra(N - 1, true); }
    });
  });
  var prev = root.querySelector('.fx-prev');
  var next = root.querySelector('.fx-next');
  if (prev) prev.addEventListener('click', function () { mostra(step - 1, false); });
  if (next) next.addEventListener('click', function () { mostra(step + 1, false); });

  // piattaforma e tema possono cambiare in qualsiasi momento (selettori della pagina, tema di sistema)
  document.addEventListener('oscambiato', function () { aggiornaImg(imgs[step]); });
  document.addEventListener('temacambiato', function (e) {
    scure = !!(e.detail && e.detail.dark);
    aggiornaBottone();
    aggiornaImg(imgs[step]);
  });
  if (bottoneTema) bottoneTema.addEventListener('click', function () {
    scure = !scure;
    aggiornaBottone();
    aggiornaImg(imgs[step]);
    rianima(imgs[step]);
  });

  aggiornaBottone();
  aggiornaImg(imgs[0]);
})();
