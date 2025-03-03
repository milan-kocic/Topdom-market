-- Skripta za dodavanje polja iznenadjenje u tabelu proizvodi
-- Ovu skriptu treba izvršiti direktno u Supabase SQL Editor konzoli

-- Prvo proveravamo da li kolona iznenadjenje postoji u tabeli proizvodi
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'proizvodi' 
    AND column_name = 'iznenadjenje'
  ) THEN
    -- Ako ne postoji, dodajemo je
    ALTER TABLE proizvodi
    ADD COLUMN iznenadjenje BOOLEAN NOT NULL DEFAULT false;
    
    RAISE NOTICE 'Dodata kolona iznenadjenje u tabelu proizvodi';
  ELSE
    RAISE NOTICE 'Kolona iznenadjenje već postoji u tabeli proizvodi';
  END IF;
END $$;

-- Proveravamo da li ima proizvoda označenih kao iznenađenja
DO $$
DECLARE
  surprise_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO surprise_count
  FROM proizvodi
  WHERE iznenadjenje = true;
  
  IF surprise_count = 0 THEN
    -- Ako nema iznenađenja, označavamo top 4 najprodavanija proizvoda
    WITH najprodavaniji AS (
      SELECT id
      FROM proizvodi
      WHERE najprodavaniji_proizvod = true
      LIMIT 4
    )
    UPDATE proizvodi
    SET iznenadjenje = true
    WHERE id IN (SELECT id FROM najprodavaniji);
    
    RAISE NOTICE 'Označena 4 najprodavanija proizvoda kao iznenađenja';
  ELSE
    RAISE NOTICE 'Već postoje proizvodi označeni kao iznenađenja (ukupno: %)', surprise_count;
  END IF;
END $$;

-- Osvežavamo view v_proizvodi_detalji
DO $$
BEGIN
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

  RAISE NOTICE 'View v_proizvodi_detalji je osvežen';
END $$;

-- Proveravamo da li je sve uspešno postavljeno
DO $$
DECLARE
  kolona_postoji BOOLEAN;
  broj_iznenadjenja INTEGER;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'proizvodi' 
    AND column_name = 'iznenadjenje'
  ) INTO kolona_postoji;

  SELECT COUNT(*) INTO broj_iznenadjenja
  FROM proizvodi
  WHERE iznenadjenje = true;

  RAISE NOTICE 'Status provere:';
  RAISE NOTICE 'Kolona iznenadjenje postoji: %', kolona_postoji;
  RAISE NOTICE 'Broj proizvoda označenih kao iznenađenja: %', broj_iznenadjenja;
END $$; 