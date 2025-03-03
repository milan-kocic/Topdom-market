-- Skripta za konsolidaciju korisnika u tabelu kupci
-- Dodavanje kolone status u tabelu kupci

-- Kreiranje enum tipa za status korisnika ako ne postoji
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE user_status AS ENUM ('registrovan', 'neregistrovan', 'administrator');
    END IF;
END$$;

-- Dodavanje kolone status u tabelu kupci ako ne postoji
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'kupci' 
                   AND column_name = 'status') THEN
        ALTER TABLE public.kupci ADD COLUMN status user_status DEFAULT 'neregistrovan';
        RAISE NOTICE 'Kolona status je dodata u tabelu kupci';
    ELSE
        RAISE NOTICE 'Kolona status već postoji u tabeli kupci';
    END IF;
END$$;

-- Migracija korisnika iz auth.users i user_profiles u kupci
DO $$
DECLARE
    user_record RECORD;
    kupac_exists BOOLEAN;
    user_role TEXT;
BEGIN
    -- Prolazimo kroz sve korisnike iz auth.users
    FOR user_record IN 
        SELECT au.id, au.email, up.role
        FROM auth.users au
        LEFT JOIN public.user_profiles up ON au.id = up.user_id
    LOOP
        -- Proveravamo da li korisnik već postoji u tabeli kupci
        SELECT EXISTS (
            SELECT 1 FROM public.kupci WHERE id = user_record.id
        ) INTO kupac_exists;
        
        -- Određujemo status korisnika
        IF user_record.role = 'admin' THEN
            user_role := 'administrator';
        ELSE
            user_role := 'registrovan';
        END IF;
        
        IF kupac_exists THEN
            -- Ažuriramo postojećeg korisnika
            UPDATE public.kupci
            SET status = user_role::user_status,
                email = COALESCE(user_record.email, email)
            WHERE id = user_record.id;
            RAISE NOTICE 'Ažuriran korisnik sa ID: %', user_record.id;
        ELSE
            -- Kreiramo novog korisnika
            INSERT INTO public.kupci (
                id, 
                ime_kupca, 
                prezime_kupca, 
                email, 
                status
            ) VALUES (
                user_record.id,
                'Korisnik', -- Privremeno ime
                'Korisnik', -- Privremeno prezime
                user_record.email,
                user_role::user_status
            );
            RAISE NOTICE 'Kreiran novi korisnik sa ID: %', user_record.id;
        END IF;
    END LOOP;
END$$;

