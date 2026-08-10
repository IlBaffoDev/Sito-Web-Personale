(function () {
  var scroller = document.querySelector('.gallery-scroller');
  if (!scroller || !('IntersectionObserver' in window)) return;

  var steps = scroller.querySelectorAll('.gallery-step');
  if (!steps.length) return;

  var sticky = scroller.querySelector('.gallery-sticky');

  function setActive(step) {
    scroller.querySelectorAll('.is-active').forEach(function (el) {
      if (el !== step) el.classList.remove('is-active');
    });
    step.classList.add('is-active');
    scroller.querySelectorAll('.gallery-img[data-step="' + step.dataset.step + '"]').forEach(function (img) {
      img.classList.add('is-active');
    });
    if (sticky) sticky.setAttribute('data-active-step', step.dataset.step);
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) setActive(entry.target);
    });
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

  steps.forEach(function (step) { observer.observe(step); });

  window.addEventListener('pagehide', function () { observer.disconnect(); });
})();
