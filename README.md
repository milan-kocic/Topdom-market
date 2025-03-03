# TopDom Market

E-commerce aplikacija za prodaju proizvoda za dom.

## Funkcionalnosti

- Pregled proizvoda po kategorijama
- Detalji proizvoda
- Korpa za kupovinu
- Sistem korisničkih uloga (admin/korisnik)
- Administratorski panel za upravljanje korisnicima
- Profil korisnika

## Tehnologije

- Next.js
- TypeScript
- Tailwind CSS
- Supabase (Auth, Database)

## Postavljanje projekta

### Preduslovi

- Node.js (v14 ili noviji)
- npm ili yarn
- Supabase nalog

### Instalacija

1. Klonirajte repozitorijum:

   ```bash
   git clone https://github.com/your-username/topdom-market.git
   cd topdom-market
   ```

2. Instalirajte zavisnosti:

   ```bash
   npm install
   # ili
   yarn install
   ```

3. Kreirajte `.env.local` fajl sa sledećim varijablama:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ADMIN_EMAIL=admin@topdom.rs
   ADMIN_PASSWORD=your-admin-password
   ```

4. Pokrenite migracije za bazu podataka:

   ```bash
   npx supabase db push
   ```

5. Inicijalizujte administratorski nalog:

   ```bash
   node scripts/init-admin.js
   ```

6. Pokrenite razvojni server:
   ```bash
   npm run dev
   # ili
   yarn dev
   ```

## Sistem korisničkih uloga

Aplikacija koristi sistem korisničkih uloga sa dve osnovne uloge:

- **Administrator** - ima pristup administratorskom panelu i može da upravlja korisnicima
- **Korisnik** - može da pregleda proizvode, kupuje i uređuje svoj profil

### Postavljanje sistema uloga

1. Migracija `20240701000000_add_user_roles.sql` kreira:

   - Enum tip `user_role` sa vrednostima 'admin' i 'customer'
   - Tabelu `user_profiles` koja povezuje korisnike sa njihovim ulogama
   - Trigger koji automatski dodeljuje ulogu 'customer' novim korisnicima
   - RLS politike za kontrolu pristupa

2. Skripta `scripts/init-admin.js` kreira administratorski nalog i dodeljuje mu ulogu 'admin'

### Kontrola pristupa

- Komponenta `UserManagement.tsx` omogućava administratorima da upravljaju korisnicima i njihovim ulogama
- Stranica `/admin/korisnici` je dostupna samo administratorima
- Navigacija prikazuje različite opcije u zavisnosti od uloge korisnika

## Licenca

MIT
