// Skripta za pokretanje SQL skripte za popravku tabele user_profiles
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Učitaj .env fajl
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
    console.log('Pokretanje SQL skripte za popravku tabele user_profiles...');

    // Učitaj SQL skriptu
    const sqlScript = fs.readFileSync(
      path.join(__dirname, 'fix_user_profiles.sql'),
      'utf8'
    );

    // Izvrši SQL skriptu
    const { error } = await supabase.rpc('pgbouncer_exec', {
      query: sqlScript
    });

    if (error) {
      console.error('Greška pri izvršavanju SQL skripte:', error);
      process.exit(1);
    }

    console.log('SQL skripta je uspešno izvršena!');

    // Proveri da li tabela user_profiles ima kolonu user_id
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'user_profiles');

    if (columnsError) {
      console.error('Greška pri proveri kolona:', columnsError);
    } else {
      console.log(
        'Kolone u tabeli user_profiles:',
        columns.map((c) => c.column_name).join(', ')
      );
    }

    // Proveri da li postoje profili za korisnike
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*');

    if (profilesError) {
      console.error('Greška pri dohvatanju profila:', profilesError);
    } else {
      console.log(`Broj profila u tabeli user_profiles: ${profiles.length}`);
    }
  } catch (error) {
    console.error('Neočekivana greška:', error);
    process.exit(1);
  }
}

main();
