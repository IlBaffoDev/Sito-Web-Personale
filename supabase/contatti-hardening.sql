-- Difese sul contenuto per contatti_sito.
--
-- PERCHE' SERVE
-- La tabella accetta insert anonimi (e' giusto: e' un form pubblico), ma nome,
-- email e messaggio sono text not null e basta. Due conseguenze:
--
-- 1. `not null` NON blocca la stringa vuota, e il `required` dell'HTML e'
--    soddisfatto anche da soli spazi, che contact.js poi trim-a a ''. Anche un
--    utente in buona fede puo' quindi inserire una riga completamente vuota.
--
-- 2. L'unica difesa contro lo spam e' l'honeypot in assets/contact.js, che e'
--    JavaScript lato client: chi attacca non carica mai quello script, fa un
--    POST diretto all'endpoint REST con la chiave pubblicabile presa dal
--    sorgente. Senza limiti di lunghezza il peso di ogni riga e' limitato solo
--    da PostgREST, e niente limita il numero di righe al minuto.
--
-- Il rischio concreto non e' "ricevere spam": questa tabella vive nello stesso
-- progetto Supabase dell'app in produzione, quindi un flood consuma la quota
-- condivisa e degrada la sincronizzazione dell'app.
--
-- Il modello giusto ce l'ha gia' `categoria`, che ha un check dalla nascita:
-- qui lo si estende agli altri tre campi.
--
-- APPLICATO IN PRODUZIONE il 01/09/2026 (SQL editor di Supabase, progetto
-- tttxrexiqadkojftwtne, branch main). Verificato subito dopo: 6 vincoli check,
-- 1 trigger, l'indice, e le prove funzionali dentro una transazione annullata --
-- nome vuoto, email malformata, messaggio che inizia con '=', messaggio da 4001
-- caratteri e secondo invio ravvicinato: tutti rifiutati; primo invio accettato.
-- La tabella era ed e' rimasta a 1 riga, nessun residuo di prova.
-- Idempotente: si puo' rieseguire.
--
-- NOTA: se in tabella ci sono gia' righe che violano i vincoli, gli ALTER
-- falliscono. Controlla prima con la query in fondo al file.

-- ---------------------------------------------------------------- lunghezze
alter table contatti_sito drop constraint if exists contatti_nome_lunghezza;
alter table contatti_sito add constraint contatti_nome_lunghezza
  check (char_length(btrim(nome)) between 1 and 100);

alter table contatti_sito drop constraint if exists contatti_email_lunghezza;
alter table contatti_sito add constraint contatti_email_lunghezza
  check (char_length(btrim(email)) between 3 and 254);   -- 254 = massimo RFC 5321

alter table contatti_sito drop constraint if exists contatti_messaggio_lunghezza;
alter table contatti_sito add constraint contatti_messaggio_lunghezza
  check (char_length(btrim(messaggio)) between 1 and 4000);

-- ------------------------------------------------------------ formato email
-- Volutamente permissiva: serve a escludere il testo arbitrario in un campo su
-- cui poi si clicca per rispondere, non a validare l'esistenza dell'indirizzo.
alter table contatti_sito drop constraint if exists contatti_email_formato;
alter table contatti_sito add constraint contatti_email_formato
  check (email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$');

-- ------------------------------------------------- niente formule negli export
-- Un valore che inizia con = + - @ viene interpretato come formula se un domani
-- la tabella finisce in un CSV aperto con Excel o Numbers.
alter table contatti_sito drop constraint if exists contatti_niente_formule;
alter table contatti_sito add constraint contatti_niente_formule
  check (left(btrim(nome), 1) !~ '^[=+@-]' and left(btrim(messaggio), 1) !~ '^[=+@-]');

-- ------------------------------------------------------------- throttling
-- Difesa grezza ma efficace contro il flood: al massimo un messaggio ogni due
-- minuti dallo stesso indirizzo email. Non ferma chi cambia email a ogni POST
-- (per quello servirebbe una Edge Function con limite per IP), ma alza di
-- parecchio il costo dell'attacco piu' banale.
create or replace function contatti_sito_throttle()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1 from contatti_sito
    where email = new.email
      and creato_il > now() - interval '2 minutes'
  ) then
    raise exception 'troppi messaggi ravvicinati da questo indirizzo'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists contatti_sito_throttle_trigger on contatti_sito;
create trigger contatti_sito_throttle_trigger
  before insert on contatti_sito
  for each row execute function contatti_sito_throttle();

-- l'indice serve al trigger: senza, ogni insert fa una scansione della tabella
create index if not exists contatti_sito_email_creato_idx
  on contatti_sito (email, creato_il desc);

-- ------------------------------------------------------------- verifica
-- Da lanciare PRIMA degli ALTER se la tabella ha gia' dei dati: elenca le righe
-- che violerebbero i nuovi vincoli.
--
--   select id, creato_il, nome, email
--   from contatti_sito
--   where char_length(btrim(nome)) not between 1 and 100
--      or char_length(btrim(email)) not between 3 and 254
--      or char_length(btrim(messaggio)) not between 1 and 4000
--      or email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$';
