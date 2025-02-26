-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create kupci table
CREATE TABLE kupci (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ime_kupca VARCHAR NOT NULL,
    prezime_kupca VARCHAR NOT NULL,
    email VARCHAR UNIQUE,
    adresa TEXT NOT NULL,
    mesto VARCHAR NOT NULL,
    id_post VARCHAR NOT NULL,
    kreirano TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create kategorije table
CREATE TABLE kategorije (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    naziv_kategorije VARCHAR NOT NULL,
    opis_kategorije TEXT,
    img_url TEXT,
    kreirano TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create proizvodi table
CREATE TABLE proizvodi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR UNIQUE NOT NULL,
    naziv_proizvoda VARCHAR NOT NULL,
    opis TEXT,
    cena NUMERIC(10,2) NOT NULL,
    nabavna_cena NUMERIC(10,2) NOT NULL,
    id_kategorije UUID REFERENCES kategorije(id) ON DELETE SET NULL,
    kreirano TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create proizvod_slike table
CREATE TABLE proizvod_slike (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_proizvoda UUID REFERENCES proizvodi(id) ON DELETE CASCADE,
    img_url TEXT NOT NULL,
    redosled INT NOT NULL,
    UNIQUE(id_proizvoda, redosled)
);

-- Create porudzbine table
CREATE TABLE porudzbine (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_kupca UUID REFERENCES kupci(id) ON DELETE SET NULL,
    cena_ukupno NUMERIC(10,2) NOT NULL,
    status_porudzbine VARCHAR NOT NULL CHECK (status_porudzbine IN ('Obrada', 'Otpremljeno', 'Isporučeno', 'Otkazano')),
    kreirano TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create stavke_porudzbine table
CREATE TABLE stavke_porudzbine (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_porudzbine UUID REFERENCES porudzbine(id) ON DELETE CASCADE,
    id_proizvoda UUID REFERENCES proizvodi(id) ON DELETE SET NULL,
    kolicina INT NOT NULL CHECK (kolicina > 0),
    cena NUMERIC(10,2) NOT NULL
);

-- Create prihodi table
CREATE TABLE prihodi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_porudzbine UUID UNIQUE REFERENCES porudzbine(id) ON DELETE CASCADE,
    bruto_prihod NUMERIC(10,2) NOT NULL,
    troskovi_pakovanje NUMERIC(10,2) NOT NULL DEFAULT 0,
    troskovi_dostave NUMERIC(10,2) NOT NULL DEFAULT 0,
    neto_prihod NUMERIC(10,2) NOT NULL,
    datum TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create troskovi table
CREATE TABLE troskovi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    naziv VARCHAR NOT NULL,
    iznos NUMERIC(10,2) NOT NULL,
    kategorija TEXT NOT NULL CHECK (kategorija IN ('Pakovanje', 'Dostava', 'Marketing', 'Ostalo')),
    datum TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_proizvodi_kategorija ON proizvodi(id_kategorije);
CREATE INDEX idx_porudzbine_kupac ON porudzbine(id_kupca);
CREATE INDEX idx_stavke_porudzbina ON stavke_porudzbine(id_porudzbine);
CREATE INDEX idx_stavke_proizvod ON stavke_porudzbine(id_proizvoda);
CREATE INDEX idx_slike_proizvod ON proizvod_slike(id_proizvoda);

-- Create view for product details with primary image
CREATE VIEW v_proizvodi_detalji AS
SELECT 
    p.*,
    k.naziv_kategorije,
    ps.img_url as glavna_slika
FROM proizvodi p
LEFT JOIN kategorije k ON p.id_kategorije = k.id
LEFT JOIN proizvod_slike ps ON p.id = ps.id_proizvoda AND ps.redosled = 1;

-- Create view for order summary
CREATE VIEW v_porudzbine_pregled AS
SELECT 
    p.id,
    p.kreirano,
    p.status_porudzbine,
    p.cena_ukupno,
    k.ime_kupca || ' ' || k.prezime_kupca as kupac,
    COUNT(sp.id) as broj_stavki,
    STRING_AGG(pr.naziv_proizvoda, ', ') as proizvodi
FROM porudzbine p
JOIN kupci k ON p.id_kupca = k.id
JOIN stavke_porudzbine sp ON p.id = sp.id_porudzbine
JOIN proizvodi pr ON sp.id_proizvoda = pr.id
GROUP BY p.id, p.kreirano, p.status_porudzbine, p.cena_ukupno, k.ime_kupca, k.prezime_kupca; 