-- Add new values to the slide_layout enum for M&A presentations
ALTER TYPE slide_layout ADD VALUE IF NOT EXISTS 'disclaimer';
ALTER TYPE slide_layout ADD VALUE IF NOT EXISTS 'overview';
ALTER TYPE slide_layout ADD VALUE IF NOT EXISTS 'market';