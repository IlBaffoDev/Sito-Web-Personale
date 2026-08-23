(function () {
  document.querySelectorAll('.coverflow').forEach(function (root) {
    var stage = root.querySelector('.coverflow-stage');
    var frame = root.querySelector('.coverflow-frame');
    if (!stage || !frame) return;

    var cards = Array.prototype.slice.call(stage.querySelectorAll('.coverflow-card'));
    var count = cards.length;
    if (!count) return;

    var prevBtn = root.parentElement.querySelector('.gallery-nav-prev, .coverflow-prev');
    var nextBtn = root.parentElement.querySelector('.gallery-nav-next, .coverflow-next');
    var captionWrap = root.parentElement.querySelector('.gallery-caption');
    var captionPanels = captionWrap ? Array.prototype.slice.call(captionWrap.querySelectorAll('.gallery-caption-panel')) : [];
    var dotsWrap = root.closest('.section-panel') ? root.closest('.section-panel').querySelector('.gallery-dots') : null;
    var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.querySelectorAll('.gallery-dot')) : [];

    var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

    // stessi default del componente originale (ruixen.ui coverflow-carousel)
    var rotate = 44;
    var depth = 0.6;
    var falloff = 0.56;
    var fade = 0.1;
    var gap = 0.05;
    var loop = true;

    var pos = 0;
    var target = 0;
    var width = 0;
    var rafId = null;
    var selected = 0;
    var drag = null;

    function indexAt(p) {
      return ((Math.round(p) % count) + count) % count;
    }

    function measure() {
      width = cards[0].getBoundingClientRect().width || 0;
    }

    function paint() {
      if (!width) return;
      var pitch = width * (1 + gap);

      cards.forEach(function (card, index) {
        var offset = index - pos;
        if (loop) {
          offset = ((offset % count) + count) % count;
          if (offset > count / 2) offset -= count;
        }
        var distance = Math.abs(offset);
        var ramp = Math.pow(distance, falloff);
        var tilt = Math.min(rotate * ramp, 82) * Math.sign(offset);

        card.style.transform =
          'translateX(calc(-50% + ' + (offset * pitch) + 'px)) ' +
          'translateZ(' + (-depth * width * ramp) + 'px) rotateY(' + (-tilt) + 'deg)';

        var edge = loop ? Math.min(1, Math.max(0, count / 2 - distance)) : 1;
        card.style.opacity = String(Math.max(0, 1 - fade * distance) * edge);
        card.style.zIndex = String(100 - Math.round(distance));
        card.style.pointerEvents = distance < 0.5 ? 'auto' : 'none';
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

    function settle(newTarget) {
      if (rafId !== null) cancelAnimationFrame(rafId);
      target = newTarget;
      var newSelected = indexAt(target);
      if (newSelected !== selected) {
        selected = newSelected;
        updateCaption();
      }

      function step() {
        var remaining = target - pos;
        if (Math.abs(remaining) < 0.0004 || reduceMotion) {
          pos = target;
          paint();
          rafId = null;
          return;
        }
        pos += remaining * 0.16;
        paint();
        rafId = requestAnimationFrame(step);
      }
      rafId = requestAnimationFrame(step);
    }

    function clamp(p) {
      return loop ? p : Math.max(0, Math.min(count - 1, p));
    }

    function nudge(by) {
      settle(clamp(Math.round(target) + by));
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { nudge(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { nudge(1); });

    dots.forEach(function (dot) {
      var step = parseInt(dot.getAttribute('data-step'), 10) - 1;
      dot.addEventListener('click', function () {
        var wrapped = step + Math.round((target - step) / count) * count;
        settle(clamp(wrapped));
      });
    });

    frame.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); nudge(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); nudge(1); }
    });

    frame.addEventListener('pointerdown', function (e) {
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
      frame.setPointerCapture(e.pointerId);
      target = pos;
      drag = { id: e.pointerId, x: e.clientX, pos: pos, v: 0, t: performance.now() };
    });

    frame.addEventListener('pointermove', function (e) {
      if (!drag || drag.id !== e.pointerId) return;
      var pitch = width * (1 + gap);
      if (!pitch) return;

      var now = performance.now();
      var previous = pos;
      pos = clamp(drag.pos - (e.clientX - drag.x) / pitch);
      drag.v = (pos - previous) / Math.max(now - drag.t, 1) * 1000;
      drag.t = now;

      var idx = indexAt(pos);
      if (idx !== selected) { selected = idx; updateCaption(); }
      paint();
    });

    function endDrag(e) {
      if (!drag || drag.id !== e.pointerId) return;
      var carried = Math.max(-2, Math.min(2, drag.v * 0.18));
      drag = null;
      settle(clamp(Math.round(pos + carried)));
    }
    frame.addEventListener('pointerup', endDrag);
    frame.addEventListener('pointercancel', endDrag);

    var resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(function () { measure(); paint(); }) : null;
    if (resizeObserver) resizeObserver.observe(frame);
    else window.addEventListener('resize', function () { measure(); paint(); });

    measure();
    updateCaption();
    paint();
  });
})();
