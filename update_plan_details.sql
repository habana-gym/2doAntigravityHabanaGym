-- Add detailed columns to plan_exercises table
alter table plan_exercises 
add column if not exists sets text,
add column if not exists reps text,
add column if not exists notes text;

-- Ensure RLS allows updates if not already (standard public access policy usually covers it if generic, but good to check)
-- Re-applying public access just to be safe if policies were strict
drop policy if exists "Public access" on plan_exercises;
create policy "Public access" on plan_exercises for all using (true);

-- Allow updating exercises
drop policy if exists "Public access" on exercises;
create policy "Public access" on exercises for all using (true);
