/*
  # Kreiranje osnovnih tabela

  1. Nove tabele
    - `kupci` - Informacije o kupcima
    - `proizvodi` - Katalog proizvoda
    - `kategorije` - Kategorije proizvoda
    - `porudzbine` - Informacije o porudžbinama
    - `stavke_porudzbine` - Stavke pojedinačnih porudžbina
    - `popusti` - Informacije o popustima
    - `proizvodi_iznenadnjenja` - Specijalni proizvodi

  2. Sigurnost
    - Omogućen RLS za sve tabele
    - Dodate odgovarajuće polise za svaku tabelu
*/

-- Kreiranje tabele kupci
CREATE TABLE kupci (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ime_kupca text NOT NULL,
  prezime_kupca text NOT NULL,
  telefon text,
  email text UNIQUE NOT NULL,
  adresa text,
  mesto text,
  id_post text,
  kreirano timestamptz DEFAULT now()
);

ALTER TABLE kupci ENABLE ROW LEVEL SECURITY;

-- Kreiranje tabele kategorije
CREATE TABLE kategorije (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  naziv_kategorije text NOT NULL UNIQUE,
  opis_kategorije text,
  kreirano timestamptz DEFAULT now(),
  azurirano timestamptz DEFAULT now()
);

ALTER TABLE kategorije ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Svi mogu da vide kategorije"
  ON kategorije FOR SELECT
  TO authenticated, anon
  USING (true);

-- Kreiranje tabele proizvodi
CREATE TABLE proizvodi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  naziv_proizvoda text NOT NULL,
  opis text,
  cena numeric NOT NULL CHECK (cena >= 0),
  dostupnost boolean DEFAULT true,
  id_kategorija uuid REFERENCES kategorije(id),
  img_url text,
  kreirano timestamptz DEFAULT now(),
  azurirano timestamptz DEFAULT now()
);

ALTER TABLE proizvodi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Svi mogu da vide proizvode"
  ON proizvodi FOR SELECT
  TO authenticated, anon
  USING (true);

-- Kreiranje tabele porudzbine
CREATE TABLE porudzbine (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_kupca uuid REFERENCES kupci(id),
  kupac_ime text NOT NULL,
  kupac_prezime text NOT NULL,
  kupac_telefon text,
  kupac_adresa text NOT NULL,
  kupac_mesto text NOT NULL,
  cena_ukupno numeric NOT NULL CHECK (cena_ukupno >= 0),
  status_porudzbine text NOT NULL,
  kreirano timestamptz DEFAULT now(),
  azurirano timestamptz DEFAULT now()
);

ALTER TABLE porudzbine ENABLE ROW LEVEL SECURITY;

-- Kreiranje tabele stavke_porudzbine
CREATE TABLE stavke_porudzbine (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_porudzbine uuid REFERENCES porudzbine(id),
  id_proizvoda uuid REFERENCES proizvodi(id),
  kolicina integer NOT NULL CHECK (kolicina > 0),
  cena numeric NOT NULL CHECK (cena >= 0)
);

ALTER TABLE stavke_porudzbine ENABLE ROW LEVEL SECURITY;

-- Kreiranje tabele popusti
CREATE TABLE popusti (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_proizvoda uuid REFERENCES proizvodi(id),
  pocetni_datum timestamptz NOT NULL,
  zavrsni_datum timestamptz NOT NULL,
  tip_popusta text NOT NULL,
  vrednost numeric NOT NULL CHECK (vrednost > 0)
);

ALTER TABLE popusti ENABLE ROW LEVEL SECURITY;

-- Kreiranje tabele proizvodi_iznenadnjenja
CREATE TABLE proizvodi_iznenadnjenja (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_proizvoda uuid REFERENCES proizvodi(id),
  opis text NOT NULL
);

ALTER TABLE proizvodi_iznenadnjenja ENABLE ROW LEVEL SECURITY;

-- Kreiranje funkcije za ažuriranje vremena
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.azurirano = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Kreiranje trigera za ažuriranje vremena
CREATE TRIGGER update_proizvodi_azurirano
  BEFORE UPDATE ON proizvodi
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_kategorije_azurirano
  BEFORE UPDATE ON kategorije
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();