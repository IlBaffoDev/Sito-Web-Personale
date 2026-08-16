-- Lista d'attesa email del sito (progetti/gestore-costi-veicoli.html).
-- Riusa il progetto Supabase già attivo per l'app (tttxrexiqadkojftwtne),
-- ma è una tabella isolata, indipendente dal modello dati dell'app.
-- Da eseguire manualmente nell'SQL editor di Supabase (azione su produzione).
-- Idempotente: si può rieseguire senza effetti collaterali.

create table if not exists lista_attesa_sito (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  creato_il timestamptz not null default now()
);

alter table lista_attesa_sito enable row level security;

drop policy if exists "chiunque può iscriversi" on lista_attesa_sito;
create policy "chiunque può iscriversi" on lista_attesa_sito
  for insert to anon with check (true);

-- Nessuna policy di select per anon: solo Andrea (dashboard Supabase o
-- service role) può leggere la lista — il form pubblico può solo scrivere.
