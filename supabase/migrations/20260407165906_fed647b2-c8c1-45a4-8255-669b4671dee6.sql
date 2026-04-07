UPDATE rod_documents SET title = regexp_replace(title, '🇪🇸|🇬🇧', '', 'g') WHERE title ~ '🇪🇸|🇬🇧';
UPDATE rod_documents SET title = regexp_replace(title, '\s+', ' ', 'g');
UPDATE rod_documents SET title = trim(title);