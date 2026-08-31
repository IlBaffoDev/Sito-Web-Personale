(function () {
  var bar = document.querySelector('.scroll-progress-bar');
  if (!bar) return;

  var rafId = null;
  function pianifica() { if (!rafId) rafId = requestAnimationFrame(update); }
  function update() {
    rafId = null;
    var doc = document.documentElement;
    var scrollable = doc.scrollHeight - doc.clientHeight;
    bar.style.width = (scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', pianifica, { passive: true });
  window.addEventListener('resize', pianifica);

  update();
})();
