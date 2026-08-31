(function () {
  var links = document.querySelectorAll('.copy-email');
  if (!links.length || !navigator.clipboard) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var toastText = document.documentElement.lang === 'en' ? 'Email copied!' : 'Email copiata!';

  // live region unica e fuori dai link: annuncia la copia senza alterare il
  // nome accessibile dell'<a> che la contiene
  var annuncio = document.createElement('p');
  annuncio.className = 'sr-only';
  annuncio.setAttribute('role', 'status');
  annuncio.setAttribute('aria-live', 'polite');
  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(annuncio);
  });

  var toastCorrente = null;
  var timerNascondi = null;
  var timerRimuovi = null;

  function showToast(link, text) {
    clearTimeout(timerNascondi);
    clearTimeout(timerRimuovi);
    if (toastCorrente) toastCorrente.remove();

    var toast = document.createElement('span');
    toast.className = 'copy-toast';
    toast.textContent = text;
    toast.setAttribute('aria-hidden', 'true');
    if (reduceMotion) toast.style.transition = 'none';
    link.style.position = link.style.position || 'relative';
    link.appendChild(toast);
    toastCorrente = toast;

    annuncio.textContent = text;

    requestAnimationFrame(function () { toast.classList.add('is-visible'); });
    timerNascondi = setTimeout(function () {
      toast.classList.remove('is-visible');
      timerRimuovi = setTimeout(function () {
        toast.remove();
        if (toastCorrente === toast) toastCorrente = null;
      }, reduceMotion ? 0 : 200);
    }, 1600);
  }

  links.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var email = link.href.replace('mailto:', '');
      navigator.clipboard.writeText(email).then(function () {
        showToast(link, toastText);
      }).catch(function () {
        window.location.href = link.href;
      });
    });
  });
})();
