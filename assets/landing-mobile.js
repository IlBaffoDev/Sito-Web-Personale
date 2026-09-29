/* Landing Gestore Costi Veicoli — comportamento solo telefono (≤640px).
   1. Rotaie (.m-rail): pallini + contatore sotto il carosello, attributi da
      carosello per lo screen reader, partenza su una scheda precisa (data-rail-start).
   2. Prezzi: selettore Gratuito | Pro, una scheda alla volta, parte dal Pro.
   3. Pillola «Scarica gratis su App Store»: si nasconde su prezzi, contatti e footer.
   Sopra i 640px non cambia nulla di visibile: le classi che mette agiscono solo
   dentro @media (max-width:640px) e gli elementi aggiunti sono display:none. */
(function () {
  var mq = window.matchMedia('(max-width: 640px)');

  /* ---------- rotaie ---------- */
  function wireRail(rail) {
    // gli elementi decorativi (aria-hidden, es. la linea tratteggiata di «Come funziona») non sono schede
    var cards = Array.prototype.filter.call(rail.children, function (el) { return el.getAttribute('aria-hidden') !== 'true'; });
    if (cards.length < 2) return;

    var section = rail.closest('section');
    var heading = section ? section.querySelector('h2') : null;
    var label = heading ? heading.textContent.trim() : 'Schede';

    var nav = document.createElement('div');
    nav.className = 'm-rail-nav';
    nav.setAttribute('aria-hidden', 'true');
    var dotsWrap = document.createElement('div');
    dotsWrap.className = 'm-rail-dots';
    var dots = cards.map(function () {
      var dot = document.createElement('i');
      dotsWrap.appendChild(dot);
      return dot;
    });
    var count = document.createElement('span');
    count.className = 'm-rail-count';
    nav.appendChild(dotsWrap);
    nav.appendChild(count);
    rail.parentNode.insertBefore(nav, rail.nextSibling);

    var current = -1;
    var raf = 0;

    // scheda a fuoco = quella col bordo sinistro più vicino al bordo di partenza
    function activeIndex() {
      var start = rail.getBoundingClientRect().left + parseFloat(getComputedStyle(rail).paddingLeft);
      var best = 0, bestDist = Infinity;
      cards.forEach(function (card, i) {
        var d = Math.abs(card.getBoundingClientRect().left - start);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      // in fondo alla rotaia l'ultima scheda non arriva al bordo: vale lei
      if (rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 2) best = cards.length - 1;
      return best;
    }

    function update() {
      raf = 0;
      if (!mq.matches) return;
      var i = activeIndex();
      if (i === current) return;
      current = i;
      dots.forEach(function (dot, j) { dot.classList.toggle('is-active', j === i); });
      count.textContent = (i + 1) + ' / ' + cards.length;
    }

    rail.addEventListener('scroll', function () {
      if (!raf) raf = requestAnimationFrame(update);
    }, { passive: true });

    var started = false;
    function apply() {
      if (mq.matches) {
        rail.setAttribute('role', 'region');
        rail.setAttribute('aria-roledescription', 'carosello');
        rail.setAttribute('aria-label', label);
        rail.setAttribute('tabindex', '0');
        var start = parseInt(rail.getAttribute('data-rail-start'), 10);
        if (!started && start > 0 && cards[start]) {
          started = true;
          // Safari perde uno scrollLeft impostato durante il caricamento: si
          // posiziona quando la rotaia sta per entrare nello schermo.
          // La prima scheda sta a scrollLeft 0: basta la distanza fra le due.
          var io = new IntersectionObserver(function (entries) {
            if (!entries[0].isIntersecting) return;
            io.disconnect();
            if (mq.matches && rail.scrollLeft === 0) {
              rail.scrollLeft = cards[start].offsetLeft - cards[0].offsetLeft;
            }
          }, { rootMargin: '0px 0px 200px 0px' });
          io.observe(rail);
        }
        current = -1;
        update();
      } else {
        ['role', 'aria-roledescription', 'aria-label', 'tabindex'].forEach(function (a) { rail.removeAttribute(a); });
      }
    }
    apply();
    mq.addEventListener('change', apply);
  }

  Array.prototype.forEach.call(document.querySelectorAll('.m-rail'), wireRail);
  /* ---------- prezzi: selettore Gratuito | Pro ---------- */
  var piani = document.querySelector('.pricing-griglia');
  if (piani) {
    var schede = Array.prototype.slice.call(piani.querySelectorAll('.pricing-card'));
    if (schede.length === 2) {
      var scelta = document.createElement('div');
      scelta.className = 'piano-scelta';
      scelta.setAttribute('role', 'group');
      scelta.setAttribute('aria-label', 'Scegli il piano');
      var bottoni = schede.map(function (scheda) {
        var b = document.createElement('button');
        b.type = 'button';
        var h = scheda.querySelector('h3');
        b.textContent = h ? h.textContent.trim() : '';
        scelta.appendChild(b);
        return b;
      });
      piani.parentNode.insertBefore(scelta, piani);
      piani.classList.add('piani-a-scelta');
      var mostra = function (i) {
        schede.forEach(function (sc, j) { sc.classList.toggle('is-scelto', i === j); });
        bottoni.forEach(function (b, j) { b.setAttribute('aria-pressed', i === j ? 'true' : 'false'); });
      };
      bottoni.forEach(function (b, i) { b.addEventListener('click', function () { mostra(i); }); });
      mostra(1);
    }
  }
  /* ---------- pillola App Store: via dove la pagina ha già i suoi pulsanti ---------- */
  var pillola = document.querySelector('.sticky-cta');
  if (pillola && 'IntersectionObserver' in window) {
    var zone = ['#pricing', '#contatti', '.site-footer'].map(function (sel) { return document.querySelector(sel); }).filter(Boolean);
    var visibili = new Set();
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) visibili.add(e.target); else visibili.delete(e.target); });
      pillola.classList.toggle('is-nascosta', visibili.size > 0);
    }, { threshold: 0.15 });
    zone.forEach(function (z) { io2.observe(z); });
  }
})();
