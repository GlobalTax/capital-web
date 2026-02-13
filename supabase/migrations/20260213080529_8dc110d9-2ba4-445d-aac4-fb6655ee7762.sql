ALTER TABLE valuation_campaigns 
ADD COLUMN financial_years INTEGER[] DEFAULT ARRAY[2025, 2024, 2023];