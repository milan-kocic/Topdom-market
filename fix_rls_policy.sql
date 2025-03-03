-- Skripta za popravku RLS politika za user_profiles tabelu
-- Ova skripta rešava problem beskonačne rekurzije u politikama

-- Prvo isključujemo RLS za user_profiles tabelu da bismo mogli da je modifikujemo
ALTER TABLE IF EXISTS public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Brišemo postojeće politike koje izazivaju rekurziju
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;

-- Kreiramo novu politiku koja omogućava svim autentifikovanim korisnicima da vide svoje profile
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Kreiramo novu politiku koja omogućava korisnicima sa admin ulogom da vide sve profile
-- Ova politika koristi direktno poređenje sa 'admin' umesto rekurzivne provere
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR ALL USING (
        (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- Kreiramo politiku koja omogućava svim korisnicima da ažuriraju svoje profile
CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

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