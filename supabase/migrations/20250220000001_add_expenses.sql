/*
  # Dodavanje tabele za troškove

  1. Nova tabela
    - `troskovi` - Informacije o troškovima poslovanja
*/

-- Kreiranje tabele troskovi
CREATE TABLE troskovi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  naziv text NOT NULL,
  opis text,
  iznos numeric NOT NULL CHECK (iznos >= 0),
  datum date NOT NULL,
  kategorija text NOT NULL,
  kreirano timestamptz DEFAULT now(),
  azurirano timestamptz DEFAULT now()
);

ALTER TABLE troskovi ENABLE ROW LEVEL SECURITY;

-- Kreiranje trigera za ažuriranje vremena
CREATE TRIGGER update_troskovi_azurirano
  BEFORE UPDATE ON troskovi
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Dodavanje polisa za pristup
CREATE POLICY "Samo admin može da upravlja troškovima"
  ON troskovi
  USING (auth.role() = 'authenticated'); 