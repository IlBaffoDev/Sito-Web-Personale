(function () {
  // navbar glass sticky: nascosta finché sei nell'hero (lì c'è già la nav vera),
  // scende quando l'hero esce dal viewport, risale quando torni su.
  var bar = document.querySelector('.sticky-nav');
  var hero = document.getElementById('hero');
  if (!bar || !hero) return;

  var visible = false;
  function set(v) {
    if (v === visible) return;
    visible = v;
    bar.classList.toggle('is-visible', v);
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      set(!entries[0].isIntersecting);
    }, { rootMargin: '-80px 0px 0px 0px' }).observe(hero);
  } else {
    window.addEventListener('scroll', function () {
      set(window.scrollY > hero.offsetHeight);
    }, { passive: true });
  }
})();