-- Funkcija za dodavanje novog kupca
CREATE OR REPLACE FUNCTION public.dodaj_kupca(
    p_ime_kupca TEXT,
    p_prezime_kupca TEXT,
    p_email TEXT,
    p_adresa TEXT DEFAULT NULL,
    p_mesto TEXT DEFAULT NULL,
    p_id_post TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_kupac_id UUID;
    v_existing_id UUID;
BEGIN
    -- Proveravamo da li već postoji kupac sa datim email-om
    IF p_email IS NOT NULL THEN
        SELECT id INTO v_existing_id FROM public.kupci WHERE email = p_email;
        
        IF v_existing_id IS NOT NULL THEN
            -- Ažuriramo postojećeg kupca ako je potrebno
            UPDATE public.kupci
            SET ime_kupca = COALESCE(NULLIF(p_ime_kupca, ''), ime_kupca),
                prezime_kupca = COALESCE(NULLIF(p_prezime_kupca, ''), prezime_kupca),
                adresa = COALESCE(NULLIF(p_adresa, ''), adresa),
                mesto = COALESCE(NULLIF(p_mesto, ''), mesto),
                id_post = COALESCE(NULLIF(p_id_post, ''), id_post)
            WHERE id = v_existing_id;
            
            RETURN v_existing_id;
        END IF;
    END IF;
    
    -- Kreiramo novog kupca
    INSERT INTO public.kupci (
        id,
        ime_kupca,
        prezime_kupca,
        email,
        adresa,
        mesto,
        id_post,
        status
    ) VALUES (
        uuid_generate_v4(),
        p_ime_kupca,
        p_prezime_kupca,
        p_email,
        p_adresa,
        p_mesto,
        p_id_post,
        'neregistrovan'
    )
    RETURNING id INTO v_kupac_id;
    
    RETURN v_kupac_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funkcija za registraciju korisnika
CREATE OR REPLACE FUNCTION public.registruj_korisnika(
    p_user_id UUID,
    p_ime_kupca TEXT,
    p_prezime_kupca TEXT,
    p_email TEXT,
    p_adresa TEXT DEFAULT NULL,
    p_mesto TEXT DEFAULT NULL,
    p_id_post TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    -- Proveravamo da li već postoji kupac sa datim ID-om
    IF EXISTS (SELECT 1 FROM public.kupci WHERE id = p_user_id) THEN
        -- Ažuriramo postojećeg kupca
        UPDATE public.kupci
        SET ime_kupca = p_ime_kupca,
            prezime_kupca = p_prezime_kupca,
            email = p_email,
            adresa = COALESCE(p_adresa, adresa),
            mesto = COALESCE(p_mesto, mesto),
            id_post = COALESCE(p_id_post, id_post),
            status = 'registrovan'
        WHERE id = p_user_id;
    ELSE
        -- Kreiramo novog kupca
        INSERT INTO public.kupci (
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

-- Funkcija za ažuriranje statusa korisnika
CREATE OR REPLACE FUNCTION public.azuriraj_status_korisnika(
    p_user_id UUID,
    p_status user_status
) RETURNS VOID AS $$
BEGIN
    UPDATE public.kupci
    SET status = p_status
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funkcija za dobijanje kupca po email-u
CREATE OR REPLACE FUNCTION public.dohvati_kupca_po_email(
    p_email TEXT
) RETURNS SETOF public.kupci AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.kupci WHERE email = p_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Postavljanje RLS politika za tabelu kupci
ALTER TABLE public.kupci ENABLE ROW LEVEL SECURITY;

-- Brisanje postojećih politika
DROP POLICY IF EXISTS "Users can view their own customer data" ON public.kupci;
DROP POLICY IF EXISTS "Users can update their own customer data" ON public.kupci;
DROP POLICY IF EXISTS "Users can insert their own customer data" ON public.kupci;
DROP POLICY IF EXISTS "Admins can view all customer data" ON public.kupci;
DROP POLICY IF EXISTS "Admins can update all customer data" ON public.kupci;

-- Kreiranje novih politika
CREATE POLICY "Korisnici mogu videti svoje podatke" ON public.kupci
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Korisnici mogu ažurirati svoje podatke" ON public.kupci
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Korisnici mogu dodati svoje podatke" ON public.kupci
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Administratori mogu videti sve kupce" ON public.kupci
    FOR SELECT USING (
        (SELECT status FROM public.kupci WHERE id = auth.uid()) = 'administrator'
    );

CREATE POLICY "Administratori mogu ažurirati sve kupce" ON public.kupci
    FOR UPDATE USING (
        (SELECT status FROM public.kupci WHERE id = auth.uid()) = 'administrator'
    );

CREATE POLICY "Administratori mogu dodati kupce" ON public.kupci
    FOR INSERT WITH CHECK (
        (SELECT status FROM public.kupci WHERE id = auth.uid()) = 'administrator'
    );

CREATE POLICY "Administratori mogu brisati kupce" ON public.kupci
    FOR DELETE USING (
        (SELECT status FROM public.kupci WHERE id = auth.uid()) = 'administrator'
    );

-- Funkcija za proveru da li je korisnik administrator
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT status = 'administrator'
        FROM public.kupci
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funkcija za proveru da li je korisnik registrovan
CREATE OR REPLACE FUNCTION public.is_registered() RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT status IN ('registrovan', 'administrator')
        FROM public.kupci
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 