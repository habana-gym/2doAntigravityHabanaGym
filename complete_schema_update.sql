-- Comprehensive update for plan_exercises table
-- Adds all necessary columns for detailed workout configuration if they don't exist

alter table plan_exercises 
add column if not exists sets text,
add column if not exists reps text,
add column if not exists weight text,
add column if not exists rest_time text,
add column if not exists notes text;

-- Verify policies to ensure public access is maintained for development
drop policy if exists "Public access" on plan_exercises;
create policy "Public access" on plan_exercises for all using (true);

drop policy if exists "Public access" on exercises;
create policy "Public access" on exercises for all using (true);
