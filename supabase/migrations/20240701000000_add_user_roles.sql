-- Kreiranje enum tipa za korisničke uloge
CREATE TYPE user_role AS ENUM ('admin', 'customer');

-- Kreiranje tabele za profile korisnika
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- Kreiranje tabele za kupce
CREATE TABLE IF NOT EXISTS kupci (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ime TEXT,
  prezime TEXT,
  telefon TEXT,
  adresa TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- Kreiranje funkcije za automatsko dodavanje profila novim korisnicima
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, role)
  VALUES (NEW.id, 'customer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kreiranje triggera koji poziva funkciju za nove korisnike
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Postavljanje RLS politika za tabelu user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Politika koja dozvoljava korisnicima da vide samo svoj profil
CREATE POLICY "Korisnici mogu videti samo svoj profil"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Politika koja dozvoljava administratorima da vide sve profile
CREATE POLICY "Administratori mogu videti sve profile"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Politika koja dozvoljava administratorima da ažuriraju sve profile
CREATE POLICY "Administratori mogu ažurirati sve profile"
  ON user_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Postavljanje RLS politika za tabelu kupci
ALTER TABLE kupci ENABLE ROW LEVEL SECURITY;

-- Politika koja dozvoljava korisnicima da vide i ažuriraju samo svoje podatke
CREATE POLICY "Korisnici mogu videti i ažurirati samo svoje podatke"
  ON kupci FOR ALL
  USING (auth.uid() = user_id);

-- Politika koja dozvoljava administratorima da vide sve kupce
CREATE POLICY "Administratori mogu videti sve kupce"
  ON kupci FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  ); 