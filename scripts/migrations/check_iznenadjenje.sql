-- Provera da li postoji kolona iznenadjenje u tabeli proizvodi
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.columns 
  WHERE table_name = 'proizvodi' 
  AND column_name = 'iznenadjenje'
) as kolona_postoji;

-- Provera broja proizvoda koji su označeni kao iznenađenja
SELECT COUNT(*) as broj_iznenadjenja
FROM proizvodi
WHERE iznenadjenje = true;

-- Pregled proizvoda koji su označeni kao iznenađenja
SELECT 
  p.id,
  p.naziv_proizvoda,
  p.cena,
  p.iznenadjenje,
  p.najprodavaniji_proizvod
FROM proizvodi p
WHERE p.iznenadjenje = true;

-- Provera view-a
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.views 
  WHERE table_name = 'v_proizvodi_detalji'
) as view_postoji;

-- Pregled definicije view-a
SELECT 
  pg_get_viewdef('v_proizvodi_detalji'::regclass) as view_definition; 