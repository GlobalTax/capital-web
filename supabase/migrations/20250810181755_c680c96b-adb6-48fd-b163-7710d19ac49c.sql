-- Habilitar funciones criptográficas necesarias para gen_random_bytes y gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;