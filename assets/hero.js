(function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // typing effect on the profilo.ts mock
  var codeBlock = document.querySelector('.hero-code');
  if (codeBlock && !reduceMotion) {
    var lines = codeBlock.querySelectorAll('.hero-code-line');
    lines.forEach(function (line, i) {
      line.style.setProperty('--chars', line.textContent.length);
      line.style.setProperty('--delay', (i * 120) + 'ms');
    });
    codeBlock.classList.add('typing');
  }

  // mouse parallax on the hero dot pattern
  var hero = document.querySelector('.hero-grid');
  if (!hero || reduceMotion) return;
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;

  var maxOffset = 8;
  var ticking = false;
  var pendingX = 0;
  var pendingY = 0;

  function apply() {
    hero.style.setProperty('--px', pendingX.toFixed(1) + 'px');
    hero.style.setProperty('--py', pendingY.toFixed(1) + 'px');
    ticking = false;
  }

  hero.addEventListener('mousemove', function (e) {
    var rect = hero.getBoundingClientRect();
    var nx = (e.clientX - rect.left) / rect.width - 0.5;
    var ny = (e.clientY - rect.top) / rect.height - 0.5;
    pendingX = nx * maxOffset;
    pendingY = ny * maxOffset;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(apply);
    }
  });

  hero.addEventListener('mouseleave', function () {
    pendingX = 0;
    pendingY = 0;
    requestAnimationFrame(apply);
  });
})();
