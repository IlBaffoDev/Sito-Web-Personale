// Quali blocchi condivisi entrano in ogni pagina, e con quali valori.
// I blocchi vengono iniettati fra i marcatori <!-- build:nome --> e
// <!-- /build:nome --> gia' presenti nell'HTML: le pagine restano file
// completi, apribili e leggibili, ma il contenuto di quei blocchi ha
// una sola fonte di verita' in src/partials/.

const FONT_SITO = 'family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600;700';
const FONT_GCV = 'family=Plus+Jakarta+Sans:wght@500;600;700;800';

// voci di menu nelle due lingue
const IT = { voce_home: 'home', voce_chisono: 'chi-sono', voce_progetti: 'progetti', voce_contatti: 'contatti' };
const EN = { voce_home: 'home', voce_chisono: 'about', voce_progetti: 'projects', voce_contatti: 'contact' };

// base: prefisso dei link interni della nav, diverso per la 404 (che viene
// servita da qualsiasi path e quindi ha bisogno di percorsi assoluti)
function navIT(base, attiva, altHref) {
  return {
    base, ...IT,
    attivo_home: attiva === 'home' ? ' active' : '',
    attivo_chisono: attiva === 'chisono' ? ' active' : '',
    attivo_progetti: attiva === 'progetti' ? ' active' : '',
    alt_href: altHref, alt_lang: 'en', alt_voce: 'EN',
  };
}

function navEN(attiva, altHref) {
  return {
    base: '', ...EN,
    attivo_home: attiva === 'home' ? ' active' : '',
    attivo_chisono: attiva === 'chisono' ? ' active' : '',
    attivo_progetti: attiva === 'progetti' ? ' active' : '',
    alt_href: altHref, alt_lang: 'it', alt_voce: 'IT',
  };
}

// I link a privacy e termini nel footer sono relativi: `radice` e' il prefisso che porta
// alla root del sito da quella pagina. Le pagine in root non ne hanno bisogno, quelle in
// `en/` risalgono di un livello, e la 404 usa un path assoluto perche' viene servita da
// QUALUNQUE percorso — un relativo li punterebbe ogni volta altrove.
const FOOTER_ROOT = { radice: '' };
const FOOTER_EN = { radice: '../' };
const FOOTER_404 = { radice: '/' };

export const pagine = {
  'index.html':        { font: FONT_SITO, nav: navIT('', 'home', 'en/index.html'), footer: FOOTER_ROOT },
  'chi-sono.html':     { font: FONT_SITO, nav: navIT('', 'chisono', 'en/chi-sono.html'), footer: FOOTER_ROOT },
  'progetti.html':     { font: FONT_SITO, nav: navIT('', 'progetti', 'en/progetti.html'), footer: FOOTER_ROOT },
  '404.html':          { font: FONT_SITO, nav: navIT('/', null, '/en/index.html'), footer: FOOTER_404 },
  'en/index.html':     { font: FONT_SITO, nav: navEN('home', '../index.html'), footer: FOOTER_EN },
  'en/chi-sono.html':  { font: FONT_SITO, nav: navEN('chisono', '../chi-sono.html'), footer: FOOTER_EN },
  'en/progetti.html':  { font: FONT_SITO, nav: navEN('progetti', '../progetti.html'), footer: FOOTER_EN },

  // le pagine del progetto hanno nav e footer propri: condividono solo
  // CSP, font e beacon
  'progetti/gestore-costi-veicoli.html':          { font: FONT_GCV },
  'progetti/gestore-costi-veicoli-privacy.html':  { font: FONT_GCV },
  'progetti/gestore-costi-veicoli-supporto.html': { font: FONT_GCV },
  'progetti/gestore-costi-veicoli-termini.html':  { font: FONT_GCV },
  'progetti/gestore-costi-veicoli-novita.html':   { font: FONT_GCV },
};
