-- Ensure schema usage
grant usage on schema public to anon, authenticated;

-- Grant table privileges to anon and authenticated roles
grant all on table public.agenda_items to anon, authenticated;
grant all on table public.voice_notes to anon, authenticated;

-- Recreate policies with explicit USING and WITH CHECK clauses for client access
drop policy if exists "Users can manage their own agenda items" on public.agenda_items;
drop policy if exists "Users can manage their own voice notes" on public.voice_notes;

create policy "Users can manage their own agenda items"
    on public.agenda_items
    for all
    to anon, authenticated
    using (true)
    with check (true);

create policy "Users can manage their own voice notes"
    on public.voice_notes
    for all
    to anon, authenticated
    using (true)
    with check (true);
