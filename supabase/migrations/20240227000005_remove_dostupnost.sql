-- Proveravamo da li kolona dostupnost postoji i uklanjamo je
DO $$ 
BEGIN 
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'proizvodi' 
        AND column_name = 'dostupnost'
    ) THEN
        ALTER TABLE proizvodi DROP COLUMN dostupnost;
    END IF;
END $$; 