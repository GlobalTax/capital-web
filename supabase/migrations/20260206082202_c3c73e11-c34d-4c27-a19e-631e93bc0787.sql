ALTER TABLE cr_portfolio
ADD CONSTRAINT cr_portfolio_sector_pe_fkey
FOREIGN KEY (sector_pe) REFERENCES pe_sector_taxonomy(id)
ON DELETE SET NULL;