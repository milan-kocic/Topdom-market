/*
  # Dodavanje šifre proizvoda u stavke porudžbine

  1. Promene
    - Dodaje kolonu sifra_proizvoda u tabelu stavke_porudzbine
    - Kreira triger koji automatski kopira šifru proizvoda iz tabele proizvodi
*/

-- Dodajemo kolonu sifra_proizvoda u tabelu stavke_porudzbine
ALTER TABLE stavke_porudzbine ADD COLUMN sifra_proizvoda text;

-- Kreiramo funkciju koja će kopirati šifru proizvoda
CREATE OR REPLACE FUNCTION copy_product_code()
RETURNS TRIGGER AS $$
BEGIN
    -- Kopiramo šifru proizvoda iz tabele proizvodi
    SELECT sifra_proizvoda INTO NEW.sifra_proizvoda
    FROM proizvodi
    WHERE id = NEW.id_proizvoda;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Kreiramo triger koji će se aktivirati pre INSERT-a
CREATE TRIGGER copy_product_code_trigger
    BEFORE INSERT ON stavke_porudzbine
    FOR EACH ROW
    EXECUTE FUNCTION copy_product_code();

-- Ažuriramo postojeće stavke porudžbine sa šiframa proizvoda
UPDATE stavke_porudzbine sp
SET sifra_proizvoda = p.sifra_proizvoda
FROM proizvodi p
WHERE sp.id_proizvoda = p.id; 