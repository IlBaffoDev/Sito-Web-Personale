(function () {
  var section = document.getElementById('calcolatore');
  if (!section) return;

  var rata = document.getElementById('calc-rata');
  var carburante = document.getElementById('calc-carburante');
  var bollo = document.getElementById('calc-bollo');
  var assicurazione = document.getElementById('calc-assicurazione');
  var mensileOut = document.getElementById('calc-mensile');
  var annuoOut = document.getElementById('calc-annuo');
  var bars = document.getElementById('calc-bars');
  if (!rata || !carburante || !bollo || !assicurazione || !mensileOut || !annuoOut || !bars) return;

  function num(el) {
    var v = parseFloat(el.value);
    return isNaN(v) || v < 0 ? 0 : v;
  }

  function fmt(n) {
    return Math.round(n).toLocaleString('it-IT') + ' €';
  }

  var segments = [
    { label: 'Rata', color: '#4B3FE3' },
    { label: 'Carburante', color: '#F08A3C' },
    { label: 'Bollo e assicurazione', color: '#E0537A' }
  ];

  function update() {
    var meseRata = num(rata);
    var meseCarburante = num(carburante);
    var meseScadenze = (num(bollo) + num(assicurazione)) / 12;
    var mensile = meseRata + meseCarburante + meseScadenze;
    var annuo = mensile * 12;

    mensileOut.textContent = fmt(mensile);
    annuoOut.textContent = fmt(annuo);

    var values = [meseRata, meseCarburante, meseScadenze];
    var total = mensile || 1;
    bars.innerHTML = '';
    segments.forEach(function (seg, i) {
      var pct = Math.round((values[i] / total) * 100);
      var row = document.createElement('div');
      row.innerHTML =
        '<div style="display:flex;justify-content:space-between;font-size:12px;color:#8A85A3;margin-bottom:3px">' +
          '<span>' + seg.label + '</span><span>' + fmt(values[i]) + '</span>' +
        '</div>' +
        '<div style="background:#F1EEFF;border-radius:100px;height:6px;overflow:hidden">' +
          '<div style="width:' + pct + '%;background:' + seg.color + ';height:100%;border-radius:100px"></div>' +
        '</div>';
      bars.appendChild(row);
    });
  }

  [rata, carburante, bollo, assicurazione].forEach(function (el) {
    el.addEventListener('input', update);
  });
  update();
})();
