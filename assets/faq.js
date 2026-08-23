(function () {
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('#faq details').forEach(function (details) {
    var summary = details.querySelector('summary');
    var content = summary ? summary.nextElementSibling : null;
    if (!summary || !content) return;

    content.style.overflow = 'hidden';
    content.style.maxHeight = details.open ? 'none' : '0px';
    if (!reduceMotion) content.style.transition = 'max-height .3s ease';

    var closeTimeout = null;

    function finishClose() {
      clearTimeout(closeTimeout);
      content.removeEventListener('transitionend', onTransitionEnd);
      details.open = false;
    }
    function onTransitionEnd(e) {
      if (e.target === content && e.propertyName === 'max-height') finishClose();
    }

    summary.addEventListener('click', function (e) {
      e.preventDefault();
      clearTimeout(closeTimeout);
      content.removeEventListener('transitionend', onTransitionEnd);

      if (details.open) {
        // pin the current pixel height, force a reflow so the browser commits it,
        // then collapse — without the forced reflow the browser can coalesce the
        // two style writes and skip the transition entirely.
        content.style.maxHeight = content.scrollHeight + 'px';
        void content.offsetHeight;
        content.style.maxHeight = '0px';
        content.addEventListener('transitionend', onTransitionEnd);
        closeTimeout = setTimeout(finishClose, reduceMotion ? 0 : 350);
      } else {
        details.open = true;
        var h = content.scrollHeight;
        content.style.maxHeight = h + 'px';
        // una volta finita l'apertura, torna a 'none': il contenuto resta sempre
        // interamente visibile anche se cambia altezza dopo (resize, wrap del testo)
        var openTimeout = setTimeout(function () { content.style.maxHeight = 'none'; }, reduceMotion ? 0 : 350);
        content.addEventListener('transitionend', function te(ev) {
          if (ev.target !== content || ev.propertyName !== 'max-height') return;
          clearTimeout(openTimeout);
          content.style.maxHeight = 'none';
          content.removeEventListener('transitionend', te);
        });
      }
    });
  });
})();
