CREATE OR REPLACE FUNCTION public.list_admin_photos(folder_path TEXT DEFAULT '')
RETURNS TABLE (name TEXT, id UUID, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ, metadata JSONB)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, storage
AS $$
BEGIN
  RETURN QUERY
  WITH items AS (
    SELECT
      CASE WHEN folder_path = '' THEN split_part(o.name, '/', 1)
           ELSE split_part(replace(o.name, folder_path || '/', ''), '/', 1)
      END AS child_name,
      CASE WHEN folder_path = '' THEN position('/' in o.name) > 0
           ELSE position('/' in replace(o.name, folder_path || '/', '')) > 0
      END AS is_folder,
      o.id AS file_id,
      o.created_at AS file_created,
      o.updated_at AS file_updated,
      o.metadata AS file_metadata
    FROM storage.objects o
    WHERE o.bucket_id = 'admin-photos'
      AND (folder_path = '' OR o.name LIKE folder_path || '/%')
  )
  SELECT
    i.child_name,
    CASE WHEN i.is_folder THEN NULL::UUID ELSE i.file_id END,
    MIN(i.file_created),
    MAX(i.file_updated),
    CASE WHEN i.is_folder THEN NULL::JSONB ELSE (array_agg(i.file_metadata))[1] END
  FROM items i
  GROUP BY i.child_name, i.is_folder, CASE WHEN i.is_folder THEN NULL::UUID ELSE i.file_id END
  ORDER BY i.is_folder DESC, i.child_name ASC;
END;
$$;