# Uputstvo za rešavanje problema sa user_profiles tabelom

Ovaj dokument sadrži uputstva za rešavanje problema sa tabelom `user_profiles` u Supabase bazi podataka.

## Problem

Prilikom učitavanja aplikacije javlja se sledeća greška:

```
Greška pri kreiranju profila: {}
```

Ova greška se javlja u fajlu `src/lib/auth/auth-context.tsx` na liniji 62, u funkciji `fetchUserProfile`.

## Uzrok problema

Problem je u neslaganju između definicije tabele `user_profiles` u migraciji i u TypeScript tipu. U migraciji, tabela `user_profiles` ima kolonu `user_id` koja je referenca na `auth.users(id)`, ali u TypeScript tipu, definicija tabele `user_profiles` nema polje `user_id`, već samo `id`.

## Rešenje

### 1. Popravka TypeScript tipa

Već smo ispravili definiciju tabele `user_profiles` u fajlu `src/lib/types/database.types.ts` da uključi polje `user_id`.

### 2. Popravka funkcije za dohvatanje profila

Takođe smo ispravili funkciju `fetchUserProfile` u fajlu `src/lib/auth/auth-context.tsx` da koristi `upsert` umesto `insert` kako bi se izbegli konflikti.

### 3. Popravka tabele u bazi podataka

Da biste popravili tabelu u bazi podataka, potrebno je da izvršite SQL skriptu `fix_user_profiles_direct.sql` direktno u Supabase SQL Editor konzoli.

#### Koraci za izvršavanje SQL skripte:

1. Prijavite se na [Supabase Dashboard](https://app.supabase.io)
2. Izaberite vaš projekat
3. Idite na "SQL Editor" u levom meniju
4. Kreirajte novi upit klikom na "New query"
5. Kopirajte sadržaj fajla `fix_user_profiles_direct.sql` u editor
6. Kliknite na "Run" da izvršite skriptu

Ova skripta će:

- Isključiti RLS za tabelu `user_profiles`
- Proveriti da li kolona `user_id` postoji i dodati je ako ne postoji
- Kreirati politiku koja dozvoljava svim korisnicima pristup
- Ponovo omogućiti RLS
- Popraviti funkciju za automatsko kreiranje profila
- Kreirati trigger za automatsko kreiranje profila
- Kreirati profile za postojeće korisnike

### 4. Alternativno rešenje

Ako ne možete da pristupite Supabase SQL Editor konzoli, možete pokrenuti skriptu `fix_profiles_simple.js` lokalno:

1. Dodajte `SUPABASE_SERVICE_ROLE_KEY` u `.env.local` fajl:

   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

   Service Role Key možete naći u Supabase Dashboard -> Settings -> API -> service_role key

2. Instalirajte potrebne zavisnosti:

   ```
   npm install dotenv
   ```

3. Pokrenite skriptu:
   ```
   node fix_profiles_simple.js
   ```

## Provera da li je problem rešen

Nakon što izvršite gornje korake, restartujte aplikaciju i proverite da li se greška i dalje javlja.

Ako se greška i dalje javlja, pokušajte da:

1. Obrišete `.next` folder i ponovo pokrenete aplikaciju
2. Proverite da li postoje drugi problemi u konzoli
3. Proverite da li je tabela `user_profiles` pravilno kreirana u bazi podataka
