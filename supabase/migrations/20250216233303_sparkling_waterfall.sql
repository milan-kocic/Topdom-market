/*
  # Unos početnih podataka

  1. Kategorije
    - Osnovne kategorije proizvoda
  
  2. Proizvodi
    - Početni set proizvoda za svaku kategoriju
*/

-- Unos kategorija
INSERT INTO kategorije (naziv_kategorije, opis_kategorije) VALUES
  ('Kućni aparati', 'Aparati za svakodnevnu upotrebu u domaćinstvu'),
  ('Kuhinja i posuđe', 'Sve za opremanje kuhinje'),
  ('Dekoracija', 'Ukrasi i dekorativni elementi za dom'),
  ('Organizacija', 'Proizvodi za organizaciju prostora'),
  ('Održavanje', 'Sredstva i oprema za održavanje doma'),
  ('Lifestyle', 'Proizvodi za udobniji život');

-- Unos proizvoda
INSERT INTO proizvodi (naziv_proizvoda, opis, cena, id_kategorija, img_url, dostupnost) 
SELECT 
  'Smart Blender Pro',
  'Profesionalni blender sa naprednim funkcijama za savršene rezultate',
  12999,
  id,
  'https://images.unsplash.com/photo-1585771724684-38269d6639fd?ixlib=rb-4.0.3',
  true
FROM kategorije WHERE naziv_kategorije = 'Kućni aparati';

INSERT INTO proizvodi (naziv_proizvoda, opis, cena, id_kategorija, img_url, dostupnost)
SELECT 
  'Eco Posuđe Set',
  'Ekološki set posuđa od visokokvalitetnih materijala',
  8999,
  id,
  'https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?ixlib=rb-4.0.3',
  true
FROM kategorije WHERE naziv_kategorije = 'Kuhinja i posuđe';

INSERT INTO proizvodi (naziv_proizvoda, opis, cena, id_kategorija, img_url, dostupnost)
SELECT 
  'Organizator Plus',
  'Modularni sistem za organizaciju prostora',
  4999,
  id,
  'https://images.unsplash.com/photo-1597072689227-8882273e8f6a?ixlib=rb-4.0.3',
  true
FROM kategorije WHERE naziv_kategorije = 'Organizacija';

INSERT INTO proizvodi (naziv_proizvoda, opis, cena, id_kategorija, img_url, dostupnost)
SELECT 
  'Aroma Difuzor',
  'Elegantan difuzor za aromaterapiju sa LED osvetljenjem',
  3999,
  id,
  'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-4.0.3',
  true
FROM kategorije WHERE naziv_kategorije = 'Lifestyle';