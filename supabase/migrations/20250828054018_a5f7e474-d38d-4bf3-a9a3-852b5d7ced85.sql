-- Update team members with positions
UPDATE team_members SET 
  position = CASE 
    WHEN name = 'Carlos Martínez' THEN 'Managing Director'
    WHEN name = 'Ana Rodriguez' THEN 'Senior M&A Advisor'
    WHEN name = 'Miguel Santos' THEN 'Financial Analyst'
    WHEN name = 'David López' THEN 'Investment Director'
    WHEN name = 'Roberto García' THEN 'Corporate Finance Specialist'
    WHEN name = 'Antonio Navarro' THEN 'Strategic Advisor'
  END
WHERE position IS NULL;