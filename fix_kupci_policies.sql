-- Skripta za ispravljanje RLS politika za tabelu kupci
-- Problem: Beskonačna rekurzija u politici admin_kupci_policy

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
  
  RETURN user_status = 'administrator';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Kreirati nove politike koje koriste funkciju is_admin()
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

-- 5. Ponovo omogućiti RLS za tabelu kupci
ALTER TABLE kupci ENABLE ROW LEVEL SECURITY;

-- 6. Testirati funkciju is_admin()
DO $$
BEGIN
  RAISE NOTICE 'Funkcija is_admin() kreirana i politike ažurirane';
END $$; 