-- Prvo uklanjamo postojeće ograničenje ako postoji
ALTER TABLE porudzbine DROP CONSTRAINT IF EXISTS porudzbine_status_porudzbine_check;

-- Dodajemo novo ograničenje sa ispravnim vrednostima
ALTER TABLE porudzbine ADD CONSTRAINT porudzbine_status_porudzbine_check 
  CHECK (status_porudzbine IN ('nova', 'u_obradi', 'poslata', 'isporucena', 'otkazana')); 