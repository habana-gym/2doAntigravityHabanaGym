-- Create a function to get easy weekly stats from Supabase
-- This handles the date grouping database-side for efficiency

drop function if exists get_weekly_attendance();

create or replace function get_weekly_attendance()
returns table (
  day_name text,
  day_date date,
  count bigint
) as $$
begin
  return query
  select 
    to_char(series, 'Dy') as day_name,
    series::date as day_date,
    count(a.id) as count
  from generate_series(
    current_date - interval '6 days', 
    current_date, 
    '1 day'
  ) as series
  left join attendance a on a.timestamp::date = series::date
  group by series
  order by series;
end;
$$ language plpgsql;
