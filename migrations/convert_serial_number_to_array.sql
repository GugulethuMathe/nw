-- Convert serial_number column to serial_numbers JSON array
ALTER TABLE assets 
  ADD COLUMN serial_numbers JSON NOT NULL DEFAULT ('[]') AFTER model,
  MODIFY COLUMN serial_number VARCHAR(100) NULL;

-- Move existing serial numbers to the new column
UPDATE assets 
SET serial_numbers = JSON_ARRAY(serial_number) 
WHERE serial_number IS NOT NULL AND serial_number != '';

-- Drop the old column
ALTER TABLE assets 
  DROP COLUMN serial_number;
