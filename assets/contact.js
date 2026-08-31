(function () {
  var SUPABASE_URL = 'https://tttxrexiqadkojftwtne.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_sanEbOFPEz44lYNj6HwMaQ_IBLSigqq';

  var form = document.getElementById('contact-form');
  var status = document.getElementById('contact-status');
  if (!form || !status) return;

  var nome = document.getElementById('contact-nome');
  var email = document.getElementById('contact-email');
  var categoria = document.getElementById('contact-categoria');
  var messaggio = document.getElementById('contact-messaggio');
  var honeypot = document.getElementById('contact-hp');
  var button = form.querySelector('button[type="submit"]');
  var buttonDefaultText = button.textContent;

  function setDisabled(disabled) {
    nome.disabled = disabled;
    email.disabled = disabled;
    categoria.disabled = disabled;
    messaggio.disabled = disabled;
    button.disabled = disabled;
  }

  function showMessage(text, isError) {
    status.textContent = text;
    status.className = isError ? 'contact-msg is-error' : 'contact-msg';
    status.focus();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (honeypot && honeypot.value) {
      form.style.display = 'none';
      showMessage('✓ Messaggio inviato! Ti rispondo appena posso.', false);
      return;
    }

    var emailValue = (email.value || '').trim();
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
    if (!emailOk) {
      email.setCustomValidity('Inserisci un indirizzo email valido');
      email.reportValidity();
      return;
    }
    email.setCustomValidity('');

    setDisabled(true);
    button.textContent = '...';

    // senza timeout una rete che accetta la connessione ma non risponde mai
    // (captive portal) lasciava i campi disabilitati e il bottone a '...' a
    // tempo indefinito, senza modo di riprovare se non ricaricando
    fetch(SUPABASE_URL + '/rest/v1/contatti_sito', {
      method: 'POST',
      signal: AbortSignal.timeout(15000),
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        nome: (nome.value || '').trim(),
        email: emailValue,
        categoria: categoria.value,
        messaggio: (messaggio.value || '').trim()
      })
    }).then(function (res) {
      if (!res.ok) {
        // il DB rifiuta due invii ravvicinati dalla stessa email
        // (trigger di throttling, supabase/contatti-hardening.sql)
        return res.text().then(function (corpo) {
          var e = new Error('richiesta rifiutata: ' + res.status);
          if (/ravvicinati/.test(corpo)) e.name = 'TroppiInvii';
          throw e;
        });
      }
      form.style.display = 'none';
      showMessage('✓ Messaggio inviato! Ti rispondo appena posso.', false);
    }).catch(function (err) {
      setDisabled(false);
      button.textContent = buttonDefaultText;
      var testo = 'Qualcosa è andato storto, riprova tra poco.';
      if (err && err.name === 'TimeoutError') testo = 'La rete non risponde. Controlla la connessione e riprova.';
      if (err && err.name === 'TroppiInvii') testo = 'Hai già inviato un messaggio poco fa: aspetta un paio di minuti.';
      showMessage(testo, true);
    });
  });
})();
