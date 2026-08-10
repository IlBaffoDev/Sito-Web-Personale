(function () {
  var anchor = document.getElementById('competenze');
  if (!anchor) return;

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  var isEnglish = document.documentElement.lang === 'en';
  var locale = isEnglish ? 'en-US' : 'it-IT';
  var i18n = isEnglish
    ? { eyebrow: 'Activity', heading: 'What I’m building on GitHub.' }
    : { eyebrow: 'Attività', heading: 'Cosa sto costruendo su GitHub.' };

  fetch('https://api.github.com/users/IlBaffoDev/repos?sort=updated&per_page=6&type=owner')
    .then(function (res) {
      if (!res.ok) throw new Error('bad status');
      return res.json();
    })
    .then(function (repos) {
      var list = repos.filter(function (r) { return !r.fork; }).slice(0, 6);
      if (!list.length) return;

      var cards = list.map(function (repo) {
        var desc = repo.description ? '<p style="margin:0 0 12px;color:#A7AEBB;font-size:14px;line-height:1.6">' + escapeHtml(repo.description) + '</p>' : '';
        var meta = [];
        if (repo.language) meta.push(escapeHtml(repo.language));
        if (repo.stargazers_count > 0) meta.push('★ ' + repo.stargazers_count);
        meta.push(new Date(repo.updated_at).toLocaleDateString(locale));
        return (
          '<a href="' + repo.html_url + '" target="_blank" rel="noopener" style="display:block;background:#12161F;border:1px solid #1E2430;border-radius:12px;padding:20px;color:#EDEFF3;text-decoration:none">' +
          '<span style="display:block;font-family:\'Space Grotesk\',sans-serif;font-weight:600;font-size:16px;margin-bottom:8px;color:#4FE3C1">' + escapeHtml(repo.name) + '</span>' +
          desc +
          '<span style="display:block;font-family:\'IBM Plex Mono\',monospace;font-size:12px;color:#5C6577">' + meta.join(' · ') + '</span>' +
          '</a>'
        );
      }).join('');

      var section = document.createElement('section');
      section.className = 'reveal';
      section.style.cssText = 'max-width:1120px;margin:0 auto;padding:56px 32px;border-top:1px solid #1A1E28';
      section.innerHTML =
        '<p style="font-family:\'IBM Plex Mono\',monospace;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#4FE3C1;margin:0 0 12px">' + i18n.eyebrow + '</p>' +
        '<h2 style="font-family:\'Space Grotesk\',sans-serif;font-weight:600;font-size:30px;letter-spacing:-.3px;margin:0 0 32px">' + i18n.heading + '</h2>' +
        '<div class="github-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">' + cards + '</div>';

      anchor.insertAdjacentElement('afterend', section);
      // inserted after reveal.js already ran its one-time scan, so drive the
      // fade-in directly instead of relying on its IntersectionObserver
      requestAnimationFrame(function () { section.classList.add('is-visible'); });
    })
    .catch(function () { /* no network / rate limit / offline: leave the page as-is */ });
})();
