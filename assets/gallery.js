(function () {
  var track = document.querySelector('.gallery-track');
  if (!track) return;

  var cards = Array.prototype.slice.call(track.querySelectorAll('.gallery-card'));
  if (!cards.length) return;

  var dots = Array.prototype.slice.call(document.querySelectorAll('.gallery-dot'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.gallery-caption-panel'));
  var caption = document.querySelector('.gallery-caption');
  var prevBtn = document.querySelector('.gallery-nav-prev');
  var nextBtn = document.querySelector('.gallery-nav-next');
  var panelHeights = [];

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var activeIndex = 0;
  var rafId = null;
  var isProgrammatic = false;
  var programmaticTimeout = null;

  function cardStep() {
    if (cards.length < 2) return cards[0] ? cards[0].offsetWidth : 0;
    return cards[1].offsetLeft - cards[0].offsetLeft;
  }

  function indexFromScroll() {
    var step = cardStep();
    if (!step) return 0;
    var idx = Math.round(track.scrollLeft / step);
    return Math.max(0, Math.min(cards.length - 1, idx));
  }

  // Misura l'altezza naturale di ogni pannello (posizionato temporaneamente in
  // flusso normale, senza scatti visivi perché non c'è repaint tra le due
  // modifiche sincrone) così il contenitore didascalia può assumere sempre
  // l'altezza esatta del pannello attivo, invece di un min-height stimato che
  // su schermi stretti (testo che va a capo di più) può risultare troppo
  // basso e far traboccare il testo fuori dal box.
  function measurePanelHeights() {
    panelHeights = panels.map(function (panel) {
      var prevPosition = panel.style.position;
      panel.style.position = 'static';
      var h = panel.offsetHeight;
      panel.style.position = prevPosition;
      return h;
    });
  }

  function setActive(index) {
    index = Math.max(0, Math.min(cards.length - 1, index));
    activeIndex = index;
    cards.forEach(function (card, i) { card.classList.toggle('is-active', i === index); });
    dots.forEach(function (dot, i) {
      var on = i === index;
      dot.classList.toggle('is-active', on);
      dot.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    panels.forEach(function (panel, i) {
      var on = i === index;
      panel.classList.toggle('is-active', on);
      panel.setAttribute('aria-hidden', on ? 'false' : 'true');
    });
    if (caption && panelHeights[index] != null) caption.style.height = panelHeights[index] + 'px';
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === cards.length - 1;
  }

  function scrollToIndex(index) {
    index = Math.max(0, Math.min(cards.length - 1, index));
    var card = cards[index];
    var target = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;

    isProgrammatic = true;
    setActive(index);
    track.scrollTo({ left: target, behavior: reduceMotion ? 'auto' : 'smooth' });

    // Lo scroll nativo con scroll-snap-type:mandatory può fermarsi prima del
    // target su salti lunghi (osservato su più browser/condizioni): a fine
    // animazione correggiamo la posizione se non ha raggiunto esattamente
    // la card richiesta, cosa che garantisce sempre l'arrivo corretto.
    function finish() {
      if (Math.abs(track.scrollLeft - target) > 2) track.scrollLeft = target;
      isProgrammatic = false;
      track.removeEventListener('scrollend', finish);
    }
    track.addEventListener('scrollend', finish);
    clearTimeout(programmaticTimeout);
    programmaticTimeout = setTimeout(finish, reduceMotion ? 60 : 700);
  }

  function onScroll() {
    if (rafId) return;
    rafId = requestAnimationFrame(function () {
      rafId = null;
      if (isProgrammatic) return;
      setActive(indexFromScroll());
    });
  }

  track.addEventListener('scroll', onScroll, { passive: true });

  if (prevBtn) prevBtn.addEventListener('click', function () { scrollToIndex(activeIndex - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { scrollToIndex(activeIndex + 1); });

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () { scrollToIndex(i); });
  });

  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); scrollToIndex(activeIndex + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); scrollToIndex(activeIndex - 1); }
  });

  var resizeTimeout = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
      // il testo va a capo diversamente a una nuova larghezza: ri-misura
      // le altezze e riapplica quella del pannello attivo
      measurePanelHeights();
      if (caption) caption.style.height = panelHeights[activeIndex] + 'px';
      scrollToIndex(activeIndex);
    }, 150);
  });

  window.addEventListener('pagehide', function () {
    if (rafId) cancelAnimationFrame(rafId);
  });

  // hook sincrono per debug/test — non dipende da rAF/IO
  window.__galleryDebug = { getIndex: indexFromScroll, setActive: setActive, scrollToIndex: scrollToIndex, track: track, measurePanelHeights: measurePanelHeights };

  measurePanelHeights();
  setActive(0);
})();
