/*
  # Dodavanje polisa za tabelu troškova

  1. Polise
    - Dozvola za čitanje troškova
    - Dozvola za upisivanje troškova
    - Dozvola za brisanje troškova
*/

-- Enable RLS
ALTER TABLE troskovi ENABLE ROW LEVEL SECURITY;

-- Policy for reading expenses
CREATE POLICY "Enable read access for authenticated users" ON troskovi
FOR SELECT
TO authenticated
USING (true);

-- Policy for inserting expenses
CREATE POLICY "Enable insert access for authenticated users" ON troskovi
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy for updating expenses
CREATE POLICY "Enable update access for authenticated users" ON troskovi
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy for deleting expenses
CREATE POLICY "Enable delete access for authenticated users" ON troskovi
FOR DELETE
TO authenticated
USING (true); 