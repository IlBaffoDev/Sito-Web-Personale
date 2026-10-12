// Calcolatore della landing GCV (#calcolatore): costo mensile e annuo indicativo da rata,
// carburante, bollo e assicurazione. Tutto nel browser, niente viene inviato o salvato.
(function () {
  var section = document.getElementById('calcolatore');
  if (!section) return;

  var campi = {
    rata: document.getElementById('calc-rata'),
    carburante: document.getElementById('calc-carburante'),
    bollo: document.getElementById('calc-bollo'),
    assicurazione: document.getElementById('calc-assicurazione')
  };
  var mensileOut = document.getElementById('calc-mensile');
  var annuoOut = document.getElementById('calc-annuo');
  if (!campi.rata || !campi.carburante || !campi.bollo || !campi.assicurazione || !mensileOut || !annuoOut) return;

  function num(el) {
    var v = parseFloat(String(el.value).replace(',', '.'));
    return isNaN(v) || v < 0 ? 0 : v;
  }
  function fmt(n) {
    // punto delle migliaia anche a quattro cifre (5.070 €): toLocaleString('it-IT') lo omette
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €';
  }

  // il totale scorre dal valore di prima a quello nuovo (subito, con «riduci movimento»)
  var calmo = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mostrato = 0, corsa = 0, paracadute = 0;
  var live = section.querySelector('[aria-live]');
  function scrivi(v) {
    mostrato = v;
    mensileOut.textContent = fmt(v);
    annuoOut.textContent = fmt(v * 12);
  }
  function anima(fine) {
    cancelAnimationFrame(corsa);
    if (calmo) { scrivi(fine); return; }
    if (live) live.setAttribute('aria-busy', 'true');
    var da = mostrato, t0 = null;
    // paracadute: se il browser non dà frame (scheda in background, pagina ancora in caricamento)
    // il valore giusto arriva comunque
    clearTimeout(paracadute);
    paracadute = setTimeout(function () {
      cancelAnimationFrame(corsa);
      scrivi(fine);
      if (live) live.removeAttribute('aria-busy');
    }, 700);
    function passo(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / 450);
      scrivi(da + (fine - da) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) corsa = requestAnimationFrame(passo);
      else if (live) live.removeAttribute('aria-busy');
    }
    corsa = requestAnimationFrame(passo);
  }

  function aggiorna() {
    // bollo e assicurazione sono annui: nel mese pesano un dodicesimo
    var voci = {
      rata: num(campi.rata),
      carburante: num(campi.carburante),
      bollo: num(campi.bollo) / 12,
      assicurazione: num(campi.assicurazione) / 12
    };
    var tot = voci.rata + voci.carburante + voci.bollo + voci.assicurazione;
    anima(tot);
    Object.keys(voci).forEach(function (k) {
      var seg = section.querySelector('[data-voce="' + k + '"]');
      if (seg) seg.style.width = (tot ? voci[k] / tot * 100 : 0) + '%';
      var val = section.querySelector('[data-val="' + k + '"]');
      if (val) val.textContent = fmt(voci[k]);
    });
  }

  Object.keys(campi).forEach(function (k) { campi[k].addEventListener('input', aggiorna); });
  aggiorna();
})();
