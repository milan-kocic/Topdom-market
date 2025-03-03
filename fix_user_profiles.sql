-- Skripta za popravku tabele user_profiles i RLS politika

-- Prvo proveravamo strukturu tabele user_profiles
DO $$
DECLARE
    user_id_exists BOOLEAN;
BEGIN
    -- Proveravamo da li kolona user_id postoji u tabeli user_profiles
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'user_id'
    ) INTO user_id_exists;
    
    IF NOT user_id_exists THEN
        -- Ako kolona user_id ne postoji, dodajemo je
        ALTER TABLE public.user_profiles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);
        RAISE NOTICE 'Dodata kolona user_id u tabelu user_profiles';
    ELSE
        RAISE NOTICE 'Kolona user_id već postoji u tabeli user_profiles';
    END IF;
END
$$;

-- Isključujemo RLS za user_profiles tabelu
ALTER TABLE IF EXISTS public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Brišemo sve postojeće politike za user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow all access to user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Korisnici mogu videti samo svoj profil" ON public.user_profiles;
DROP POLICY IF EXISTS "Administratori mogu videti sve profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Administratori mogu ažurirati sve profile" ON public.user_profiles;

-- Kreiramo novu politiku koja omogućava SVIM korisnicima da vide i ažuriraju SVE profile
-- Ovo je privremeno rešenje dok ne rešimo problem sa rekurzijom
CREATE POLICY "Allow all access to user_profiles" ON public.user_profiles
    FOR ALL TO authenticated
    USING (true);

-- Ponovo omogućavamo RLS za user_profiles tabelu
ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Proveravamo i popravljamo trigger za automatsko kreiranje profila
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, role)
    VALUES (NEW.id, 'customer');
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- Ako profil već postoji, ne radimo ništa
        RETURN NEW;
    WHEN OTHERS THEN
        RAISE NOTICE 'Greška pri kreiranju profila: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kreiramo trigger ako ne postoji
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Proveravamo i kreiramo profile za postojeće korisnike
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id FROM auth.users LOOP
        BEGIN
            INSERT INTO public.user_profiles (user_id, role)
            VALUES (user_record.id, 'customer')
            ON CONFLICT (user_id) DO NOTHING;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Greška pri kreiranju profila za korisnika %: %', user_record.id, SQLERRM;
        END;
    END LOOP;
END
$$; 