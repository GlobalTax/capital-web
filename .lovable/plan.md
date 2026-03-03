

## Add "Mail" Phase to Outbound Campaign Flow

### Summary
Insert step 6 "Mail" between Procesamiento (5) and Resumen (now 7). Two-part UI: template editor with dynamic variables, and per-company mail list with edit/send capabilities.

### Database

**New table `campaign_emails`:**
```sql
CREATE TABLE campaign_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES valuation_campaigns(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES valuation_campaign_companies(id) ON DELETE CASCADE,
  subject TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  is_manually_edited BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','error')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_campaign_emails_campaign ON campaign_emails(campaign_id);
CREATE INDEX idx_campaign_emails_company ON campaign_emails(company_id);
```

**New columns on `valuation_campaigns`** for storing the template:
```sql
ALTER TABLE valuation_campaigns
  ADD COLUMN email_subject_template TEXT,
  ADD COLUMN email_body_template TEXT;
```

RLS: authenticated users can select/insert/update/delete on `campaign_emails`.

### Files to Create

**`src/hooks/useCampaignEmails.ts`**
- Query: fetch all campaign_emails for a campaign (joined with company name/email)
- Mutations: generateFromTemplate (bulk upsert), updateEmail (individual), sendEmail (individual), sendAllPending (batch)
- Template save: update campaign's email_subject_template and email_body_template

**`src/utils/campaignEmailTemplateEngine.ts`**
- `replaceVariables(template, company, campaign)`: replaces `{{first_name}}`, `{{company}}`, `{{sector}}`, `{{valoracion_min}}`, `{{valoracion_max}}`, `{{firmante_nombre}}`, etc. with real data
- `getAvailableVariables()`: returns list of variable objects with label and key

**`src/components/admin/campanas-valoracion/steps/MailStep.tsx`**
Main component with two tabs/sections:

**Section A - Template Editor:**
- Subject input with variable insertion support
- Rich text body editor (ReactQuill, already in project) with variable insertion toolbar
- Variable buttons bar: clicking inserts `{{variable}}` at cursor position
- Variables visually highlighted in editor (CSS for `{{...}}` patterns)
- "Guardar template" button → saves to campaign + generates/regenerates emails
- "Previsualizar" button → modal showing rendered email with first company's data
- Warning dialog when regenerating if manually edited emails exist

**Section B - Mail List:**
- Summary cards: total companies, generated, sent, pending, errors
- Table: #, Empresa, Contacto, Email, PDF Valoración, PDF Estudio, Estado, Acciones
- Actions per row: Edit mail (dialog), View PDFs, Send individual
- "Enviar todos los pendientes" button with confirmation dialog

**Edit Mail Dialog:**
- Left: subject + body editor (pre-filled with personalized content), Save + Restore template buttons
- Right: PDF attachments with view/download/reupload (reuses existing PDF viewer pattern)
- Footer: Send button + Close

### File to Modify

**`src/pages/admin/CampanaValoracionForm.tsx`**
- Import `MailStep`
- STEPS array: insert `{ id: 6, title: 'Mail', description: 'Plantilla y envío de emails' }`, renumber Resumen to 7
- `handleNext`: change limit from 6 to 7
- Step content: add `currentStep === 6` for MailStep, renumber 6→7 for CampaignSummaryStep
- Navigation button: change `currentStep < 6` to `currentStep < 7`

### Variable Replacement Logic
```typescript
const VARIABLES = {
  first_name: (c) => c.client_name?.split(' ')[0] || '',
  last_name: (c) => c.client_name?.split(' ').slice(1).join(' ') || '',
  company: (c) => c.client_company,
  cargo: (c) => c.client_role || '',
  sector: (_, camp) => camp.sector,
  valoracion_min: (c) => formatCurrencyEUR(c.valuation_low || 0),
  valoracion_max: (c) => formatCurrencyEUR(c.valuation_high || 0),
  firmante_nombre: (_, camp) => camp.advisor_name || '',
  firmante_cargo: (_, camp) => camp.advisor_role || '',
  firmante_email: (_, camp) => camp.advisor_email || '',
  firmante_telefono: (_, camp) => camp.advisor_phone || '',
};
```

### Email Sending
For now, sending updates status to 'sent' with timestamp in the DB. Actual email delivery integration (via edge function) can be wired later — the UI and data layer are fully functional independently.

### Non-breaking guarantees
- Existing steps untouched (only renumbered in STEPS array)
- Phase is optional: can advance to Resumen without generating or sending any emails
- No changes to ProcessSendStep, PresentationsStep, or any other step component

