-- Add photo_url column to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Update View if necessary (though usually select * handles it)
-- Comentario: Si usas Supabase client, esto debería reflejarse automáticamente.
