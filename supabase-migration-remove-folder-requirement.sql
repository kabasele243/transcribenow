-- Migration to require folder selection for all files
-- Make folder_id NOT NULL in files table

-- First, drop the existing foreign key constraint
ALTER TABLE "public"."files" DROP CONSTRAINT IF EXISTS "files_folder_id_fkey";

-- Modify the folder_id column to be NOT NULL
ALTER TABLE "public"."files" ALTER COLUMN folder_id SET NOT NULL;

-- Re-add the foreign key constraint
ALTER TABLE "public"."files" ADD CONSTRAINT "files_folder_id_fkey" 
  FOREIGN KEY (folder_id) REFERENCES "public"."folders" (id) ON DELETE CASCADE;

-- Update the index to handle NOT NULL values
DROP INDEX IF EXISTS "files_folder_id_idx";
CREATE INDEX "files_folder_id_idx" ON "public"."files" (folder_id); 