-- Dodajemo polje iznenadjenje u tabelu proizvodi
ALTER TABLE proizvodi
ADD COLUMN IF NOT EXISTS iznenadjenje BOOLEAN NOT NULL DEFAULT false;

-- Ažuriramo nekoliko proizvoda da budu označeni kao iznenađenja
UPDATE proizvodi
SET iznenadjenje = true
WHERE id IN (
  SELECT id FROM proizvodi
  WHERE najprodavaniji_proizvod = true
  LIMIT 4
);

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