-- Tier 1 advisor fixes: RLS init-plan, unindexed FKs, storage bucket listing.

-- 1) RLS init-plan: wrap auth.uid() in a scalar subquery so Postgres evaluates
--    it once per statement instead of once per row. ALTER POLICY keeps the
--    existing command + roles untouched and only rewrites the expression.
alter policy "read own profile"        on public.profiles          using ((select auth.uid()) = id);
alter policy "read own purchases"      on public.purchases         using ((select auth.uid()) = user_id);
alter policy "read own grants"         on public.access_grants     using ((select auth.uid()) = user_id);
alter policy "own checklist"           on public.checklist_state   using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy "own exercise progress"   on public.exercise_progress using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy "own mock attempts"       on public.mock_attempts     using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy "own resets"              on public.progress_resets   using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- 2) Covering indexes for foreign keys (admin-facing lookups / FK cascade checks).
create index if not exists access_grants_granted_by_idx   on public.access_grants (granted_by);
create index if not exists audio_overrides_recorded_by_idx on public.audio_overrides (recorded_by);

-- 3) Storage: the course-audio bucket is public, so object URLs are served via
--    the /object/public/ endpoint without consulting RLS. The broad SELECT
--    policy only enables listing/enumeration of every file, which the app never
--    uses (it builds direct public URLs). Drop it to stop enumeration.
drop policy if exists "public read course-audio" on storage.objects;
