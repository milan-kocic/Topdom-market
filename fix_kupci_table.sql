-- Skripta za proveru i kreiranje tabele kupci

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
        
        -- Omogućavamo RLS za tabelu kupci
        ALTER TABLE public.kupci ENABLE ROW LEVEL SECURITY;
        
        -- Kreiramo politike za kupci
        CREATE POLICY "Users can view their own customer data" ON public.kupci
            FOR SELECT USING (auth.uid() = id);
            
        CREATE POLICY "Users can update their own customer data" ON public.kupci
            FOR UPDATE USING (auth.uid() = id);
            
        CREATE POLICY "Users can insert their own customer data" ON public.kupci
            FOR INSERT WITH CHECK (auth.uid() = id);
            
        -- Kreiramo politiku koja omogućava korisnicima sa admin ulogom da vide sve kupce
        CREATE POLICY "Admins can view all customer data" ON public.kupci
            FOR SELECT USING (
                (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()) = 'admin'
            );
            
        -- Kreiramo politiku koja omogućava korisnicima sa admin ulogom da ažuriraju sve kupce
        CREATE POLICY "Admins can update all customer data" ON public.kupci
            FOR UPDATE USING (
                (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()) = 'admin'
            );
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
        
        IF NOT kupac_exists THEN
            -- Ako ne postoji zapis, kreiramo ga
            INSERT INTO public.kupci (id, ime_kupca, prezime_kupca, email)
            VALUES ('cddc5b2e-7392-4093-837b-c4fa56055fb6', 'Korisnik', 'Korisnik', user_email);
            RAISE NOTICE 'Kreiran zapis u tabeli kupci za korisnika cddc5b2e-7392-4093-837b-c4fa56055fb6';
        ELSE
            RAISE NOTICE 'Zapis u tabeli kupci već postoji za korisnika cddc5b2e-7392-4093-837b-c4fa56055fb6';
        END IF;
    ELSE
        RAISE NOTICE 'Korisnik sa ID-om cddc5b2e-7392-4093-837b-c4fa56055fb6 ne postoji';
    END IF;
END
$$; 