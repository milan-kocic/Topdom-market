-- Skripta za ispravljanje RLS politika za tabelu kupci - verzija 4
-- Problem: Beskonačna rekurzija u politici admin_kupci_policy i funkcije nisu dostupne kroz REST API

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

-- Omogućiti pristup funkciji is_admin preko REST API-ja
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, anon, service_role;

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

-- Omogućiti pristup funkciji get_user_profile preko REST API-ja
GRANT EXECUTE ON FUNCTION get_user_profile(UUID) TO authenticated, anon, service_role;

-- 5. Umesto create_user_profile_if_not_exists, razdvojimo na dve funkcije
-- 5.1 Funkcija koja proverava da li profil postoji
CREATE OR REPLACE FUNCTION check_user_profile_exists(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  profile_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM kupci WHERE id = user_id
  ) INTO profile_exists;
  
  RETURN profile_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Omogućiti pristup funkciji check_user_profile_exists preko REST API-ja
GRANT EXECUTE ON FUNCTION check_user_profile_exists(UUID) TO authenticated, anon, service_role;

-- 5.2 Funkcija koja kreira novi profil
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id UUID,
  email TEXT DEFAULT NULL
)
RETURNS kupci AS $$
DECLARE
  new_profile kupci;
BEGIN
  INSERT INTO kupci (
    id,
    ime_kupca,
    prezime_kupca,
    email,
    status
  ) VALUES (
    user_id,
    'Korisnik',
    'Korisnik',
    email,
    'registrovan'
  )
  RETURNING * INTO new_profile;
  
  RETURN new_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Omogućiti pristup funkciji create_user_profile preko REST API-ja
GRANT EXECUTE ON FUNCTION create_user_profile(UUID, TEXT) TO authenticated, anon, service_role;

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
  RAISE NOTICE 'Funkcije is_admin(), get_user_profile(), check_user_profile_exists() i create_user_profile() kreirane i politike ažurirane';
END $$;

-- Dodajemo funkciju za ažuriranje korisničkog profila
CREATE OR REPLACE FUNCTION update_user_profile(
  user_id UUID,
  p_ime_kupca TEXT,
  p_prezime_kupca TEXT,
  p_email TEXT,
  p_adresa TEXT,
  p_mesto TEXT,
  p_id_post TEXT,
  p_broj_telefona TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  UPDATE kupci
  SET 
    ime_kupca = p_ime_kupca,
    prezime_kupca = p_prezime_kupca,
    email = p_email,
    adresa = p_adresa,
    mesto = p_mesto,
    id_post = p_id_post,
    broj_telefona = p_broj_telefona,
    updated_at = NOW()
  WHERE id = user_id
  RETURNING to_jsonb(kupci.*) INTO result;
  
  RETURN result;
END;
$$;

-- Dozvoljavamo pristup funkciji update_user_profile preko REST API-ja
GRANT EXECUTE ON FUNCTION update_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- Testiranje funkcije update_user_profile
-- SELECT update_user_profile('00000000-0000-0000-0000-000000000000', 'Test', 'Korisnik', 'test@example.com', 'Adresa 1', 'Beograd', '11000', '0601234567');

-- Omogućavamo RLS za tabelu kupci
ALTER TABLE kupci ENABLE ROW LEVEL SECURITY; 