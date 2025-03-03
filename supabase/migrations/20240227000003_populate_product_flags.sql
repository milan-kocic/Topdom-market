-- Postavljamo nove proizvode (proizvodi dodati u poslednjih 30 dana)
UPDATE proizvodi
SET novi_proizvod = true
WHERE kreirano >= CURRENT_DATE - INTERVAL '30 days';

-- Postavljamo najprodavanije proizvode (top 10 proizvoda po broju prodatih komada)
WITH najprodavaniji AS (
    SELECT 
        p.id,
        SUM(sp.kolicina) as ukupno_prodato
    FROM proizvodi p
    JOIN stavke_porudzbine sp ON p.id = sp.id_proizvoda
    JOIN porudzbine po ON sp.id_porudzbine = po.id
    WHERE po.status_porudzbine = 'Isporučeno'
    GROUP BY p.id
    ORDER BY ukupno_prodato DESC
    LIMIT 10
)
UPDATE proizvodi
SET najprodavaniji_proizvod = true
WHERE id IN (SELECT id FROM najprodavaniji);

-- Kreiramo indekse za brže pretraživanje
CREATE INDEX IF NOT EXISTS idx_proizvodi_novi ON proizvodi(novi_proizvod);
CREATE INDEX IF NOT EXISTS idx_proizvodi_najprodavaniji ON proizvodi(najprodavaniji_proizvod); 