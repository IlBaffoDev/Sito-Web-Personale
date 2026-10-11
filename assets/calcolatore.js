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
    return Math.round(n).toLocaleString('it-IT') + ' €';
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
    mensileOut.textContent = fmt(tot);
    annuoOut.textContent = fmt(tot * 12);
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
