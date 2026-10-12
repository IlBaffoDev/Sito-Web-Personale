// Funzioni della landing GCV (#funzioni): telefono a sinistra, elenco di passi a destra.
// Da computer (≥ 900 px, senza «riduci movimento») il telefono resta fermo mentre la pagina scorre
// e il passo al centro dello schermo diventa quello attivo; un click su un passo, o le frecce, ci
// portano lì scorrendo. Sul telefono resta il comportamento a fisarmonica: un passo aperto alla volta.
// L'immagine segue la piattaforma (data-os, piattaforma.js) e il tema: ogni <img class="fx-img"> porta
// le quattro varianti in data-src-*. Il bottone .fx-tema cambia solo le schermate (chiare/scure).
(function () {
  var root = document.getElementById('funzioni');
  if (!root) return;
  var tabs = Array.prototype.slice.call(root.querySelectorAll('.fx-tab'));
  var imgs = Array.prototype.slice.call(root.querySelectorAll('.fx-img'));
  var testi = Array.prototype.slice.call(root.querySelectorAll('.fx-testo'));
  var voci = tabs.map(function (t) { return t.parentNode; });
  var N = tabs.length;
  if (!N || imgs.length !== N || testi.length !== N) return;
  var html = document.documentElement;
  var step = 0;
  var bottoneTema = root.querySelector('.fx-tema');
  var etichetta = bottoneTema ? bottoneTema.querySelector('[data-fx-etichetta]') : null;
  var scure = html.classList.contains('dark');
  var mqLargo = window.matchMedia('(min-width: 900px)');
  var mqCalmo = window.matchMedia('(prefers-reduced-motion: reduce)');
  var scorre = false;
  var osservatore = null;
  var bersaglio = null; // a scorrimento: il passo verso cui stiamo andando (le frecce rapide partono da lì)

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
    var prima = step;
    step = Math.max(0, Math.min(N - 1, i));
    if (bersaglio === step) bersaglio = null;
    tabs.forEach(function (t, j) {
      var on = j === step;
      if (scorre) {
        t.removeAttribute('aria-expanded');
        if (on) t.setAttribute('aria-current', 'step'); else t.removeAttribute('aria-current');
      } else {
        t.setAttribute('aria-expanded', on ? 'true' : 'false');
        t.removeAttribute('aria-current');
      }
      voci[j].classList.toggle('fx-voce--on', on);
    });
    imgs.forEach(function (img, j) { img.hidden = j !== step; });
    // a scorrimento tutti i testi restano visibili (attenuati dal CSS), altrimenti solo quello aperto
    testi.forEach(function (t, j) { t.hidden = !scorre && j !== step; });
    aggiornaImg(imgs[step]);
    if (prima !== step || !scorre) rianima(imgs[step]);
    if (!scorre) rianima(testi[step]);
    if (fuoco) tabs[step].focus({ preventScroll: scorre });
  }

  // a scorrimento i click non cambiano il passo da soli: portano il passo al centro, e ci pensa l'osservatore
  function base() { return scorre && bersaglio !== null ? bersaglio : step; }

  function vai(i, fuoco) {
    if (!scorre) { mostra(i < 0 ? N - 1 : i >= N ? 0 : i, fuoco); return; }
    var j = Math.max(0, Math.min(N - 1, i));
    bersaglio = j;
    voci[j].scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (fuoco) tabs[j].focus({ preventScroll: true });
  }

  function impostaModo() {
    var nuovo = mqLargo.matches && !mqCalmo.matches && 'IntersectionObserver' in window;
    if (nuovo === scorre && (osservatore || !nuovo)) return;
    scorre = nuovo;
    root.classList.toggle('fx-scorre', scorre);
    if (osservatore) { osservatore.disconnect(); osservatore = null; }
    if (scorre) {
      // attivo = il passo che attraversa la fascia centrale dello schermo
      osservatore = new IntersectionObserver(function (vv) {
        vv.forEach(function (v) { if (v.isIntersecting) mostra(voci.indexOf(v.target), false); });
      }, { rootMargin: '-45% 0px -45% 0px' });
      voci.forEach(function (v) { osservatore.observe(v); });
    }
    mostra(step, false);
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { vai(i, false); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); vai(base() + 1, true); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); vai(base() - 1, true); }
    });
  });
  var prev = root.querySelector('.fx-prev');
  var next = root.querySelector('.fx-next');
  if (prev) prev.addEventListener('click', function () { vai(base() - 1, false); });
  if (next) next.addEventListener('click', function () { vai(base() + 1, false); });

  // le schermate nascoste sono lazy e partirebbero solo quando tocca a loro: appena la sezione si
  // avvicina le carico tutte, nella variante giusta, così scorrendo il telefono non resta mai vuoto
  function precarica() {
    imgs.forEach(function (img) { img.loading = 'eager'; aggiornaImg(img); });
  }
  if ('IntersectionObserver' in window) {
    var vicino = new IntersectionObserver(function (vv) {
      if (vv.some(function (v) { return v.isIntersecting; })) { vicino.disconnect(); precarica(); }
    }, { rootMargin: '800px 0px' });
    vicino.observe(root);
  } else precarica();

  // piattaforma e tema possono cambiare in qualsiasi momento (selettori della pagina, tema di sistema)
  document.addEventListener('oscambiato', function () { imgs.forEach(function (img) { if (img.loading === 'eager' || !img.hidden) aggiornaImg(img); }); });
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

  [mqLargo, mqCalmo].forEach(function (mq) {
    if (mq.addEventListener) mq.addEventListener('change', impostaModo);
    else if (mq.addListener) mq.addListener(impostaModo);
  });

  aggiornaBottone();
  impostaModo();
})();
