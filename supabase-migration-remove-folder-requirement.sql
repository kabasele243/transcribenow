-- Migration to remove folder requirement from files
-- Make folder_id nullable in files table

-- First, drop the existing foreign key constraint
ALTER TABLE "public"."files" DROP CONSTRAINT IF EXISTS "files_folder_id_fkey";

-- Modify the folder_id column to be nullable
ALTER TABLE "public"."files" ALTER COLUMN folder_id DROP NOT NULL;

-- Re-add the foreign key constraint with ON DELETE SET NULL
ALTER TABLE "public"."files" ADD CONSTRAINT "files_folder_id_fkey" 
  FOREIGN KEY (folder_id) REFERENCES "public"."folders" (id) ON DELETE SET NULL;

-- Update the index to handle nullable values
DROP INDEX IF EXISTS "files_folder_id_idx";
CREATE INDEX "files_folder_id_idx" ON "public"."files" (folder_id) WHERE folder_id IS NOT NULL; 