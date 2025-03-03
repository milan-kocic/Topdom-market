-- Provera i kreiranje ekstenzije za UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Provera i kreiranje enum tipova
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('admin', 'customer');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_dostupnosti') THEN
        CREATE TYPE public.status_dostupnosti AS ENUM ('na_stanju', 'rasprodato', 'uskoro', 'po_porudzbini', 'poslednji_primerak');
    END IF;
END
$$;

-- Provera i kreiranje tabele user_profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        CREATE TABLE public.user_profiles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL UNIQUE,
            role user_role NOT NULL DEFAULT 'customer',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Dodajemo referencu na auth.users samo ako tabela postoji
        BEGIN
            ALTER TABLE public.user_profiles 
            ADD CONSTRAINT user_profiles_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        EXCEPTION
            WHEN undefined_table THEN
                RAISE NOTICE 'Tabela auth.users ne postoji, preskačem dodavanje reference';
        END;
    END IF;
END
$$;

-- Provera i kreiranje tabele kupci
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'kupci') THEN
        CREATE TABLE public.kupci (
            id UUID PRIMARY KEY,
            ime_kupca VARCHAR(255) NOT NULL,
            prezime_kupca VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            adresa VARCHAR(255),
            mesto VARCHAR(255),
            id_post VARCHAR(255),
            kreirano TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Dodajemo referencu na auth.users samo ako tabela postoji
        BEGIN
            ALTER TABLE public.kupci 
            ADD CONSTRAINT kupci_id_fkey 
            FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
        EXCEPTION
            WHEN undefined_table THEN
                RAISE NOTICE 'Tabela auth.users ne postoji, preskačem dodavanje reference';
        END;
    END IF;
END
$$;

-- Provera i kreiranje tabele porudzbine
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'porudzbine') THEN
        CREATE TABLE public.porudzbine (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            id_kupca UUID,
            cena_ukupno DECIMAL(10, 2) NOT NULL,
            status_porudzbine VARCHAR(50) NOT NULL,
            kreirano TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Dodajemo referencu na kupci samo ako tabela postoji
        BEGIN
            ALTER TABLE public.porudzbine 
            ADD CONSTRAINT porudzbine_id_kupca_fkey 
            FOREIGN KEY (id_kupca) REFERENCES public.kupci(id) ON DELETE SET NULL;
        EXCEPTION
            WHEN undefined_table THEN
                RAISE NOTICE 'Tabela kupci ne postoji, preskačem dodavanje reference';
        END;
    END IF;
END
$$;

-- Provera i kreiranje tabele stavke_porudzbine
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'stavke_porudzbine') THEN
        CREATE TABLE public.stavke_porudzbine (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            id_porudzbine UUID,
            id_proizvoda UUID,
            kolicina INTEGER NOT NULL,
            cena DECIMAL(10, 2) NOT NULL
        );
        
        -- Dodajemo referencu na porudzbine samo ako tabela postoji
        BEGIN
            ALTER TABLE public.stavke_porudzbine 
            ADD CONSTRAINT stavke_porudzbine_id_porudzbine_fkey 
            FOREIGN KEY (id_porudzbine) REFERENCES public.porudzbine(id) ON DELETE CASCADE;
        EXCEPTION
            WHEN undefined_table THEN
                RAISE NOTICE 'Tabela porudzbine ne postoji, preskačem dodavanje reference';
        END;
        
        -- Dodajemo referencu na proizvodi samo ako tabela postoji
        BEGIN
            ALTER TABLE public.stavke_porudzbine 
            ADD CONSTRAINT stavke_porudzbine_id_proizvoda_fkey 
            FOREIGN KEY (id_proizvoda) REFERENCES public.proizvodi(id) ON DELETE SET NULL;
        EXCEPTION
            WHEN undefined_table THEN
                RAISE NOTICE 'Tabela proizvodi ne postoji, preskačem dodavanje reference';
        END;
    END IF;
END
$$;

-- Kreiranje funkcije za automatsko kreiranje profila korisnika
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, role)
    VALUES (NEW.id, 'customer');
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Greška pri kreiranju profila: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kreiranje trigera za automatsko kreiranje profila korisnika
DO $$
BEGIN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    
    BEGIN
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'Tabela auth.users ne postoji, preskačem kreiranje trigera';
    END;
