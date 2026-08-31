(function () {
document.querySelectorAll('.nav-toggle').forEach(function (toggle, i) {
  var nav = toggle.closest('nav');
  if (!nav) return;

  // il bottone deve dichiarare quale pannello apre: senza aria-controls uno
  // screen reader annuncia "espanso" senza dire di che cosa
  var pannello = nav.querySelector('.nav-links');
  if (pannello) {
    if (!pannello.id) pannello.id = 'nav-links-' + i;
    toggle.setAttribute('aria-controls', pannello.id);
  }

  var close = function () {
    nav.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', close);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('nav-open')) {
      close();
      toggle.focus();
    }
  });
});

if (!window.__consoleEasterEgg) {
  window.__consoleEasterEgg = true;
  var isEnglish = document.documentElement.lang === 'en';
  console.log(
    isEnglish
      ? '%cPsst — if you\'re reading the source, maybe you\'d like to work together?'
      : '%cPsst — se stai leggendo il sorgente, forse ti interessa collaborare?',
    'color:#4FE3C1;font-weight:600;font-size:14px'
  );
  console.log('%cAndrea Zanasi — andreazanasi1993@gmail.com — github.com/IlBaffoDev', 'color:#8A93A3;font-size:12px');
}
})();
