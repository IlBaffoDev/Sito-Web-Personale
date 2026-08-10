(function () {
  var links = document.querySelectorAll('.copy-email');
  if (!links.length || !navigator.clipboard) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var toastText = document.documentElement.lang === 'en' ? 'Email copied!' : 'Email copiata!';

  function showToast(link, text) {
    var toast = document.createElement('span');
    toast.className = 'copy-toast';
    toast.textContent = text;
    if (reduceMotion) toast.style.transition = 'none';
    link.style.position = link.style.position || 'relative';
    link.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add('is-visible'); });
    setTimeout(function () {
      toast.classList.remove('is-visible');
      setTimeout(function () { toast.remove(); }, reduceMotion ? 0 : 200);
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
