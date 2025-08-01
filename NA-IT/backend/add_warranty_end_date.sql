-- Add warranty_end_date column to items table
ALTER TABLE items ADD COLUMN warranty_end_date DATE AFTER date_of_purchase; 