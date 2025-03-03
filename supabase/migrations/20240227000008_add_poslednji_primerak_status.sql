-- Dodajemo novu vrednost u enum tip status_dostupnosti
ALTER TYPE status_dostupnosti ADD VALUE IF NOT EXISTS 'poslednji_primerak';

-- Ažuriramo view za proizvode da bi bio siguran da je sve sinhronizovano
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