-- Dodavanje kolone broj_telefona u tabelu kupci
ALTER TABLE kupci ADD COLUMN IF NOT EXISTS broj_telefona VARCHAR;

-- Ažuriranje funkcije create_user_profile da uključi nova polja
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id UUID,
  email TEXT DEFAULT NULL,
  ime TEXT DEFAULT 'Korisnik',
  prezime TEXT DEFAULT 'Korisnik',
  adresa TEXT DEFAULT NULL,
  mesto TEXT DEFAULT NULL,
  postanski_broj TEXT DEFAULT NULL,
  broj_telefona TEXT DEFAULT NULL
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
    adresa,
    mesto,
    id_post,
    broj_telefona,
    status
  ) VALUES (
    user_id,
    ime,
    prezime,
    email,
    adresa,
    mesto,
    postanski_broj,
    broj_telefona,
    'registrovan'
  )
  RETURNING * INTO new_profile;
  
  RETURN new_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Omogućiti pristup funkciji create_user_profile preko REST API-ja
GRANT EXECUTE ON FUNCTION create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated, anon, service_role; 