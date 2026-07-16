-- 008: Pin the trigger function's search_path (Supabase security-linter fix
-- 0011_function_search_path_mutable). The function only touches NEW, so an
-- empty search_path is safe.

alter function public.set_updated_at() set search_path = '';
