(function () {
  var bar = document.querySelector('.sticky-cta');
  var hero = document.getElementById('main');
  var downloadTarget = document.getElementById('download');
  if (!bar || !hero || !downloadTarget || !('IntersectionObserver' in window)) return;

  var heroPassed = false;
  var downloadVisible = true;

  function update() {
    bar.classList.toggle('is-visible', heroPassed && !downloadVisible);
  }

  new IntersectionObserver(function (entries) {
    heroPassed = !entries[0].isIntersecting && entries[0].boundingClientRect.top < 0;
    update();
  }, { threshold: 0 }).observe(hero);

  new IntersectionObserver(function (entries) {
    downloadVisible = entries[0].isIntersecting;
    update();
  }, { threshold: 0.2 }).observe(downloadTarget);
})();
