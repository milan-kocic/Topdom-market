-- Kreiranje enum tipa za status narudžbine
CREATE TYPE order_status AS ENUM ('nova', 'u_obradi', 'poslata', 'isporučena', 'otkazana');

-- Kreiranje tabele za narudžbine
CREATE TABLE IF NOT EXISTS narudzbine (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status order_status NOT NULL DEFAULT 'nova',
  ukupna_cena DECIMAL(10, 2) NOT NULL,
  dostava_cena DECIMAL(10, 2) NOT NULL DEFAULT 0,
  ime TEXT NOT NULL,
  prezime TEXT NOT NULL,
  email TEXT NOT NULL,
  telefon TEXT NOT NULL,
  adresa TEXT NOT NULL,
  grad TEXT NOT NULL,
  postanski_broj TEXT NOT NULL,
  napomena TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Kreiranje tabele za stavke narudžbine
CREATE TABLE IF NOT EXISTS stavke_narudzbine (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  narudzbina_id UUID REFERENCES narudzbine(id) ON DELETE CASCADE NOT NULL,
  proizvod_id UUID REFERENCES proizvodi(id) ON DELETE SET NULL,
  naziv_proizvoda TEXT NOT NULL,
  cena DECIMAL(10, 2) NOT NULL,
  kolicina INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Funkcija za ažuriranje vremena izmene narudžbine
CREATE OR REPLACE FUNCTION update_narudzbina_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger za ažuriranje vremena izmene narudžbine
CREATE TRIGGER update_narudzbina_updated_at
BEFORE UPDATE ON narudzbine
FOR EACH ROW EXECUTE FUNCTION update_narudzbina_updated_at();

-- Postavljanje RLS politika za tabelu narudzbine
ALTER TABLE narudzbine ENABLE ROW LEVEL SECURITY;

-- Politika koja dozvoljava korisnicima da vide samo svoje narudžbine
CREATE POLICY "Korisnici mogu videti samo svoje narudžbine"
  ON narudzbine FOR SELECT
  USING (auth.uid() = user_id);

-- Politika koja dozvoljava administratorima da vide sve narudžbine
CREATE POLICY "Administratori mogu videti sve narudžbine"
  ON narudzbine FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Politika koja dozvoljava administratorima da ažuriraju sve narudžbine
CREATE POLICY "Administratori mogu ažurirati sve narudžbine"
  ON narudzbine FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Politika koja dozvoljava korisnicima da kreiraju narudžbine
CREATE POLICY "Korisnici mogu kreirati narudžbine"
  ON narudzbine FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Postavljanje RLS politika za tabelu stavke_narudzbine
ALTER TABLE stavke_narudzbine ENABLE ROW LEVEL SECURITY;

-- Politika koja dozvoljava korisnicima da vide stavke svojih narudžbina
CREATE POLICY "Korisnici mogu videti stavke svojih narudžbina"
  ON stavke_narudzbine FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM narudzbine
      WHERE narudzbine.id = stavke_narudzbine.narudzbina_id
      AND narudzbine.user_id = auth.uid()
    )
  );

-- Politika koja dozvoljava administratorima da vide sve stavke narudžbina
CREATE POLICY "Administratori mogu videti sve stavke narudžbina"
  ON stavke_narudzbine FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Politika koja dozvoljava korisnicima da kreiraju stavke narudžbina
CREATE POLICY "Korisnici mogu kreirati stavke narudžbina"
  ON stavke_narudzbine FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM narudzbine
      WHERE narudzbine.id = stavke_narudzbine.narudzbina_id
      AND narudzbine.user_id = auth.uid()
    )
  ); 