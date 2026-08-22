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
    section.style.transform = 'translateY(24px)';
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
    }, { amount: 0.15 });
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
