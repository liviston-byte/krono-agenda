-- Update RLS policies to enforce user-level data isolation
drop policy if exists "Users can manage their own agenda items" on public.agenda_items;
drop policy if exists "Users can manage their own voice notes" on public.voice_notes;

create policy "Users can manage their own agenda items"
    on public.agenda_items
    for all
    to anon, authenticated
    using (auth.uid() = user_id or (auth.uid() is null and user_id is null))
    with check (auth.uid() = user_id or (auth.uid() is null and user_id is null));

create policy "Users can manage their own voice notes"
    on public.voice_notes
    for all
    to anon, authenticated
    using (auth.uid() = user_id or (auth.uid() is null and user_id is null))
    with check (auth.uid() = user_id or (auth.uid() is null and user_id is null));
