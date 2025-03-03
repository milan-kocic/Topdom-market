-- Skripta za popravku RLS politika za user_profiles tabelu - verzija 2
-- Ova skripta rešava problem beskonačne rekurzije u politikama

-- Prvo isključujemo RLS za user_profiles tabelu da bismo mogli da je modifikujemo
ALTER TABLE IF EXISTS public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Brišemo sve postojeće politike za user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

-- Kreiramo novu politiku koja omogućava SVIM korisnicima da vide SVE profile
-- Ovo je privremeno rešenje dok ne rešimo problem sa rekurzijom
CREATE POLICY "Allow all access to user_profiles" ON public.user_profiles
    FOR ALL TO authenticated
    USING (true);

-- Ponovo omogućavamo RLS za user_profiles tabelu
ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Dodajemo administratora ako ne postoji
DO $$
DECLARE
    admin_exists BOOLEAN;
    user_exists BOOLEAN;
BEGIN
    -- Proveravamo da li postoji korisnik sa ID-om koji je prosleđen
    SELECT EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = 'cddc5b2e-7392-4093-837b-c4fa56055fb6'
    ) INTO user_exists;
    
    IF user_exists THEN
        -- Proveravamo da li već postoji profil za ovog korisnika
        SELECT EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = 'cddc5b2e-7392-4093-837b-c4fa56055fb6'
        ) INTO admin_exists;
        
        IF NOT admin_exists THEN
            -- Ako ne postoji profil, kreiramo ga sa admin ulogom
            INSERT INTO public.user_profiles (user_id, role)
            VALUES ('cddc5b2e-7392-4093-837b-c4fa56055fb6', 'admin');
            RAISE NOTICE 'Kreiran admin profil za korisnika cddc5b2e-7392-4093-837b-c4fa56055fb6';
        ELSE
            -- Ako profil postoji, ažuriramo ga na admin ulogu
            UPDATE public.user_profiles
            SET role = 'admin'
            WHERE user_id = 'cddc5b2e-7392-4093-837b-c4fa56055fb6';
            RAISE NOTICE 'Ažuriran profil na admin ulogu za korisnika cddc5b2e-7392-4093-837b-c4fa56055fb6';
        END IF;
    ELSE
        RAISE NOTICE 'Korisnik sa ID-om cddc5b2e-7392-4093-837b-c4fa56055fb6 ne postoji';
    END IF;
END
$$;

-- Takođe popravljamo politike za kupci tabelu
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'kupci') THEN
        -- Isključujemo RLS za kupci tabelu
        ALTER TABLE public.kupci DISABLE ROW LEVEL SECURITY;
        
        -- Brišemo sve postojeće politike za kupci
        DROP POLICY IF EXISTS "Users can view their own customer data" ON public.kupci;
        DROP POLICY IF EXISTS "Users can update their own customer data" ON public.kupci;
        DROP POLICY IF EXISTS "Users can insert their own customer data" ON public.kupci;
        DROP POLICY IF EXISTS "Admins can view all customer data" ON public.kupci;
        DROP POLICY IF EXISTS "Admins can update all customer data" ON public.kupci;
        
        -- Kreiramo novu politiku koja omogućava SVIM korisnicima da vide SVE kupce
        CREATE POLICY "Allow all access to kupci" ON public.kupci
            FOR ALL TO authenticated
            USING (true);
        
        -- Ponovo omogućavamo RLS za kupci tabelu
        ALTER TABLE public.kupci ENABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- Provera i kreiranje zapisa za korisnika u tabeli kupci
DO $$
DECLARE
    user_exists BOOLEAN;
    kupac_exists BOOLEAN;
    user_email VARCHAR(255);
BEGIN
    -- Proveravamo da li postoji korisnik sa ID-om koji je prosleđen
    SELECT EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = 'cddc5b2e-7392-4093-837b-c4fa56055fb6'
    ) INTO user_exists;
    
    IF user_exists THEN
        -- Dobavljamo email korisnika
        SELECT email FROM auth.users
        WHERE id = 'cddc5b2e-7392-4093-837b-c4fa56055fb6'
        INTO user_email;
        
        -- Proveravamo da li već postoji zapis za ovog korisnika u tabeli kupci
        SELECT EXISTS (
            SELECT 1 FROM public.kupci
            WHERE id = 'cddc5b2e-7392-4093-837b-c4fa56055fb6'
        ) INTO kupac_exists;
        
        IF NOT kupac_exists AND user_email IS NOT NULL THEN
            -- Ako ne postoji zapis, kreiramo ga
            INSERT INTO public.kupci (id, ime_kupca, prezime_kupca, email)
            VALUES ('cddc5b2e-7392-4093-837b-c4fa56055fb6', 'Korisnik', 'Korisnik', user_email);
            RAISE NOTICE 'Kreiran zapis u tabeli kupci za korisnika cddc5b2e-7392-4093-837b-c4fa56055fb6';
        ELSE
            RAISE NOTICE 'Zapis u tabeli kupci već postoji za korisnika cddc5b2e-7392-4093-837b-c4fa56055fb6 ili email nije dostupan';
        END IF;
    ELSE
        RAISE NOTICE 'Korisnik sa ID-om cddc5b2e-7392-4093-837b-c4fa56055fb6 ne postoji';
    END IF;
END
$$; 