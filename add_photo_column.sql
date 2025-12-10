-- Add photo column to clients table
alter table clients
add column if not exists photo text;
