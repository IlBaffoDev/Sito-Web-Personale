(function () {
  var panel = document.querySelector('.widget-panel');
  if (!panel) return;

  var dotGrid = panel.querySelector('.widget-dot-grid');
  var mockups = Array.prototype.slice.call(panel.querySelectorAll('.widget-mockup'));
  if (!dotGrid && !mockups.length) return;
  if (window.matchMedia && (matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(pointer: coarse)').matches)) return;

  var rafId = null;
  var pending = null;

  function apply() {
    rafId = null;
    if (!pending) return;
    if (dotGrid) {
      dotGrid.style.setProperty('--widget-dot-x', pending.dx + 'px');
      dotGrid.style.setProperty('--widget-dot-y', pending.dy + 'px');
    }
    mockups.forEach(function (m) {
      m.style.setProperty('--tilt-y', pending.ry + 'deg');
      m.style.setProperty('--tilt-x', pending.rx + 'deg');
    });
  }

  panel.addEventListener('pointermove', function (e) {
    var r = panel.getBoundingClientRect();
    var px = (e.clientX - r.left) / r.width - 0.5;
    var py = (e.clientY - r.top) / r.height - 0.5;
    pending = { dx: px * -16, dy: py * -16, ry: px * 12, rx: py * -8 };
    if (!rafId) rafId = requestAnimationFrame(apply);
  });

  panel.addEventListener('pointerleave', function () {
    pending = { dx: 0, dy: 0, ry: 0, rx: 0 };
    if (!rafId) rafId = requestAnimationFrame(apply);
  });
})();
