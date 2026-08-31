(function () {
  var anchor = document.getElementById('github-activity');
  if (!anchor) return;

  var columns = anchor.dataset.columns || '3';
  var maxWidth = anchor.dataset.maxWidth || '1120px';
  var paddingBottom = anchor.dataset.paddingBottom || '56px';

  // textContent -> innerHTML non neutralizza apici e virgolette: oggi tutti i
  // valori finiscono in contesto testo, ma basta spostarne uno dentro un
  // attributo perche' diventi XSS, con la sorgente controllata da chi rinomina
  // un proprio repo pubblico
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  var isEnglish = document.documentElement.lang === 'en';
  var locale = isEnglish ? 'en-US' : 'it-IT';
  var i18n = isEnglish
    ? { eyebrow: 'Activity', heading: 'What I’m building on GitHub.' }
    : { eyebrow: 'Attività', heading: 'Cosa sto costruendo su GitHub.' };

  fetch('https://api.github.com/users/IlBaffoDev/repos?sort=updated&per_page=6&type=owner',
        { signal: AbortSignal.timeout(8000) })
    .then(function (res) {
      if (!res.ok) throw new Error('risposta ' + res.status);
      return res.json();
    })
    .then(function (repos) {
      // l'API puo' rispondere 200 con un oggetto (es. rate limit documentato):
      // senza questo controllo il TypeError finiva in un catch muto
      if (!Array.isArray(repos)) throw new Error('risposta non e\' un array');
      var list = repos.filter(function (r) { return !r.fork; }).slice(0, 6);
      if (!list.length) return;

      var cards = list.map(function (repo) {
        var desc = repo.description ? '<p style="margin:0 0 12px;color:#A7AEBB;font-size:14px;line-height:1.6">' + escapeHtml(repo.description) + '</p>' : '';
        var meta = [];
        if (repo.language) meta.push(escapeHtml(repo.language));
        if (repo.stargazers_count > 0) meta.push('★ ' + escapeHtml(repo.stargazers_count));
        meta.push(new Date(repo.updated_at).toLocaleDateString(locale));
        return (
          '<a href="' + encodeURI(repo.html_url) + '" target="_blank" rel="noopener" style="display:block;background:#12161F;border:1px solid #1E2430;border-radius:12px;padding:20px;color:#EDEFF3;text-decoration:none">' +
          '<span style="display:block;font-family:\'Space Grotesk\',sans-serif;font-weight:600;font-size:16px;margin-bottom:8px;color:#4FE3C1">' + escapeHtml(repo.name) + '</span>' +
          desc +
          '<span style="display:block;font-family:\'IBM Plex Mono\',monospace;font-size:12px;color:#8A93A3">' + meta.join(' · ') + '</span>' +
          '</a>'
        );
      }).join('');

      var section = document.createElement('section');
      section.className = 'reveal';
      section.style.cssText = 'max-width:' + maxWidth + ';margin:0 auto;padding:56px 32px ' + paddingBottom + ';border-top:1px solid #1A1E28';
      section.innerHTML =
        '<p style="font-family:\'IBM Plex Mono\',monospace;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#4FE3C1;margin:0 0 12px">' + i18n.eyebrow + '</p>' +
        '<h2 style="font-family:\'Space Grotesk\',sans-serif;font-weight:600;font-size:30px;letter-spacing:-.3px;margin:0 0 32px">' + i18n.heading + '</h2>' +
        '<div class="github-grid" data-stagger style="display:grid;grid-template-columns:repeat(' + columns + ',1fr);gap:16px">' + cards + '</div>';

      anchor.replaceWith(section);
      // inserted after motion.js already ran its one-time scan of .reveal
      // elements present at load, so wire this one up directly
      if (window.__motionReveal) {
        window.__motionReveal(section);
      } else {
        section.style.opacity = '1';
      }
    })
    .catch(function (err) {
      // la pagina degrada senza la sezione, ma lasciamo una traccia: prima il
      // catch era muto e non c'era modo di sapere perche' non compariva
      console.warn('[github-widget] sezione non caricata:', err && err.message ? err.message : err);
    });
})();
