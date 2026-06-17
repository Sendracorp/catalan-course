-- handle_new_user() is a trigger function only; it should never be callable as
-- a PostgREST RPC (/rest/v1/rpc/handle_new_user). Triggers run as the table
-- owner regardless of EXECUTE grants, so revoking EXECUTE keeps signup working
-- while removing the public RPC surface. Clears the Supabase security advisor
-- "Public/Signed-In Users Can Execute SECURITY DEFINER Function" warnings.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
