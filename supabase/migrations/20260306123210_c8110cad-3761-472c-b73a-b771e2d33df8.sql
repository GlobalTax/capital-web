-- Reset all campaign_emails that were falsely marked as 'sent' back to 'pending'
-- These were marked by the old broken system without actual email delivery
UPDATE campaign_emails 
SET status = 'pending', 
    sent_at = NULL, 
    error_message = NULL,
    updated_at = now()
WHERE status = 'sent';