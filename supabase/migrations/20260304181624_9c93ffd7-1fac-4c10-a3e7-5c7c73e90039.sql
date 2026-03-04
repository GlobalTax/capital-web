ALTER TABLE public.campaign_presentations 
  ADD CONSTRAINT campaign_presentations_campaign_file_unique 
  UNIQUE (campaign_id, file_name);