-- Skripta za objedinjavanje korisnika u tabelu kupci
-- i prilagođavanje sistema dodavanja novih korisnika

-- 1. Dodavanje kolone status u tabelu kupci
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'kupci' 
    AND column_name = 'status'
  ) THEN
    -- Kreiranje enum tipa za status korisnika
    CREATE TYPE user_status AS ENUM ('registrovan', 'neregistrovan', 'administrator');
    
    -- Dodavanje kolone status u tabelu kupci
    ALTER TABLE kupci
    ADD COLUMN status user_status NOT NULL DEFAULT 'neregistrovan';
    
    RAISE NOTICE 'Dodata kolona status u tabelu kupci';
  ELSE
    RAISE NOTICE 'Kolona status već postoji u tabeli kupci';
  END IF;
END $$;

-- 2. Migracija korisnika iz auth.users i user_profiles u tabelu kupci
DO $$
DECLARE
  user_record RECORD;
  kupac_id UUID;
BEGIN
  -- Proveravamo da li tabela user_profiles postoji
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_name = 'user_profiles'
  ) THEN
    -- Migracija korisnika iz auth.users i user_profiles u tabelu kupci
    FOR user_record IN 
      SELECT 
        au.id, 
        au.email, 
        up.role
      FROM auth.users au
      LEFT JOIN user_profiles up ON au.id = up.user_id
    LOOP
      -- Proveravamo da li korisnik već postoji u tabeli kupci
      SELECT id INTO kupac_id
      FROM kupci
      WHERE email = user_record.email;
      
      IF kupac_id IS NULL THEN
        -- Dodajemo korisnika u tabelu kupci
        INSERT INTO kupci (
          id,
          ime_kupca,
          prezime_kupca,
          email,
          adresa,
          mesto,
          id_post,
          status
        ) VALUES (
          user_record.id,
          'Korisnik', -- Privremeno ime
          'Prezime',  -- Privremeno prezime
          user_record.email,
          '', -- Prazna adresa
          '', -- Prazno mesto
          '', -- Prazan poštanski broj
          CASE 
            WHEN user_record.role = 'admin' THEN 'administrator'::user_status
            ELSE 'registrovan'::user_status
          END
        );
        
        RAISE NOTICE 'Korisnik % migriran u tabelu kupci', user_record.email;
      ELSE
        -- Ažuriramo status postojećeg korisnika
        UPDATE kupci
        SET status = CASE 
          WHEN user_record.role = 'admin' THEN 'administrator'::user_status
          ELSE 'registrovan'::user_status
        END
        WHERE id = kupac_id;
        
        RAISE NOTICE 'Ažuriran status za korisnika %', user_record.email;
      END IF;
    END LOOP;
    
    -- Brisanje tabele user_profiles
    DROP TABLE IF EXISTS user_profiles;
    RAISE NOTICE 'Tabela user_profiles je obrisana';
  ELSE
    RAISE NOTICE 'Tabela user_profiles ne postoji, preskačem migraciju';
  END IF;
END $$;

-- 3. Kreiranje funkcije za proveru i dodavanje kupca
CREATE OR REPLACE FUNCTION add_or_get_kupac(
  p_ime_kupca TEXT,
  p_prezime_kupca TEXT,
  p_email TEXT,
  p_adresa TEXT,
  p_mesto TEXT,
  p_id_post TEXT
) RETURNS UUID AS $$
DECLARE
  v_kupac_id UUID;
