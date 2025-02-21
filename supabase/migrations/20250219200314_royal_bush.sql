/*
  # Add new product flag

  1. Changes
    - Add `novi_proizvod` boolean column to `proizvodi` table with default value false
    - Update existing products to have novi_proizvod = false

  2. Notes
    - This column will be used to mark new products in the catalog
    - Default value ensures backward compatibility
*/

-- Add novi_proizvod column
ALTER TABLE proizvodi 
ADD COLUMN IF NOT EXISTS novi_proizvod boolean DEFAULT false;

-- Update existing products
UPDATE proizvodi SET novi_proizvod = false WHERE novi_proizvod IS NULL;