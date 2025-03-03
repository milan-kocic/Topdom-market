-- Skripta za brisanje tabele user_profiles i svih zavisnih objekata

DO $$
BEGIN
    -- Proveravamo da li tabela user_profiles postoji
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        -- Uklanjamo sve RLS politike koje zavise od user_profiles
        DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
        DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
        DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
        DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;
        DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
        DROP POLICY IF EXISTS "Admins can insert profiles" ON public.user_profiles;
        DROP POLICY IF EXISTS "Users can delete their own profile" ON public.user_profiles;
        DROP POLICY IF EXISTS "Admins can delete profiles" ON public.user_profiles;
        DROP POLICY IF EXISTS "Allow all access to user_profiles" ON public.user_profiles;
        
        -- Uklanjamo sve trigere koji zavise od user_profiles
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        
        -- Uklanjamo sve funkcije koje zavise od user_profiles
        DROP FUNCTION IF EXISTS public.handle_new_user();
        DROP FUNCTION IF EXISTS public.get_user_role(user_id uuid);
        DROP FUNCTION IF EXISTS public.is_admin();
        
        -- Uklanjamo sve strane ključeve koji zavise od user_profiles
        ALTER TABLE IF EXISTS public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;
        
        -- Uklanjamo sve jedinstvene ključeve
        ALTER TABLE IF EXISTS public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_key;
        
        -- Uklanjamo sve indekse
        DROP INDEX IF EXISTS user_profiles_user_id_idx;
        
        -- Konačno brišemo tabelu
        DROP TABLE public.user_profiles;
        RAISE NOTICE 'Tabela user_profiles i sve zavisne politike su uspešno obrisane';
    ELSE
        RAISE NOTICE 'Tabela user_profiles ne postoji';
    END IF;
END $$; 