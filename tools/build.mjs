#!/usr/bin/env node
// Rigenera i blocchi condivisi (CSP, font, nav, footer, beacon) dentro le
// pagine HTML, partendo dai partial in src/partials/.
//
//   node tools/build.mjs            riscrive le pagine
//   node tools/build.mjs --verifica esce con codice 1 se una pagina e'
//                                   disallineata, senza toccare nulla
//
// Le pagine restano file HTML completi e committati: il deploy su GitHub
// Pages non cambia e l'anteprima locale funziona aprendo direttamente i file.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pagine } from './pagine.mjs';

const RADICE = join(dirname(fileURLToPath(import.meta.url)), '..');
const verifica = process.argv.includes('--verifica');

const partial = (nome) => readFileSync(join(RADICE, 'src/partials', nome + '.html'), 'utf8');

// sostituzione di {{chiave}}; una chiave rimasta senza valore e' un errore,
// non un buco silenzioso
function riempi(testo, valori, dove) {
  return testo.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    if (!(k in valori)) throw new Error(`${dove}: manca il valore per {{${k}}}`);
    return valori[k];
  });
}

// indenta il blocco come il marcatore che lo contiene
function indenta(testo, spazi) {
  if (!spazi) return testo;
  return testo.split('\n').map((r) => (r.trim() ? spazi + r : r)).join('\n');
}

function applica(html, nome, contenuto, file) {
  const re = new RegExp(
    `([ \\t]*)<!-- build:${nome} -->\\n[\\s\\S]*?[ \\t]*<!-- /build:${nome} -->`,
    'g'
  );
  if (!re.test(html)) return { html, trovato: false };
  re.lastIndex = 0;
  return {
    trovato: true,
    html: html.replace(re, (_, spazi) =>
      `${spazi}<!-- build:${nome} -->\n` +
      indenta(contenuto.replace(/\n$/, ''), spazi) + '\n' +
      `${spazi}<!-- /build:${nome} -->`
    ),
  };
}

let disallineate = [];
let scritte = 0;

for (const [file, cfg] of Object.entries(pagine)) {
  const percorso = join(RADICE, file);
  const originale = readFileSync(percorso, 'utf8');
  let html = originale;

  const blocchi = [
    ['csp', () => partial('csp')],
    ['font', () => riempi(partial('font'), { famiglie: cfg.font }, file)],
    ['beacon', () => partial('beacon')],
  ];
  if (cfg.nav) blocchi.push(['nav', () => riempi(partial('nav'), cfg.nav, file)]);
  if (cfg.footer) blocchi.push(['footer', () => partial('footer')]);

  for (const [nome, produci] of blocchi) {
    const r = applica(html, nome, produci(), file);
    if (!r.trovato) {
      console.error(`  ! ${file}: marcatori build:${nome} assenti`);
      process.exitCode = 1;
      continue;
    }
    html = r.html;
  }

  if (html !== originale) {
    disallineate.push(file);
    if (!verifica) { writeFileSync(percorso, html); scritte++; }
  }
}

if (verifica) {
  if (disallineate.length) {
    console.error('Pagine disallineate dai partial (lancia: node tools/build.mjs):');
    disallineate.forEach((f) => console.error('  - ' + f));
    process.exit(1);
  }
  console.log(`build: ${Object.keys(pagine).length} pagine allineate ai partial`);
} else {
  console.log(scritte ? `build: aggiornate ${scritte} pagine` : 'build: nessuna modifica, era gia' + "' tutto allineato");
}
