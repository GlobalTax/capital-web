
DO $$
DECLARE
  campaign RECORD;
  new_list_id UUID;
BEGIN
  FOR campaign IN 
    SELECT id, name FROM valuation_campaigns ORDER BY created_at ASC
  LOOP
    INSERT INTO outbound_lists (name, description, list_type, is_active, contact_count)
    VALUES (campaign.name, 'Importada desde campaña outbound', 'static', true, 0)
    RETURNING id INTO new_list_id;

    INSERT INTO outbound_list_companies (list_id, empresa, contacto, email, telefono, cif, web, provincia, facturacion, ebitda, anios_datos)
    SELECT new_list_id, vcc.client_company, vcc.client_name, vcc.client_email, vcc.client_phone,
           vcc.client_cif, vcc.client_website, vcc.client_provincia, vcc.revenue, vcc.ebitda, vcc.financial_year
    FROM valuation_campaign_companies vcc WHERE vcc.campaign_id = campaign.id;

    INSERT INTO outbound_list_campaigns (list_id, campaign_id, campaign_nombre, empresas_enviadas, notas)
    VALUES (new_list_id, campaign.id, campaign.name,
            (SELECT COUNT(*) FROM outbound_list_companies WHERE list_id = new_list_id),
            'Vinculación automática al importar desde campaña');
  END LOOP;
END $$;
