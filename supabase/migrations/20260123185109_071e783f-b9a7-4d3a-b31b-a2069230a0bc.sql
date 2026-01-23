-- Limpiar CIF vacíos existentes para evitar conflictos de constraint UNIQUE
UPDATE empresas SET cif = NULL WHERE cif = '';