// Piccoli movimenti della landing GCV: navbar che si compatta scorrendo, numeri che contano quando
// entrano nello schermo ([data-conta]) e il telefono di #funzioni che si inclina appena col mouse.
// Senza JS i numeri sono già quelli giusti; con «riduci movimento» resta solo la navbar.
(function () {
  var nav = document.querySelector('.nav-chiara');
  if (nav) {
    // soglie diverse per entrare e uscire: cambiare il padding sposta la pagina e non deve rimbalzare
    var compatta = function () {
      var y = window.scrollY;
      if (y > 60) nav.classList.add('nav--compatta');
      else if (y < 20) nav.classList.remove('nav--compatta');
    };
    window.addEventListener('scroll', compatta, { passive: true });
    compatta();
  }

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // le onde si muovono solo quando la loro fascia è nello schermo (l'animazione della maschera ridipinge)
  var fasce = Array.prototype.slice.call(document.querySelectorAll('.onda-su, .onda-giu, #hero'));
  if (fasce.length && 'IntersectionObserver' in window) {
    var ioOnde = new IntersectionObserver(function (vv) {
      vv.forEach(function (v) { v.target.classList.toggle('onda-ferma', !v.isIntersecting); });
    });
    fasce.forEach(function (f) { f.classList.add('onda-ferma'); ioOnde.observe(f); });
  }

  // numeri che contano da zero al valore scritto nella pagina
  var numeri = Array.prototype.slice.call(document.querySelectorAll('[data-conta]'));
  if (numeri.length && 'IntersectionObserver' in window) {
    var conta = function (el) {
      var fine = parseFloat(el.getAttribute('data-conta')) || 0;
      var t0 = null;
      var passo = function (t) {
        if (t0 === null) t0 = t;
        var p = Math.min(1, (t - t0) / 900);
        var v = Math.round(fine * (1 - Math.pow(1 - p, 3)));
        // il punto delle migliaia anche a quattro cifre (1.120), come nel testo della pagina
        el.textContent = String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        if (p < 1) requestAnimationFrame(passo);
      };
      requestAnimationFrame(passo);
    };
    var io = new IntersectionObserver(function (vv) {
      vv.forEach(function (v) {
        if (!v.isIntersecting) return;
        io.unobserve(v.target);
        conta(v.target);
      });
    }, { threshold: 0.6 });
    numeri.forEach(function (el) { io.observe(el); });
  }

  // inclinazione del telefono, solo con un mouse vero
  var tel = document.querySelector('#funzioni .fx-telefono');
  var schermo = tel && tel.querySelector('.fx-schermo');
  if (schermo && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var attesa = 0;
    tel.addEventListener('pointermove', function (e) {
      if (attesa) return;
      attesa = requestAnimationFrame(function () {
        attesa = 0;
        var r = tel.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        schermo.style.transform = 'perspective(1200px) rotateY(' + (x * 10).toFixed(2) + 'deg) rotateX(' + (-y * 8).toFixed(2) + 'deg)';
      });
    });
    tel.addEventListener('pointerleave', function () { schermo.style.transform = ''; });
  }
})();
