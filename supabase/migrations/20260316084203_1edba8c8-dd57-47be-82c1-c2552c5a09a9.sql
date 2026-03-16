
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
    -- Extract just the file/folder name from the full path
    CASE 
      WHEN folder_path = '' THEN 
        split_part(o.name, '/', 1)
      ELSE 
        split_part(replace(o.name, folder_path || '/', ''), '/', 1)
    END AS name,
    -- id is NULL for folders (grouped), actual id for files
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
      ELSE MIN(o.metadata)
    END) AS metadata
  FROM storage.objects o
  WHERE o.bucket_id = 'admin-photos'
    AND (
      CASE 
        WHEN folder_path = '' THEN TRUE
        ELSE o.name LIKE folder_path || '/%'
      END
    )
    -- Exclude items in deeper subdirectories (only direct children)
    AND (
      CASE 
        WHEN folder_path = '' THEN 
          -- Root: only items without '/' or first segment
          TRUE
        ELSE 
          TRUE
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
    -- Folders first, then files
    (CASE WHEN (
      CASE 
        WHEN folder_path = '' THEN position('/' in o.name) > 0
        ELSE position('/' in replace(o.name, folder_path || '/', '')) > 0
      END
    ) THEN 0 ELSE 1 END),
    name ASC;
END;
$$;
