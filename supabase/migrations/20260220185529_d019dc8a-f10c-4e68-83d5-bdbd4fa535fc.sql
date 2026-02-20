
-- Añadir columnas de equipo a mandatos
ALTER TABLE mandatos
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS team_member_ids UUID[] DEFAULT '{}';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_mandatos_owner_id ON mandatos(owner_id);
CREATE INDEX IF NOT EXISTS idx_mandatos_team_member_ids ON mandatos USING GIN(team_member_ids);

-- Vista de workload por usuario
CREATE OR REPLACE VIEW mandato_workload AS
SELECT
  au.user_id,
  au.full_name,
  au.email,
  au.role,
  COUNT(DISTINCT m_owner.id) FILTER (WHERE m_owner.id IS NOT NULL) AS mandatos_como_owner,
  COUNT(DISTINCT m_member.id) FILTER (WHERE m_member.id IS NOT NULL) AS mandatos_como_miembro,
  (COUNT(DISTINCT m_owner.id) FILTER (WHERE m_owner.id IS NOT NULL) +
  COUNT(DISTINCT m_member.id) FILTER (WHERE m_member.id IS NOT NULL)) AS total_mandatos
FROM admin_users au
LEFT JOIN mandatos m_owner ON au.user_id = m_owner.owner_id
LEFT JOIN mandatos m_member ON au.user_id = ANY(m_member.team_member_ids)
WHERE au.is_active = true
GROUP BY au.user_id, au.full_name, au.email, au.role
ORDER BY total_mandatos DESC;
