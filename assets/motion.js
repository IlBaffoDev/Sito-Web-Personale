(function () {
  var EASE = [0.22, 1, 0.36, 1];
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function showInstantly(section) {
    section.style.opacity = '1';
    section.style.transform = 'none';
    var group = section.querySelector('[data-stagger]');
    if (group) {
      Array.prototype.forEach.call(group.children, function (el) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }
  }

  function hideForReveal(section) {
    section.style.opacity = '0';
    section.style.transform = 'translateY(16px)';
    var group = section.querySelector('[data-stagger]');
    if (group) {
      Array.prototype.forEach.call(group.children, function (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
      });
    }
  }

  var lib = null;
  var libFailed = false;
  var queue = [];

  function doWireReveal(section) {
    var group = section.querySelector('[data-stagger]');
    var cards = group ? Array.prototype.slice.call(group.children) : [];

    lib.inView(section, function () {
      lib.animate(section, { opacity: 1, transform: 'translateY(0px)' }, { duration: 0.5, ease: EASE });
      if (cards.length) {
        lib.animate(cards, { opacity: 1, transform: 'translateY(0px)' }, {
          duration: 0.45,
          delay: lib.stagger(0.07, { startDelay: 0.08 }),
          ease: EASE
        });
      }
    // amount basso + margin: il trigger scatta ~300px PRIMA che la sezione entri nel
    // viewport, così anche scrollando veloce non si vedono mai schermate bianche
    // (con amount 0.15 le sezioni alte 1000-1500px restavano invisibili a lungo)
    }, { amount: 0.05, margin: '0px 0px 300px 0px' });
  }

  function wireReveal(section) {
    if (!section) return;
    if (reduceMotion || libFailed) { showInstantly(section); return; }
    if (!lib) { hideForReveal(section); queue.push(section); return; }
    doWireReveal(section);
  }

  window.__motionReveal = wireReveal;

  var initialSections = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (reduceMotion) {
    initialSections.forEach(showInstantly);
    return;
  }

  initialSections.forEach(hideForReveal);

  function wireHovers(mod) {
    var lifts = [
      { sel: '.btn-primary, .btn-outline, .store-btn', y: -3, duration: 0.2 },
      { sel: '.fact-grid > div, .project-grid, .github-grid > a', y: -4, duration: 0.25 },
      { sel: '.feature-grid > div, .pricing-card', y: -6, duration: 0.25 },
      { sel: '#faq details', y: -3, duration: 0.2 }
    ];
    lifts.forEach(function (cfg) {
      mod.hover(cfg.sel, function (el) {
        mod.animate(el, { transform: 'translateY(' + cfg.y + 'px)' }, { duration: cfg.duration, ease: EASE });
        return function () {
          mod.animate(el, { transform: 'translateY(0px)' }, { duration: cfg.duration, ease: EASE });
        };
      });
    });
  }

  // counter animati: [data-count-to] conta da 0 al valore quando entra in viewport,
  // una volta sola. data-count-to="673.02" data-count-decimals="2" — formato it-IT
  // (virgola) ricostruito a mano perché toLocaleString su ogni frame costa troppo.
  (function () {
    var els = Array.prototype.slice.call(document.querySelectorAll('[data-count-to]'));
    if (!els.length || !('IntersectionObserver' in window)) return;

    function fmt(value, decimals) {
      var s = value.toFixed(decimals);
      var parts = s.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return decimals > 0 ? parts[0] + ',' + parts[1] : parts[0];
    }

    function run(el) {
      var target = parseFloat(el.getAttribute('data-count-to'));
      var decimals = parseInt(el.getAttribute('data-count-decimals') || '0', 10);
      if (isNaN(target)) return;
      if (reduceMotion) { el.textContent = fmt(target, decimals); return; }
      var t0 = null;
      var dur = 900;
      function step(t) {
        if (t0 === null) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(target * eased, decimals);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    var seen = new WeakSet();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || seen.has(entry.target)) return;
        seen.add(entry.target);
        io.unobserve(entry.target);
        run(entry.target);
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  })();

  import('https://cdn.jsdelivr.net/npm/motion@13.1.1/+esm').then(function (mod) {
    lib = mod;
    initialSections.forEach(doWireReveal);
    queue.forEach(doWireReveal);
    queue = [];
    wireHovers(mod);
  }).catch(function () {
    libFailed = true;
    initialSections.forEach(showInstantly);
    queue.forEach(showInstantly);
    queue = [];
  });
})();
