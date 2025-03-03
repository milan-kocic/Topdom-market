-- Skripta za dodavanje kolone status u tabelu kupci i kreiranje funkcija za upravljanje korisnicima

DO $$
BEGIN
    -- 1. Dodajemo enum tip za status korisnika ako ne postoji
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE user_status AS ENUM ('registrovan', 'neregistrovan', 'administrator');
        RAISE NOTICE 'Kreiran tip user_status';
    END IF;

    -- 2. Dodajemo kolonu status u tabelu kupci ako ne postoji
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'kupci' AND column_name = 'status') THEN
        ALTER TABLE kupci ADD COLUMN status user_status DEFAULT 'neregistrovan';
        RAISE NOTICE 'Dodata kolona status u tabelu kupci';
    END IF;

    -- 3. Kreiramo funkciju za dodavanje novog kupca
    CREATE OR REPLACE FUNCTION dodaj_kupca(
        p_ime_kupca TEXT,
        p_prezime_kupca TEXT,
        p_email TEXT,
        p_adresa TEXT DEFAULT NULL,
        p_mesto TEXT DEFAULT NULL,
        p_id_post TEXT DEFAULT NULL,
        p_status user_status DEFAULT 'neregistrovan'
    ) RETURNS UUID AS $$
    DECLARE
        v_id UUID;
    BEGIN
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
            p_status
        ) RETURNING id INTO v_id;
        
        RETURN v_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- 4. Kreiramo funkciju za registraciju korisnika
    CREATE OR REPLACE FUNCTION registruj_korisnika(
        p_user_id UUID,
        p_ime_kupca TEXT,
        p_prezime_kupca TEXT,
        p_email TEXT,
        p_adresa TEXT DEFAULT NULL,
        p_mesto TEXT DEFAULT NULL,
        p_id_post TEXT DEFAULT NULL
    ) RETURNS VOID AS $$
    BEGIN
        -- Proveravamo da li korisnik već postoji
        IF EXISTS (SELECT 1 FROM kupci WHERE id = p_user_id) THEN
            -- Ažuriramo postojećeg korisnika
            UPDATE kupci
            SET 
                ime_kupca = p_ime_kupca,
                prezime_kupca = p_prezime_kupca,
                email = p_email,
                adresa = COALESCE(p_adresa, adresa),
                mesto = COALESCE(p_mesto, mesto),
                id_post = COALESCE(p_id_post, id_post),
                status = 'registrovan'
            WHERE id = p_user_id;
        ELSE
            -- Dodajemo novog korisnika
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
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- 5. Kreiramo funkciju za proveru statusa korisnika
    CREATE OR REPLACE FUNCTION proveri_status_korisnika(p_user_id UUID)
    RETURNS user_status AS $$
    DECLARE
        v_status user_status;
    BEGIN
        SELECT status INTO v_status FROM kupci WHERE id = p_user_id;
        RETURN v_status;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- 6. Kreiramo funkciju za postavljanje korisnika kao administratora
    CREATE OR REPLACE FUNCTION postavi_administratora(p_user_id UUID, p_caller_id UUID)
    RETURNS VOID AS $$
    BEGIN
        -- Proveravamo da li je korisnik koji poziva funkciju administrator
        IF EXISTS (
            SELECT 1 FROM kupci WHERE id = p_caller_id AND status = 'administrator'
        ) THEN
            -- Ako jeste, postavljamo korisnika kao administratora
            UPDATE kupci SET status = 'administrator' WHERE id = p_user_id;
        ELSE
            -- Ako nije, bacamo grešku
            RAISE EXCEPTION 'Samo administratori mogu postaviti druge korisnike kao administratore';
        END IF;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- 7. Migriramo postojeće korisnike iz user_profiles u kupci
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        -- Ažuriramo status za administratore
        UPDATE kupci
        SET status = 'administrator'
        WHERE id IN (
            SELECT user_id FROM user_profiles WHERE role = 'admin'
        );
        
        -- Ažuriramo status za obične korisnike
        UPDATE kupci
        SET status = 'registrovan'
        WHERE id IN (
            SELECT user_id FROM user_profiles WHERE role = 'customer'
        );
        
        RAISE NOTICE 'Migrirani korisnici iz user_profiles u kupci';
    END IF;

    -- 8. Kreiramo RLS politike za tabelu kupci
    ALTER TABLE kupci ENABLE ROW LEVEL SECURITY;
    
    -- Politika za čitanje: Korisnici mogu videti samo svoje podatke, administratori mogu videti sve
    DROP POLICY IF EXISTS "Korisnici vide svoje podatke" ON kupci;
    CREATE POLICY "Korisnici vide svoje podatke" ON kupci
        FOR SELECT
        USING (
            auth.uid() = id OR 
            EXISTS (SELECT 1 FROM kupci WHERE id = auth.uid() AND status = 'administrator')
        );
    
    -- Politika za ažuriranje: Korisnici mogu ažurirati samo svoje podatke, administratori mogu ažurirati sve
    DROP POLICY IF EXISTS "Korisnici ažuriraju svoje podatke" ON kupci;
    CREATE POLICY "Korisnici ažuriraju svoje podatke" ON kupci
        FOR UPDATE
        USING (
            auth.uid() = id OR 
            EXISTS (SELECT 1 FROM kupci WHERE id = auth.uid() AND status = 'administrator')
        );
    
    -- Politika za brisanje: Samo administratori mogu brisati korisnike
    DROP POLICY IF EXISTS "Samo administratori mogu brisati korisnike" ON kupci;
    CREATE POLICY "Samo administratori mogu brisati korisnike" ON kupci
        FOR DELETE
        USING (
            EXISTS (SELECT 1 FROM kupci WHERE id = auth.uid() AND status = 'administrator')
        );
    
    -- Politika za dodavanje: Svako može dodati korisnika (za registraciju)
    DROP POLICY IF EXISTS "Svako može dodati korisnika" ON kupci;
    CREATE POLICY "Svako može dodati korisnika" ON kupci
        FOR INSERT
        WITH CHECK (true);
    
    RAISE NOTICE 'Uspešno kreirane RLS politike za tabelu kupci';
END $$; 