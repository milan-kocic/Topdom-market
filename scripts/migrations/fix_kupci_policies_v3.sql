-- Skripta za ispravljanje RLS politika za tabelu kupci - verzija 3
-- Problem: Beskonačna rekurzija u politici admin_kupci_policy i prazna greška pri dohvatanju profila

-- 1. Prvo ćemo privremeno isključiti RLS za tabelu kupci
ALTER TABLE kupci DISABLE ROW LEVEL SECURITY;

-- 2. Ukloniti postojeće politike
DROP POLICY IF EXISTS admin_kupci_policy ON kupci;
DROP POLICY IF EXISTS user_kupci_policy ON kupci;
DROP POLICY IF EXISTS anon_kupci_policy ON kupci;

-- 3. Kreirati funkciju za proveru da li je korisnik administrator
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_status TEXT;
BEGIN
  -- Direktan pristup tabeli bez RLS provere
  SELECT status::TEXT INTO user_status
  FROM kupci
  WHERE id = auth.uid();
  
  -- Ako korisnik ne postoji u tabeli kupci, vratiti false
  IF user_status IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN user_status = 'administrator';
EXCEPTION
  WHEN OTHERS THEN
    -- U slučaju bilo kakve greške, vratiti false
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Kreirati funkciju za dohvatanje profila korisnika
CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
RETURNS SETOF kupci AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM kupci
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Kreirati funkciju za kreiranje profila korisnika ako ne postoji
CREATE OR REPLACE FUNCTION create_user_profile_if_not_exists(
  p_user_id UUID,
  p_email TEXT DEFAULT NULL
)
RETURNS SETOF kupci AS $$
DECLARE
  v_profile kupci;
BEGIN
  -- Prvo proverimo da li profil već postoji
  SELECT * INTO v_profile
  FROM kupci
  WHERE id = p_user_id;
  
  -- Ako profil ne postoji, kreiramo novi
  IF v_profile.id IS NULL THEN
    INSERT INTO kupci (
      id,
      ime_kupca,
      prezime_kupca,
      email,
      status
    ) VALUES (
      p_user_id,
      'Korisnik',
      'Korisnik',
      p_email,
      'registrovan'
    )
    RETURNING * INTO v_profile;
  END IF;
  
  RETURN NEXT v_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Kreirati nove politike koje koriste funkciju is_admin()
-- Politika za administratore - mogu da vide i menjaju sve kupce
CREATE POLICY admin_kupci_policy ON kupci
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Politika za registrovane korisnike - mogu da vide i menjaju samo svoje podatke
CREATE POLICY user_kupci_policy ON kupci
  FOR ALL
  TO authenticated
  USING (id = auth.uid());

-- Politika za anonimne korisnike - mogu samo da dodaju nove kupce
CREATE POLICY anon_kupci_policy ON kupci
  FOR INSERT
  TO anon;

-- 7. Ponovo omogućiti RLS za tabelu kupci
ALTER TABLE kupci ENABLE ROW LEVEL SECURITY;

-- 8. Testirati funkcije
DO $$
BEGIN
  RAISE NOTICE 'Funkcije is_admin(), get_user_profile() i create_user_profile_if_not_exists() kreirane i politike ažurirane';
END $$; 