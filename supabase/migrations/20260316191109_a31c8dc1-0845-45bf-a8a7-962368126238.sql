
-- Index to optimize the sync_sublist_to_madre trigger lookups
CREATE INDEX IF NOT EXISTS idx_outbound_list_companies_list_cif
ON outbound_list_companies (list_id, (lower(trim(cif))));
