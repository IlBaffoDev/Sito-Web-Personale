(function () {
  var bar = document.querySelector('.scroll-progress-bar');
  if (!bar) return;

  var rafId = null;
  function update() {
    rafId = null;
    var doc = document.documentElement;
    var scrollable = doc.scrollHeight - doc.clientHeight;
    bar.style.width = (scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', function () { if (!rafId) rafId = requestAnimationFrame(update); }, { passive: true });
  window.addEventListener('resize', update);

  update();
})();
