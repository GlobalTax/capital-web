-- Fix the search vector trigger to use 'excerpt' instead of 'summary'
CREATE OR REPLACE FUNCTION update_news_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('spanish', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('spanish', COALESCE(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('spanish', COALESCE(NEW.content, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;