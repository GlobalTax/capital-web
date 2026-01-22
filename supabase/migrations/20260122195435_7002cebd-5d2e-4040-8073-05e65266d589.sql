-- Add teaser columns to buy_side_mandates table
-- Each mandate can have 0 or 1 teaser per language (ES/EN)

ALTER TABLE buy_side_mandates
ADD COLUMN IF NOT EXISTS teaser_es_url TEXT,
ADD COLUMN IF NOT EXISTS teaser_es_filename TEXT,
ADD COLUMN IF NOT EXISTS teaser_es_uploaded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS teaser_en_url TEXT,
ADD COLUMN IF NOT EXISTS teaser_en_filename TEXT,
ADD COLUMN IF NOT EXISTS teaser_en_uploaded_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN buy_side_mandates.teaser_es_url IS 'Public URL of the Spanish teaser PDF';
COMMENT ON COLUMN buy_side_mandates.teaser_en_url IS 'Public URL of the English teaser PDF';