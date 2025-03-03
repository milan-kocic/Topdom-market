// Jednostavna skripta za popravku tabele user_profiles
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Proveri da li su postavljene env varijable
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY
) {
  console.error(
    'Nedostaju env varijable: NEXT_PUBLIC_SUPABASE_URL ili SUPABASE_SERVICE_ROLE_KEY'
  );
  process.exit(1);
}

// Kreiraj Supabase klijent sa service role key-om
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  try {
    console.log('Pokretanje popravke tabele user_profiles...');

    // 1. Isključi RLS za user_profiles tabelu
    console.log('1. Isključivanje RLS za user_profiles tabelu...');
    await supabase.rpc('pgbouncer_exec', {
      query:
        'ALTER TABLE IF EXISTS public.user_profiles DISABLE ROW LEVEL SECURITY;'
    });

    // 2. Proveri da li kolona user_id postoji
    console.log('2. Provera da li kolona user_id postoji...');
    const { data: columns } = await supabase.rpc('pgbouncer_exec', {
      query: `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles';
      `
    });

    console.log('Postojeće kolone:', columns);

    // 3. Dodaj kolonu user_id ako ne postoji
    if (!columns || !columns.some((col) => col.column_name === 'user_id')) {
      console.log('3. Dodavanje kolone user_id...');
      await supabase.rpc('pgbouncer_exec', {
        query: `
          ALTER TABLE public.user_profiles 
          ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
          
          ALTER TABLE public.user_profiles 
          ADD CONSTRAINT IF NOT EXISTS user_profiles_user_id_key UNIQUE (user_id);
        `
      });
    } else {
      console.log('Kolona user_id već postoji.');
    }

    // 4. Kreiraj politiku koja dozvoljava svim korisnicima pristup
    console.log('4. Kreiranje politike za pristup...');
    await supabase.rpc('pgbouncer_exec', {
      query: `
        DROP POLICY IF EXISTS "Allow all access to user_profiles" ON public.user_profiles;
        
        CREATE POLICY "Allow all access to user_profiles" ON public.user_profiles
        FOR ALL TO authenticated
        USING (true);
      `
    });

    // 5. Ponovo omogući RLS
    console.log('5. Ponovno omogućavanje RLS...');
    await supabase.rpc('pgbouncer_exec', {
      query:
        'ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;'
    });

    // 6. Popravi funkciju za automatsko kreiranje profila
    console.log('6. Popravka funkcije za automatsko kreiranje profila...');
    await supabase.rpc('pgbouncer_exec', {
      query: `
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
        
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
      `
    });

    console.log('Popravka je uspešno završena!');
  } catch (error) {
    console.error('Greška:', error);
    process.exit(1);
  }
}

main();
