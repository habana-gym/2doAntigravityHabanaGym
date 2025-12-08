-- Add new columns to plan_exercises table
alter table plan_exercises 
add column if not exists weight text,
add column if not exists rest_time text;

-- Verify policies (re-run to ensure public access is maintained)
drop policy if exists "Public access" on plan_exercises;
create policy "Public access" on plan_exercises for all using (true);
