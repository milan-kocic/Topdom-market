-- Skripta za popravku tabele user_profiles
-- Ovu skriptu treba izvršiti direktno u Supabase SQL Editor konzoli

-- 1. Isključi RLS za user_profiles tabelu
ALTER TABLE IF EXISTS public.user_profiles DISABLE ROW LEVEL SECURITY;

-- 2. Proveri da li kolona user_id postoji i dodaj je ako ne postoji
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

-- 3. Kreiraj politiku koja dozvoljava svim korisnicima pristup
DROP POLICY IF EXISTS "Allow all access to user_profiles" ON public.user_profiles;
CREATE POLICY "Allow all access to user_profiles" ON public.user_profiles
    FOR ALL TO authenticated
    USING (true);

-- 4. Ponovo omogući RLS
ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Popravi funkciju za automatsko kreiranje profila
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, role)
    VALUES (NEW.id, 'customer')
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Greška pri kreiranju profila: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Kreiraj trigger ako ne postoji
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Kreiraj profile za postojeće korisnike
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