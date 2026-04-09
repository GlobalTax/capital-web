-- Remove samuel from visible CC, move jan and marcc to visible CC
UPDATE email_recipients_config SET is_default_copy = false WHERE email = 'samuel@capittal.es';
UPDATE email_recipients_config SET is_bcc = false WHERE email IN ('jan@capittal.es', 'marcc@capittal.es');