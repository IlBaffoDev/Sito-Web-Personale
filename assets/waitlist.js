(function () {
  var SUPABASE_URL = 'https://tttxrexiqadkojftwtne.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_sanEbOFPEz44lYNj6HwMaQ_IBLSigqq';

  var wrap = document.querySelector('.waitlist');
  var form = document.querySelector('.waitlist-form');
  if (!wrap || !form) return;

  var input = form.querySelector('input[type="email"]');
  var button = form.querySelector('button');

  function showMessage(text, isError) {
    wrap.innerHTML = '<span class="waitlist-msg' + (isError ? ' is-error' : '') + '">' + text + '</span>';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = (input.value || '').trim();
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      input.setCustomValidity('Inserisci un indirizzo email valido');
      input.reportValidity();
      return;
    }
    input.setCustomValidity('');

    input.disabled = true;
    button.disabled = true;
    button.textContent = '...';

    fetch(SUPABASE_URL + '/rest/v1/lista_attesa_sito', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ email: email })
    }).then(function (res) {
      if (res.ok) {
        showMessage('✓ Fatto! Ti scriviamo appena l\'app è pubblica.', false);
      } else if (res.status === 409) {
        showMessage('Sei già in lista — ti avviseremo al lancio!', false);
      } else {
        throw new Error('request failed: ' + res.status);
      }
    }).catch(function () {
      input.disabled = false;
      button.disabled = false;
      button.textContent = 'Avvisami';
      showMessage('Qualcosa è andato storto, riprova tra poco.', true);
    });
  });
})();
