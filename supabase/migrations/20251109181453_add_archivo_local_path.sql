/*
  # Add archivo_local_path column to registros table

  1. Changes
    - Add `archivo_local_path` column to `registros` table to store local file paths for clips

  2. Security
    - No RLS changes needed
*/

ALTER TABLE registros ADD COLUMN IF NOT EXISTS archivo_local_path TEXT;
