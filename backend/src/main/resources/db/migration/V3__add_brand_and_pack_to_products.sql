-- Migration V3: Add brand and pack columns to products
ALTER TABLE products ADD COLUMN brand VARCHAR(100) NULL AFTER name;
ALTER TABLE products ADD COLUMN pack VARCHAR(50) NULL AFTER unit;
