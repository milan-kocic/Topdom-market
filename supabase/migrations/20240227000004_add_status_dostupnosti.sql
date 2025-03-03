-- Kreiramo enum tip za status dostupnosti
CREATE TYPE status_dostupnosti AS ENUM (
    'na_stanju',
    'rasprodato',
    'uskoro',
    'po_porudzbini'
);

-- Dodajemo novu kolonu status_dostupnosti
ALTER TABLE proizvodi
ADD COLUMN status_dostupnosti status_dostupnosti NOT NULL DEFAULT 'na_stanju';

-- Ažuriramo view za proizvode da uključi novu kolonu
DROP VIEW IF EXISTS v_proizvodi_detalji;

CREATE VIEW v_proizvodi_detalji AS
SELECT 
    p.*,
    k.naziv_kategorije,
    ps.img_url as glavna_slika
FROM proizvodi p
LEFT JOIN kategorije k ON p.id_kategorije = k.id
LEFT JOIN proizvod_slike ps ON p.id = ps.id_proizvoda AND ps.redosled = 1;

-- Kreiramo indeks za brže pretraživanje
CREATE INDEX IF NOT EXISTS idx_proizvodi_status_dostupnosti ON proizvodi(status_dostupnosti); 