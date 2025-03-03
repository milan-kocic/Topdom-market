-- Dodajemo nove kolone u tabelu proizvodi
ALTER TABLE proizvodi
ADD COLUMN novi_proizvod BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN najprodavaniji_proizvod BOOLEAN NOT NULL DEFAULT false; 