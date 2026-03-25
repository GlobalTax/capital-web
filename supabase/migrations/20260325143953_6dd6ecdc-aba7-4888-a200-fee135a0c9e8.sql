UPDATE company_valuations 
SET is_deleted = true, email = 'deleted-duplicate@invalid.local'
WHERE id = 'babb009a-9299-4398-bd24-9746813bcda0';