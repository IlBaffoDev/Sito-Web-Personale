(function () {
  document.querySelectorAll('.deck').forEach(function (deck) {
    var stack = deck.querySelector('.deck-stack');
    if (!stack) return;

    var cards = Array.prototype.slice.call(stack.querySelectorAll('.deck-card'));
    var count = cards.length;
    if (!count) return;

    var prevBtn = deck.querySelector('.gallery-nav-prev');
    var nextBtn = deck.querySelector('.gallery-nav-next');
    var carousel = deck.closest('.gallery-carousel');
    var captionWrap = carousel ? carousel.querySelector('.gallery-caption') : null;
    var captionPanels = captionWrap ? Array.prototype.slice.call(captionWrap.querySelectorAll('.gallery-caption-panel')) : [];
    var dotsWrap = deck.closest('.section-panel') ? deck.closest('.section-panel').querySelector('.gallery-dots') : null;
    var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.querySelectorAll('.gallery-dot')) : [];

    var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

    var selected = 0;
    var animating = false;
    var drag = null;

    // data-pos: "0" davanti, "1"/"2" dietro sfalsate, "x" nascoste. Le carte non
    // frontali sono decorative: aria-hidden per non far leggere 8 slide allo screen reader.
    function render() {
      cards.forEach(function (card, index) {
        var ahead = ((index - selected) % count + count) % count;
        card.setAttribute('data-pos', ahead <= 2 ? String(ahead) : 'x');
        card.setAttribute('aria-hidden', ahead === 0 ? 'false' : 'true');
      });
    }

    function updateCaption() {
      dots.forEach(function (dot) {
        var step = parseInt(dot.getAttribute('data-step'), 10) - 1;
        var isActive = step === selected;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-current', isActive ? 'true' : 'false');
      });

      if (!captionPanels.length) return;
      var activePanel = null;
      captionPanels.forEach(function (panel) {
        var step = parseInt(panel.getAttribute('data-step'), 10) - 1;
        var isActive = step === selected;
        panel.classList.toggle('is-active', isActive);
        panel.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        if (isActive) activePanel = panel;
      });
      if (activePanel && captionWrap) {
        captionWrap.style.height = activePanel.scrollHeight + 'px';
      }
    }

    // aspetta la fine della transition sulla carta, con timeout di sicurezza:
    // transitionend può non arrivare (tab in background, transition:none, ecc.)
    function afterTransition(card, done) {
      var called = false;
      function finish() {
        if (called) return;
        called = true;
        card.removeEventListener('transitionend', onEnd);
        done();
      }
      function onEnd(e) { if (e.target === card && e.propertyName === 'transform') finish(); }
      card.addEventListener('transitionend', onEnd);
      setTimeout(finish, 520);
    }

    function setSelected(index) {
      selected = ((index % count) + count) % count;
      render();
      updateCaption();
    }

    // avanti: la carta frontale vola via di lato, il mazzo scala in avanti.
    // dir: -1 esce a sinistra (avanza), +1 esce a destra.
    function flyTo(targetIndex, dir) {
      if (animating || targetIndex === selected) return;
      if (reduceMotion) { setSelected(targetIndex); return; }
      animating = true;

      if (dir < 0) {
        var front = cards[selected];
        front.classList.add('is-leaving');
        front.style.transform = 'translateX(-130%) rotate(-14deg)';
        front.style.opacity = '0';
        setSelected(targetIndex);
        // la carta uscente tiene il suo transform inline finché non è fuori,
        // poi rientra silenziosamente nel mazzo (è già data-pos x/1/2)
        afterTransition(front, function () {
          front.classList.remove('is-leaving');
          front.style.transition = 'none';
          front.style.transform = '';
          front.style.opacity = '';
          void front.offsetWidth;
          front.style.transition = '';
          animating = false;
        });
      } else {
        // indietro: la carta target parte già fuori a sinistra e rientra a molla
        var incoming = cards[targetIndex];
        incoming.classList.add('is-dragging');
        incoming.style.transform = 'translateX(-130%) rotate(-14deg)';
        incoming.style.opacity = '0';
        incoming.style.zIndex = '40';
        void incoming.offsetWidth;
        incoming.classList.remove('is-dragging');
        setSelected(targetIndex);
        incoming.style.transform = '';
        incoming.style.opacity = '';
        afterTransition(incoming, function () {
          incoming.style.zIndex = '';
          animating = false;
        });
      }
    }

    function nudge(by) {
      flyTo(((selected + by) % count + count) % count, by > 0 ? -1 : 1);
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { nudge(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { nudge(1); });

    dots.forEach(function (dot) {
      var step = parseInt(dot.getAttribute('data-step'), 10) - 1;
      dot.addEventListener('click', function () {
        if (step === selected) return;
        // salto diretto: esce dal lato "più corto" del giro
        var forward = ((step - selected) % count + count) % count;
        flyTo(step, forward <= count - forward ? -1 : 1);
      });
    });

    deck.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); nudge(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); nudge(1); }
    });

    // drag della carta frontale: segue il dito con rotazione proporzionale,
    // oltre soglia (35% larghezza o flick veloce) vola via, altrimenti spring-back
    stack.addEventListener('pointerdown', function (e) {
      if (animating) return;
      var front = cards[selected];
      if (!front.contains(e.target)) return;
      stack.setPointerCapture(e.pointerId);
      drag = { id: e.pointerId, x: e.clientX, dx: 0, v: 0, t: performance.now(), card: front, moved: false };
    });

    stack.addEventListener('pointermove', function (e) {
      if (!drag || drag.id !== e.pointerId) return;
      var now = performance.now();
      var dx = e.clientX - drag.x;
      drag.v = (dx - drag.dx) / Math.max(now - drag.t, 1) * 1000;
      drag.dx = dx;
      drag.t = now;
      if (!drag.moved && Math.abs(dx) < 6) return;
      drag.moved = true;
      drag.card.classList.add('is-dragging');
      drag.card.style.transform = 'translateX(' + dx + 'px) rotate(' + (dx / 22) + 'deg)';
    });

    function endDrag(e) {
      if (!drag || drag.id !== e.pointerId) return;
      var d = drag;
      drag = null;
      d.card.classList.remove('is-dragging');
      var width = stack.getBoundingClientRect().width || 1;
      var thrown = d.moved && (Math.abs(d.dx) > width * 0.35 || Math.abs(d.v) > 600);

      if (!thrown || reduceMotion) {
        d.card.style.transform = '';
        if (thrown) nudge(d.dx < 0 ? 1 : -1);
        return;
      }

      animating = true;
      var sign = d.dx < 0 ? -1 : 1;
      d.card.classList.add('is-leaving');
      d.card.style.transform = 'translateX(' + sign * 130 + '%) rotate(' + sign * 14 + 'deg)';
      d.card.style.opacity = '0';
      setSelected(selected - sign);
      afterTransition(d.card, function () {
        d.card.classList.remove('is-leaving');
        d.card.style.transition = 'none';
        d.card.style.transform = '';
        d.card.style.opacity = '';
        void d.card.offsetWidth;
        d.card.style.transition = '';
        animating = false;
      });
    }
    stack.addEventListener('pointerup', endDrag);
    stack.addEventListener('pointercancel', endDrag);

    setSelected(0);
  });
})();
