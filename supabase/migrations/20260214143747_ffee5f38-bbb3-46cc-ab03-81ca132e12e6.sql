
-- Shift existing items down by 1 position (positions 1-5 become 2-6)
UPDATE public.sidebar_items
SET position = position + 1
WHERE section_id = 'b2c3f379-c3b6-4492-91d7-44649aeac3d9'
  AND position >= 1;

-- Insert Calendario Editorial at position 1
INSERT INTO public.sidebar_items (section_id, title, url, icon, badge, position, is_active)
VALUES (
  'b2c3f379-c3b6-4492-91d7-44649aeac3d9',
  'Calendario Editorial',
  '/admin/content-calendar',
  'Calendar',
  'NEW',
  1,
  true
);
