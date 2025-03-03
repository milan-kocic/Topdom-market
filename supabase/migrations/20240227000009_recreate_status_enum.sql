-- Prvo uklonimo podrazumevanu vrednost
ALTER TABLE proizvodi 
ALTER COLUMN status_dostupnosti DROP DEFAULT;

-- Privremeno promenimo tip kolone na TEXT
ALTER TABLE proizvodi 
ALTER COLUMN status_dostupnosti TYPE TEXT;

-- Obrišemo stari enum tip
DROP TYPE status_dostupnosti;

-- Kreiramo novi enum tip sa svim vrednostima
CREATE TYPE status_dostupnosti AS ENUM (
    'na_stanju',
    'rasprodato',
    'uskoro',
    'po_porudzbini',
    'poslednji_primerak'
);

-- Vratimo tip kolone na novi enum
ALTER TABLE proizvodi 
ALTER COLUMN status_dostupnosti TYPE status_dostupnosti 
USING status_dostupnosti::status_dostupnosti;

-- Postavimo podrazumevanu vrednost
ALTER TABLE proizvodi 
ALTER COLUMN status_dostupnosti SET DEFAULT 'na_stanju';

-- Ažuriramo view
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
    p.status_dostupnosti,
    k.naziv_kategorije,
    ps.img_url as glavna_slika
FROM proizvodi p
LEFT JOIN kategorije k ON p.id_kategorije = k.id
LEFT JOIN proizvod_slike ps ON p.id = ps.id_proizvoda AND ps.redosled = 1; 