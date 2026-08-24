-- Form di contatto del sito (progetti/gestore-costi-veicoli.html).
-- Riusa il progetto Supabase già attivo per l'app (tttxrexiqadkojftwtne),
-- ma è una tabella isolata, indipendente dal modello dati dell'app.
-- Sostituisce lista-attesa.sql: la waitlist non ha più senso con l'app
-- vicina al lancio, al suo posto un form di contatto (bug/domande/altro).
-- Da eseguire manualmente nell'SQL editor di Supabase (azione su produzione).
-- Idempotente: si può rieseguire senza effetti collaterali.

create table if not exists contatti_sito (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  categoria text not null check (categoria in ('bug', 'informazioni', 'altro')),
  messaggio text not null,
  creato_il timestamptz not null default now()
);

alter table contatti_sito enable row level security;

drop policy if exists "chiunque può scrivere" on contatti_sito;
create policy "chiunque può scrivere" on contatti_sito
  for insert to anon with check (true);

-- Nessuna policy di select per anon: solo Andrea (dashboard Supabase o
-- service role) può leggere i messaggi — il form pubblico può solo scrivere.
