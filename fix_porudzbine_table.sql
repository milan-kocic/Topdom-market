-- Skripta za popravku RLS politika za porudzbine i stavke_porudzbine tabele
-- Ova skripta rešava problem sa RLS politikama za tabele porudzbine i stavke_porudzbine

-- Popravljamo politike za porudzbine tabelu
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'porudzbine') THEN
        -- Isključujemo RLS za porudzbine tabelu
        ALTER TABLE public.porudzbine DISABLE ROW LEVEL SECURITY;
        
        -- Brišemo sve postojeće politike za porudzbine
        DROP POLICY IF EXISTS "Users can view their own orders" ON public.porudzbine;
        DROP POLICY IF EXISTS "Admins can view all orders" ON public.porudzbine;
        
        -- Kreiramo novu politiku koja omogućava SVIM korisnicima da vide SVE porudzbine
        CREATE POLICY "Allow all access to porudzbine" ON public.porudzbine
            FOR ALL TO authenticated
            USING (true);
        
        -- Ponovo omogućavamo RLS za porudzbine tabelu
        ALTER TABLE public.porudzbine ENABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- Popravljamo politike za stavke_porudzbine tabelu
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'stavke_porudzbine') THEN
        -- Isključujemo RLS za stavke_porudzbine tabelu
        ALTER TABLE public.stavke_porudzbine DISABLE ROW LEVEL SECURITY;
        
        -- Brišemo sve postojeće politike za stavke_porudzbine
        DROP POLICY IF EXISTS "Users can view their own order items" ON public.stavke_porudzbine;
        DROP POLICY IF EXISTS "Admins can view all order items" ON public.stavke_porudzbine;
        
        -- Kreiramo novu politiku koja omogućava SVIM korisnicima da vide SVE stavke porudzbina
        CREATE POLICY "Allow all access to stavke_porudzbine" ON public.stavke_porudzbine
            FOR ALL TO authenticated
            USING (true);
        
        -- Ponovo omogućavamo RLS za stavke_porudzbine tabelu
        ALTER TABLE public.stavke_porudzbine ENABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- Provera i kreiranje tabele narudzbine ako ne postoji
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'narudzbine') THEN
        CREATE TABLE public.narudzbine (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'nova',
            ukupna_cena DECIMAL(10, 2) NOT NULL,
            dostava_cena DECIMAL(10, 2) NOT NULL DEFAULT 0,
            ime VARCHAR(255) NOT NULL,
            prezime VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            telefon VARCHAR(50) NOT NULL,
            adresa VARCHAR(255) NOT NULL,
            grad VARCHAR(255) NOT NULL,
            postanski_broj VARCHAR(20) NOT NULL,
            napomena TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Dodajemo referencu na auth.users samo ako tabela postoji
        BEGIN
            ALTER TABLE public.narudzbine 
            ADD CONSTRAINT narudzbine_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        EXCEPTION
            WHEN undefined_table THEN
                RAISE NOTICE 'Tabela auth.users ne postoji, preskačem dodavanje reference';
        END;
        
        -- Omogućavamo RLS za tabelu narudzbine
        ALTER TABLE public.narudzbine ENABLE ROW LEVEL SECURITY;
        
        -- Kreiramo politiku koja omogućava SVIM korisnicima da vide SVE narudzbine
        CREATE POLICY "Allow all access to narudzbine" ON public.narudzbine
            FOR ALL TO authenticated
            USING (true);
    END IF;
END
$$;

-- Provera i kreiranje tabele stavke_narudzbine ako ne postoji
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'stavke_narudzbine') THEN
        CREATE TABLE public.stavke_narudzbine (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            narudzbina_id UUID NOT NULL,
            proizvod_id UUID NOT NULL,
            naziv_proizvoda VARCHAR(255) NOT NULL,
            kolicina INTEGER NOT NULL,
            cena DECIMAL(10, 2) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Dodajemo referencu na narudzbine samo ako tabela postoji
        BEGIN
            ALTER TABLE public.stavke_narudzbine 
            ADD CONSTRAINT stavke_narudzbine_narudzbina_id_fkey 
            FOREIGN KEY (narudzbina_id) REFERENCES public.narudzbine(id) ON DELETE CASCADE;
        EXCEPTION
            WHEN undefined_table THEN
                RAISE NOTICE 'Tabela narudzbine ne postoji, preskačem dodavanje reference';
        END;
        
        -- Omogućavamo RLS za tabelu stavke_narudzbine
        ALTER TABLE public.stavke_narudzbine ENABLE ROW LEVEL SECURITY;
        
        -- Kreiramo politiku koja omogućava SVIM korisnicima da vide SVE stavke narudzbina
        CREATE POLICY "Allow all access to stavke_narudzbine" ON public.stavke_narudzbine
            FOR ALL TO authenticated
            USING (true);
    END IF;
END
$$; 