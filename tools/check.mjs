#!/usr/bin/env node
// Controlli da lanciare prima di ogni commit:  node tools/check.mjs
//
// Esiste per un motivo preciso. La landing del progetto ha centinaia di
// attributi style inline e una ventina di selettori [style*="..."] che
// agganciano gli elementi cercando una sottostringa dentro quegli attributi.
// Da questi dipendono il tema scuro e il layout mobile: basta aggiungere uno
// spazio dopo una virgola in un inline style e la regola smette di agganciare,
// senza alcun errore. E' gia' successo (due override dark cercavano #8A85A3
// mentre il markup usava #8A84A6) e non se n'era accorto nessuno per mesi.
//
// Gli altri controlli coprono i modi in cui un sito statico si rompe in
// silenzio: link a file che non ci sono piu', sitemap disallineata.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const RADICE = join(dirname(fileURLToPath(import.meta.url)), '..');
const problemi = [];
const nota = (m) => problemi.push(m);

function paginaHtml(dir = RADICE, trovate = []) {
  for (const voce of readdirSync(dir)) {
    if (voce === '.git' || voce === 'node_modules' || voce === 'src' || voce === 'tools') continue;
    const p = join(dir, voce);
    if (statSync(p).isDirectory()) paginaHtml(p, trovate);
    else if (voce.endsWith('.html')) trovate.push(relative(RADICE, p));
  }
  return trovate;
}

const pagine = paginaHtml().sort();

// ------------------------------------------- 1. il pattern vietato
// Agganciare gli elementi con [style*="..."] sembra funzionare ma si rompe a
// runtime: appena uno script scrive sullo style di un elemento (motion.js lo
// fa su .reveal e sui figli di [data-stagger]) il browser riserializza tutto
// l'attributo, #FAFAFE diventa rgb(250, 250, 254) e la regola smette di
// agganciare senza dire niente. Usare una classe.
for (const p of pagine) {
  const html = readFileSync(join(RADICE, p), 'utf8');
  const stili = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
  const senzaCommenti = stili.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of senzaCommenti.matchAll(/\[style\*="([^"]+)"\]/g)) {
    nota(`${p}: selettore [style*="${m[1]}"] — non aggancia in modo affidabile, serve una classe`);
  }
}

// ------------------------------------------------------------------- 2. link
for (const p of pagine) {
  const html = readFileSync(join(RADICE, p), 'utf8');
  const base = dirname(join(RADICE, p));
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const u = m[1];
    if (/^(https?:|mailto:|tel:|data:|#|\/\/)/.test(u)) continue;
    const percorso = u.split(/[?#]/)[0];
    if (!percorso) continue;
    const f = percorso.startsWith('/') ? join(RADICE, percorso) : resolve(base, percorso);
    if (!existsSync(f)) { nota(`${p}: link a un file inesistente -> ${u}`); continue; }
    // ancora verso un'altra pagina: l'id deve esistere in quella pagina
    const frammento = u.includes('#') ? u.slice(u.indexOf('#') + 1) : '';
    if (frammento && f.endsWith('.html')) {
      const altra = readFileSync(f, 'utf8');
      const idsAltra = new Set([...altra.matchAll(/\sid="([^"]+)"/g)].map((x) => x[1]));
      if (!idsAltra.has(frammento)) nota(`${p}: ${u} punta a un id che non esiste in ${percorso}`);
    }
  }
  // ancore interne: ogni #id deve esistere nella stessa pagina
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of html.matchAll(/href="#([^"]+)"/g)) {
    if (!ids.has(m[1])) nota(`${p}: ancora #${m[1]} senza un id corrispondente`);
  }
}

// ---------------------------------------------------------------- 3. sitemap
const sitemap = readFileSync(join(RADICE, 'sitemap.xml'), 'utf8');
const inSitemap = [...sitemap.matchAll(/<loc>https:\/\/azanasi\.it\/([^<]*)<\/loc>/g)]
  .map((m) => m[1] || 'index.html');

for (const u of inSitemap) {
  if (!existsSync(join(RADICE, u))) nota(`sitemap.xml: elenca ${u}, che non esiste`);
}
for (const p of pagine) {
  const html = readFileSync(join(RADICE, p), 'utf8');
  if (/noindex/.test(html)) continue;                       // la 404 e' esclusa apposta
  const atteso = p === 'index.html' ? 'index.html' : p;
  if (!inSitemap.includes(atteso)) nota(`sitemap.xml: manca ${p}`);
}

// ------------------------------------------------------------------ esito
if (problemi.length) {
  console.error(`\n${problemi.length} problema/i:\n`);
  problemi.forEach((m) => console.error('  - ' + m));
  console.error('');
  process.exit(1);
}
console.log(`check: ${pagine.length} pagine, nessun problema`);