BEGIN
  -- Ako je email prazan, dodajemo novog neregistrovanog kupca
  IF p_email IS NULL OR p_email = '' THEN
    INSERT INTO kupci (
      ime_kupca,
      prezime_kupca,
      email,
      adresa,
      mesto,
      id_post,
      status
    ) VALUES (
      p_ime_kupca,
      p_prezime_kupca,
      NULL,
      p_adresa,
      p_mesto,
      p_id_post,
      'neregistrovan'
    )
    RETURNING id INTO v_kupac_id;
  ELSE
    -- Proveravamo da li kupac sa tim email-om već postoji
    SELECT id INTO v_kupac_id
    FROM kupci
    WHERE email = p_email;
    
    -- Ako ne postoji, dodajemo ga
    IF v_kupac_id IS NULL THEN
      INSERT INTO kupci (
        ime_kupca,
        prezime_kupca,
        email,
        adresa,
        mesto,
        id_post,
        status
      ) VALUES (
        p_ime_kupca,
        p_prezime_kupca,
        p_email,
        p_adresa,
        p_mesto,
        p_id_post,
        'neregistrovan'
      )
      RETURNING id INTO v_kupac_id;
    END IF;
  END IF;
  
  RETURN v_kupac_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Kreiranje funkcije za registraciju korisnika
CREATE OR REPLACE FUNCTION register_user(
  p_user_id UUID,
  p_ime_kupca TEXT,
  p_prezime_kupca TEXT,
  p_email TEXT,
  p_adresa TEXT,
  p_mesto TEXT,
  p_id_post TEXT
) RETURNS VOID AS $$
DECLARE
  v_kupac_id UUID;
BEGIN
  -- Proveravamo da li korisnik sa tim email-om već postoji
  SELECT id INTO v_kupac_id
  FROM kupci
  WHERE email = p_email;
  
  -- Ako postoji, ažuriramo njegove podatke i status
  IF v_kupac_id IS NOT NULL THEN
    UPDATE kupci
    SET 
      ime_kupca = p_ime_kupca,
      prezime_kupca = p_prezime_kupca,
      adresa = p_adresa,
      mesto = p_mesto,
      id_post = p_id_post,
      status = 'registrovan'
    WHERE id = v_kupac_id;
  ELSE
    -- Ako ne postoji, dodajemo novog registrovanog korisnika
    INSERT INTO kupci (
      id,
      ime_kupca,
      prezime_kupca,
      email,
      adresa,
      mesto,
      id_post,
      status
    ) VALUES (
      p_user_id,
      p_ime_kupca,
      p_prezime_kupca,
      p_email,
      p_adresa,
      p_mesto,
      p_id_post,
      'registrovan'
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 5. Kreiranje funkcije za ažuriranje statusa korisnika
CREATE OR REPLACE FUNCTION update_user_status(
  p_email TEXT,
  p_status user_status
) RETURNS VOID AS $$
BEGIN
  UPDATE kupci
  SET status = p_status
  WHERE email = p_email;
END;
$$ LANGUAGE plpgsql;

-- 6. Kreiranje RLS politika za tabelu kupci
ALTER TABLE kupci ENABLE ROW LEVEL SECURITY;

-- Politika za administratore - mogu da vide i menjaju sve kupce
CREATE POLICY admin_kupci_policy ON kupci
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM kupci k
      WHERE k.id = auth.uid() AND k.status = 'administrator'
    )
  );

-- Politika za registrovane korisnike - mogu da vide i menjaju samo svoje podatke
CREATE POLICY user_kupci_policy ON kupci
  FOR ALL
  TO authenticated
  USING (id = auth.uid());

-- Politika za anonimne korisnike - mogu samo da dodaju nove kupce
CREATE POLICY anon_kupci_policy ON kupci
  FOR INSERT
  TO anon;

-- 7. Provera rezultata
DO $$
DECLARE
  kupci_count INTEGER;
  admin_count INTEGER;
  reg_count INTEGER;
  unreg_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO kupci_count FROM kupci;
  SELECT COUNT(*) INTO admin_count FROM kupci WHERE status = 'administrator';
  SELECT COUNT(*) INTO reg_count FROM kupci WHERE status = 'registrovan';
  SELECT COUNT(*) INTO unreg_count FROM kupci WHERE status = 'neregistrovan';
  
  RAISE NOTICE 'Ukupan broj kupaca: %', kupci_count;
  RAISE NOTICE 'Broj administratora: %', admin_count;
  RAISE NOTICE 'Broj registrovanih korisnika: %', reg_count;
  RAISE NOTICE 'Broj neregistrovanih korisnika: %', unreg_count;
END $$; 