# Plan implementacije konsolidacije korisnika u tabelu kupci

## 1. Promene u bazi podataka

### 1.1. Dodavanje kolone status u tabelu kupci

- Kreiranje enum tipa `user_status` sa vrednostima: 'registrovan', 'neregistrovan', 'administrator'
- Dodavanje kolone `status` u tabelu `kupci` sa podrazumevanom vrednošću 'neregistrovan'

### 1.2. Migracija korisnika

- Migracija korisnika iz `auth.users` i `user_profiles` u tabelu `kupci`
- Postavljanje odgovarajućeg statusa za svakog korisnika:
  - 'administrator' za korisnike sa ulogom 'admin' u `user_profiles`
  - 'registrovan' za ostale korisnike iz `auth.users`

### 1.3. Kreiranje funkcija za rad sa korisnicima

- `dodaj_kupca` - funkcija za dodavanje novog kupca (neregistrovanog)
- `registruj_korisnika` - funkcija za registraciju korisnika
- `azuriraj_status_korisnika` - funkcija za ažuriranje statusa korisnika
- `dohvati_kupca_po_email` - funkcija za dobijanje kupca po email-u
- `is_admin` - funkcija za proveru da li je korisnik administrator
- `is_registered` - funkcija za proveru da li je korisnik registrovan

### 1.4. Postavljanje RLS politika

- Brisanje postojećih politika za tabelu `kupci`
- Kreiranje novih politika:
  - Korisnici mogu videti, ažurirati i dodati svoje podatke
  - Administratori mogu videti, ažurirati, dodati i brisati sve kupce

## 2. Promene u aplikaciji

### 2.1. Ažuriranje auth-context.tsx

- Ažuriranje tipova za korisnički profil da koristi novu strukturu
- Izmena funkcije `fetchUserProfile` da koristi tabelu `kupci` umesto `user_profiles`
- Ažuriranje provere administratorskih prava da koristi polje `status` umesto `role`
- Ažuriranje funkcije `signUp` da koristi novu funkciju `registruj_korisnika`
- Ažuriranje funkcije `useProtectedRoute` da koristi `status` umesto `role`

### 2.2. Ažuriranje checkout procesa

- Izmena procesa dodavanja kupca da koristi novu funkciju `dodaj_kupca`
- Implementacija logike za povezivanje porudžbina sa postojećim kupcima na osnovu email-a
- Ažuriranje forme za unos podataka o kupcu

### 2.3. Ažuriranje komponenti koje koriste korisničke podatke

- Ažuriranje `UserProfile.tsx` da koristi tabelu `kupci` umesto `user_profiles`
- Ažuriranje `UserManagement.tsx` za administratore da koristi novu strukturu
- Ažuriranje drugih komponenti koje koriste korisničke podatke

## 3. Koraci za implementaciju

### 3.1. Priprema

- Napraviti backup baze podataka
- Testirati SQL skriptu u razvojnom okruženju

### 3.2. Implementacija promena u bazi podataka

- Izvršiti SQL skriptu `unify_users_and_kupci.sql` u Supabase SQL Editor-u
- Proveriti da li su svi korisnici uspešno migrirani
- Proveriti da li su sve funkcije i politike pravilno kreirane

### 3.3. Implementacija promena u aplikaciji

- Ažurirati `auth-context.tsx` prema primeru u `update_auth_context.tsx`
- Ažurirati checkout proces prema primeru u `update_checkout_process.tsx`
- Ažurirati ostale komponente koje koriste korisničke podatke

### 3.4. Testiranje

- Testirati prijavu i registraciju korisnika
- Testirati checkout proces za prijavljene i neprijavljene korisnike
- Testirati administratorske funkcionalnosti
- Testirati povezivanje porudžbina sa postojećim kupcima

### 3.5. Čišćenje

- Nakon uspešne implementacije i testiranja, ukloniti tabelu `user_profiles`
- Ažurirati tipove i interfejse u aplikaciji da odražavaju novu strukturu

## 4. Napomene

- Sve promene treba implementirati postepeno, uz redovno testiranje
- Posebnu pažnju obratiti na migraciju postojećih korisnika i njihovih podataka
- Obezbediti da sve funkcionalnosti aplikacije nastave da rade nakon promena
- Ažurirati dokumentaciju da odražava novu strukturu baze podataka
