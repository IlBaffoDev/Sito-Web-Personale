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
  var donut = document.getElementById('calc-donut');
  if (!rata || !carburante || !bollo || !assicurazione || !mensileOut || !annuoOut || !bars || !donut) return;

  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function num(el) {
    var v = parseFloat(el.value);
    return isNaN(v) || v < 0 ? 0 : v;
  }

  function fmt(n) {
    return Math.round(n).toLocaleString('it-IT') + ' €';
  }

  // stessa palette del donut "esempio" nella sezione #costi
  var segments = [
    { label: 'Rata', color: '#4B3FE3' },
    { label: 'Carburante', color: '#F08A3C' },
    { label: 'Bollo e assicurazione', color: '#E0537A' }
  ];

  // segmenti del donut: un <circle> per categoria, disegnato con stroke-dasharray
  // (lunghezza arco + resto) e ruotato al proprio punto d'inizio; le transizioni CSS
  // fanno l'animazione ad ogni ricalcolo senza ridisegnare nulla
  var R = 48;
  var CIRC = 2 * Math.PI * R;
  var rings = segments.map(function (seg) {
    var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', '60'); c.setAttribute('cy', '60'); c.setAttribute('r', String(R));
    c.setAttribute('fill', 'none');
    c.setAttribute('stroke', seg.color);
    c.setAttribute('stroke-width', '15');
    c.setAttribute('stroke-dasharray', '0 ' + CIRC);
    if (!reduceMotion) c.style.transition = 'stroke-dasharray .5s cubic-bezier(.22,1,.36,1), stroke-dashoffset .5s cubic-bezier(.22,1,.36,1)';
    donut.appendChild(c);
    return c;
  });

  // il totale non salta al nuovo valore: conta con easing dal valore mostrato
  var shownMensile = 0;
  var rafId = null;
  function animateTotal(target, annuo) {
    if (reduceMotion) {
      shownMensile = target;
      mensileOut.textContent = fmt(target);
      annuoOut.textContent = fmt(annuo);
      return;
    }
    if (rafId !== null) cancelAnimationFrame(rafId);
    var from = shownMensile;
    var t0 = null;
    var dur = 450;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      shownMensile = from + (target - from) * eased;
      mensileOut.textContent = fmt(shownMensile);
      annuoOut.textContent = fmt(shownMensile * 12);
      if (p < 1) rafId = requestAnimationFrame(step);
      else rafId = null;
    }
    rafId = requestAnimationFrame(step);
  }

  function update() {
    var values = [num(rata), num(carburante), (num(bollo) + num(assicurazione)) / 12];
    var mensile = values[0] + values[1] + values[2];
    var total = mensile || 1;

    animateTotal(mensile, mensile * 12);

    var offset = 0;
    rings.forEach(function (ring, i) {
      var len = (values[i] / total) * CIRC;
      ring.setAttribute('stroke-dasharray', len + ' ' + (CIRC - len));
      ring.setAttribute('stroke-dashoffset', String(-offset));
      offset += len;
    });

    bars.innerHTML = '';
    segments.forEach(function (seg, i) {
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:9px;font-size:13.5px';
      row.innerHTML =
        '<span style="width:9px;height:9px;border-radius:50%;flex-shrink:0;background:' + seg.color + '"></span>' +
        '<span style="flex:1;color:#4B4566;font-weight:600">' + seg.label + '</span>' +
        '<span style="font-weight:800;color:#1B1830">' + fmt(values[i]) + '</span>';
      bars.appendChild(row);
    });
  }

  [rata, carburante, bollo, assicurazione].forEach(function (el) {
    el.addEventListener('input', update);
  });
  update();
})();
