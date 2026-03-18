
-- Vincular listas huérfanas a su lista madre por coincidencia de CIFs
WITH best_match AS (
  SELECT DISTINCT ON (orphan.id)
    orphan.id as orphan_id,
    madre.id as madre_id,
    COUNT(*) as shared_cifs
  FROM outbound_lists orphan
  JOIN outbound_list_companies oc ON oc.list_id = orphan.id AND oc.cif IS NOT NULL AND oc.cif != ''
  JOIN outbound_list_companies mc ON mc.cif = oc.cif
  JOIN outbound_lists madre ON madre.id = mc.list_id AND madre.tipo = 'madre'
  WHERE orphan.lista_madre_id IS NULL
    AND orphan.id != madre.id
    AND (orphan.tipo IS NULL OR orphan.tipo != 'madre')
  GROUP BY orphan.id, madre.id
  HAVING COUNT(*) >= 2
  ORDER BY orphan.id, COUNT(*) DESC
)
UPDATE outbound_lists ol
SET lista_madre_id = bm.madre_id
FROM best_match bm
WHERE ol.id = bm.orphan_id;
