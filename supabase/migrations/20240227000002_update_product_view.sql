-- Ažuriramo view za proizvode da uključi nove kolone
DROP VIEW IF EXISTS v_proizvodi_detalji;

CREATE VIEW v_proizvodi_detalji AS
SELECT 
    p.*,  -- Ovo će uključiti sve kolone iz proizvodi tabele, uključujući novi_proizvod i najprodavaniji_proizvod
    k.naziv_kategorije,
    ps.img_url as glavna_slika
FROM proizvodi p
LEFT JOIN kategorije k ON p.id_kategorije = k.id
LEFT JOIN proizvod_slike ps ON p.id = ps.id_proizvoda AND ps.redosled = 1; 