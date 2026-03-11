-- Rename the newly created tables to avoid conflict with existing contact_lists
ALTER TABLE contact_list_campaigns DROP CONSTRAINT IF EXISTS contact_list_campaigns_list_id_fkey;
ALTER TABLE contact_list_companies DROP CONSTRAINT IF EXISTS contact_list_companies_list_id_fkey;

-- Drop triggers
DROP TRIGGER IF EXISTS trg_update_list_total ON contact_list_companies;

-- Rename tables
ALTER TABLE contact_lists RENAME TO outbound_lists;
ALTER TABLE contact_list_companies RENAME TO outbound_list_companies;
ALTER TABLE contact_list_campaigns RENAME TO outbound_list_campaigns;

-- Re-add foreign keys
ALTER TABLE outbound_list_companies ADD CONSTRAINT outbound_list_companies_list_id_fkey FOREIGN KEY (list_id) REFERENCES outbound_lists(id) ON DELETE CASCADE;
ALTER TABLE outbound_list_campaigns ADD CONSTRAINT outbound_list_campaigns_list_id_fkey FOREIGN KEY (list_id) REFERENCES outbound_lists(id) ON DELETE CASCADE;
ALTER TABLE outbound_list_campaigns ADD CONSTRAINT outbound_list_campaigns_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES valuation_campaigns(id) ON DELETE SET NULL;

-- Re-create RLS policies with new table names
DROP POLICY IF EXISTS "Admins can manage contact_lists" ON outbound_lists;
DROP POLICY IF EXISTS "Admins can manage contact_list_companies" ON outbound_list_companies;
DROP POLICY IF EXISTS "Admins can manage contact_list_campaigns" ON outbound_list_campaigns;

CREATE POLICY "Admins can manage outbound_lists" ON outbound_lists FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::admin_role))
WITH CHECK (has_role(auth.uid(), 'admin'::admin_role));

CREATE POLICY "Admins can manage outbound_list_companies" ON outbound_list_companies FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::admin_role))
WITH CHECK (has_role(auth.uid(), 'admin'::admin_role));

CREATE POLICY "Admins can manage outbound_list_campaigns" ON outbound_list_campaigns FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::admin_role))
WITH CHECK (has_role(auth.uid(), 'admin'::admin_role));

-- Re-create trigger
CREATE OR REPLACE FUNCTION update_outbound_list_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE outbound_lists
  SET total_empresas = (
    SELECT COUNT(*) FROM outbound_list_companies WHERE list_id = COALESCE(NEW.list_id, OLD.list_id)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.list_id, OLD.list_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_outbound_list_total
AFTER INSERT OR DELETE ON outbound_list_companies
FOR EACH ROW EXECUTE FUNCTION update_outbound_list_total();