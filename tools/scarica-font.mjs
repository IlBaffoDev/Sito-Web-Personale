#!/usr/bin/env node
// Scarica una volta i font da Google Fonts e li serve dal sito stesso (29/09/2026): cosi' il
// browser del visitatore non contatta piu' Google e il suo indirizzo IP non ci arriva.
//
//   node tools/scarica-font.mjs
//
// Scrive assets/fonts/<nome>.css e i .woff2 che cita, solo per i sottoinsiemi latin e
// latin-ext (italiano e inglese). Va rilanciato solo se cambiano famiglie o pesi qui sotto.

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RADICE = join(dirname(fileURLToPath(import.meta.url)), '..');
const CARTELLA = join(RADICE, 'assets/fonts');

const FOGLI = {
  sito: 'family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600;700',
  gcv: 'family=Plus+Jakarta+Sans:wght@500;600;700;800',
};

// senza un user agent moderno Google risponde con formati vecchi invece del woff2
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';
const SOTTOINSIEMI = new Set(['latin', 'latin-ext']);

mkdirSync(CARTELLA, { recursive: true });

for (const [nome, query] of Object.entries(FOGLI)) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?${query}&display=swap`, { headers: { 'User-Agent': UA } })).text();
  // il CSS di Google e' una sequenza di "/* sottoinsieme */ @font-face { ... }"
  const blocchi = [...css.matchAll(/\/\* ([\w-]+) \*\/\s*(@font-face \{[\s\S]*?\})/g)]
    .filter(([, sotto]) => SOTTOINSIEMI.has(sotto));
  let uscita = `/* Generato da tools/scarica-font.mjs — non modificare a mano */\n`;
  for (const [, sotto, regola] of blocchi) {
    const famiglia = regola.match(/font-family: '([^']+)'/)[1].toLowerCase().replace(/ /g, '-');
    const peso = regola.match(/font-weight: (\d+)/)[1];
    const url = regola.match(/url\((https:[^)]+)\)/)[1];
    const file = `${famiglia}-${peso}-${sotto}.woff2`;
    writeFileSync(join(CARTELLA, file), Buffer.from(await (await fetch(url)).arrayBuffer()));
    uscita += `/* ${sotto} */\n${regola.replace(url, file)}\n`;
  }
  writeFileSync(join(CARTELLA, `${nome}.css`), uscita);
  console.log(`${nome}.css: ${blocchi.length} regole`);
}