END
$$;

-- Postavljanje RLS politika
-- Omogućavanje RLS za tabele
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'kupci') THEN
        ALTER TABLE public.kupci ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'porudzbine') THEN
        ALTER TABLE public.porudzbine ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'stavke_porudzbine') THEN
        ALTER TABLE public.stavke_porudzbine ENABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- Kreiranje politika za user_profiles
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
        CREATE POLICY "Users can view their own profile" ON public.user_profiles
            FOR SELECT USING (auth.uid() = user_id);
            
        DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
        CREATE POLICY "Admins can view all profiles" ON public.user_profiles
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.user_profiles
                    WHERE user_id = auth.uid() AND role = 'admin'
                )
            );
    END IF;
END
$$;

-- Kreiranje politika za kupci
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'kupci') THEN
        DROP POLICY IF EXISTS "Users can view their own customer data" ON public.kupci;
        CREATE POLICY "Users can view their own customer data" ON public.kupci
            FOR SELECT USING (auth.uid() = id);
            
        DROP POLICY IF EXISTS "Users can update their own customer data" ON public.kupci;
        CREATE POLICY "Users can update their own customer data" ON public.kupci
            FOR UPDATE USING (auth.uid() = id);
            
        DROP POLICY IF EXISTS "Users can insert their own customer data" ON public.kupci;
        CREATE POLICY "Users can insert their own customer data" ON public.kupci
            FOR INSERT WITH CHECK (auth.uid() = id);
            
        DROP POLICY IF EXISTS "Admins can view all customer data" ON public.kupci;
        CREATE POLICY "Admins can view all customer data" ON public.kupci
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.user_profiles
                    WHERE user_id = auth.uid() AND role = 'admin'
                )
            );
            
        DROP POLICY IF EXISTS "Admins can update all customer data" ON public.kupci;
        CREATE POLICY "Admins can update all customer data" ON public.kupci
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM public.user_profiles
                    WHERE user_id = auth.uid() AND role = 'admin'
                )
            );
    END IF;
END
$$;

-- Kreiranje politika za porudzbine
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'porudzbine') THEN
        DROP POLICY IF EXISTS "Users can view their own orders" ON public.porudzbine;
        CREATE POLICY "Users can view their own orders" ON public.porudzbine
            FOR SELECT USING (auth.uid() = id_kupca);
            
        DROP POLICY IF EXISTS "Admins can view all orders" ON public.porudzbine;
        CREATE POLICY "Admins can view all orders" ON public.porudzbine
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.user_profiles
                    WHERE user_id = auth.uid() AND role = 'admin'
                )
            );
    END IF;
END
$$;

-- Kreiranje politika za stavke_porudzbine
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'stavke_porudzbine') THEN
        DROP POLICY IF EXISTS "Users can view their own order items" ON public.stavke_porudzbine;
        CREATE POLICY "Users can view their own order items" ON public.stavke_porudzbine
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.porudzbine
                    WHERE id = id_porudzbine AND id_kupca = auth.uid()
                )
            );
            
        DROP POLICY IF EXISTS "Admins can view all order items" ON public.stavke_porudzbine;
        CREATE POLICY "Admins can view all order items" ON public.stavke_porudzbine
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.user_profiles
                    WHERE user_id = auth.uid() AND role = 'admin'
                )
            );
    END IF;
END
$$;

-- Kreiranje administratora ako ne postoji
DO $$
DECLARE
    admin_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE role = 'admin'
    ) INTO admin_exists;
    
    IF NOT admin_exists THEN
        RAISE NOTICE 'Nema administratora u sistemu. Potrebno je ručno postaviti administratora.';
    END IF;
END
$$;

-- Ažuriranje korisnika na administratora (zamenite UUID sa stvarnim ID-om korisnika)
-- UPDATE public.user_profiles
-- SET role = 'admin'
-- WHERE user_id = '123e4567-e89b-12d3-a456-426614174000'; -- Primer UUID formata 