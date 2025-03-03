-- Dodajemo kolonu iznenadjenje ako ne postoji
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'proizvodi' 
    AND column_name = 'iznenadjenje'
  ) THEN
    ALTER TABLE proizvodi
    ADD COLUMN iznenadjenje BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- Postavljamo iznenađenja na najprodavanije proizvode ako nema označenih iznenađenja
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM proizvodi WHERE iznenadjenje = true
  ) THEN
    WITH najprodavaniji AS (
      SELECT p.id
      FROM proizvodi p
      WHERE p.najprodavaniji_proizvod = true
      LIMIT 4
    )
    UPDATE proizvodi
    SET iznenadjenje = true
    WHERE id IN (SELECT id FROM najprodavaniji);
  END IF;
END $$;

-- Osvežavamo view za proizvode
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