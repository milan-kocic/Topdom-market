// Skripta za dodavanje polja iznenadjenje u tabelu proizvodi
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
    console.log('Dodavanje polja iznenadjenje u tabelu proizvodi...');

    // 1. Dodaj polje iznenadjenje u tabelu proizvodi
    console.log('1. Dodavanje polja iznenadjenje...');
    const { error: addColumnError } = await supabase.rpc('pgbouncer_exec', {
      query:
        'ALTER TABLE proizvodi ADD COLUMN IF NOT EXISTS iznenadjenje BOOLEAN NOT NULL DEFAULT false;'
    });

    if (addColumnError) {
      console.error('Greška pri dodavanju polja iznenadjenje:', addColumnError);
      process.exit(1);
    }

    // 2. Ažuriraj nekoliko proizvoda da budu označeni kao iznenađenja
    console.log('2. Ažuriranje proizvoda...');
    const { error: updateError } = await supabase.rpc('pgbouncer_exec', {
      query: `
        UPDATE proizvodi
        SET iznenadjenje = true
        WHERE id IN (
          SELECT id FROM proizvodi
          WHERE najprodavaniji_proizvod = true
          LIMIT 4
        );
      `
    });

    if (updateError) {
      console.error('Greška pri ažuriranju proizvoda:', updateError);
      process.exit(1);
    }

    // 3. Osveži view za proizvode
    console.log('3. Osvežavanje view-a...');
    const { error: viewError } = await supabase.rpc('pgbouncer_exec', {
      query: `
        DROP VIEW IF EXISTS v_proizvodi_detalji;

        CREATE VIEW v_proizvodi_detalji AS
        SELECT 
            p.id,
            p.sku,
            p.naziv_proizvoda,
            p.opis,
            p.cena,
            p.nabavna_cena,
            p.id_kategorije,
            p.kreirano,
            p.novi_proizvod,
            p.najprodavaniji_proizvod,
            p.iznenadjenje,
            p.status_dostupnosti,
            k.naziv_kategorije,
            ps.img_url as glavna_slika
        FROM proizvodi p
        LEFT JOIN kategorije k ON p.id_kategorije = k.id
        LEFT JOIN proizvod_slike ps ON p.id = ps.id_proizvoda AND ps.redosled = 1;
      `
    });

    if (viewError) {
      console.error('Greška pri osvežavanju view-a:', viewError);
      process.exit(1);
    }

    console.log('Migracija je uspešno izvršena!');

    // 4. Proveri da li polje iznenadjenje postoji
    console.log('4. Provera da li polje iznenadjenje postoji...');
    const { data: columns, error: columnsError } = await supabase.rpc(
      'pgbouncer_exec',
      {
        query: `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'proizvodi'
        AND column_name = 'iznenadjenje';
      `
      }
    );

    if (columnsError) {
      console.error('Greška pri proveri polja iznenadjenje:', columnsError);
    } else {
      console.log('Polje iznenadjenje postoji:', columns.length > 0);
    }

    // 5. Proveri da li postoje proizvodi sa iznenadjenje = true
    console.log('5. Provera da li postoje proizvodi sa iznenadjenje = true...');
    const { data: products, error: productsError } = await supabase
      .from('proizvodi')
      .select('id, naziv_proizvoda')
      .eq('iznenadjenje', true);

    if (productsError) {
      console.error('Greška pri dohvatanju proizvoda:', productsError);
    } else {
      console.log(`Broj proizvoda sa iznenadjenje = true: ${products.length}`);
      console.log('Proizvodi:', products);
    }
  } catch (error) {
    console.error('Neočekivana greška:', error);
    process.exit(1);
  }
}

main();
