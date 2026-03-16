CREATE OR REPLACE FUNCTION public.list_admin_photos(folder_path TEXT DEFAULT '')
RETURNS TABLE (
  name TEXT,
  id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN folder_path = '' THEN split_part(o.name, '/', 1)
      ELSE split_part(replace(o.name, folder_path || '/', ''), '/', 1)
    END AS name,
    CASE 
      WHEN (
        CASE 
          WHEN folder_path = '' THEN position('/' in o.name) > 0
          ELSE position('/' in replace(o.name, folder_path || '/', '')) > 0
        END
      ) THEN NULL::UUID
      ELSE o.id
    END AS id,
    MIN(o.created_at) AS created_at,
    MAX(o.updated_at) AS updated_at,
    (CASE 
      WHEN (
        CASE 
          WHEN folder_path = '' THEN position('/' in o.name) > 0
          ELSE position('/' in replace(o.name, folder_path || '/', '')) > 0
        END
      ) THEN NULL::JSONB
      ELSE (array_agg(o.metadata))[1]
    END) AS metadata
  FROM storage.objects o
  WHERE o.bucket_id = 'admin-photos'
    AND (
      CASE 
        WHEN folder_path = '' THEN TRUE
        ELSE o.name LIKE folder_path || '/%'
      END
    )
  GROUP BY 
    CASE 
      WHEN folder_path = '' THEN split_part(o.name, '/', 1)
      ELSE split_part(replace(o.name, folder_path || '/', ''), '/', 1)
    END,
    CASE 
      WHEN (
        CASE 
          WHEN folder_path = '' THEN position('/' in o.name) > 0
          ELSE position('/' in replace(o.name, folder_path || '/', '')) > 0
        END
      ) THEN NULL::UUID
      ELSE o.id
    END
  ORDER BY 
    (CASE WHEN (
      CASE 
        WHEN folder_path = '' THEN position('/' in o.name) > 0
        ELSE position('/' in replace(o.name, folder_path || '/', '')) > 0
      END
    ) THEN 0 ELSE 1 END),
    name ASC;
END;
$$;