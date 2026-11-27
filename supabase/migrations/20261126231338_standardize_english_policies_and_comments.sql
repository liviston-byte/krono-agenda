-- Drop Portuguese policy names
drop policy if exists "Usuários podem gerenciar seus próprios itens da agenda" on public.agenda_items;
drop policy if exists "Usuários podem gerenciar suas notas de voz" on public.voice_notes;

-- Create standardized English RLS policies
create policy "Users can manage their own agenda items"
    on public.agenda_items
    for all
    using (auth.uid() = user_id or auth.uid() is null);

create policy "Users can manage their own voice notes"
    on public.voice_notes
    for all
    using (auth.uid() = user_id or auth.uid() is null);

-- Table documentation (visible in Supabase Table Editor & Schema Visualizer)
comment on table public.agenda_items is 'Scheduled events, reminders, past-self capsules, and smart snooze state';
comment on column public.agenda_items.title is 'Title of the event or reminder';
comment on column public.agenda_items.description is 'Detailed description or additional notes';
comment on column public.agenda_items.start_at is 'Start timestamp in epoch milliseconds';
comment on column public.agenda_items.end_at is 'End timestamp in epoch milliseconds';
comment on column public.agenda_items.reminder_minutes_before is 'Lead time in minutes before start_at for notification trigger';
comment on column public.agenda_items.remind_at is 'Target notification timestamp in epoch milliseconds';
comment on column public.agenda_items.status is 'Task lifecycle status (pending or completed)';
comment on column public.agenda_items.category is 'Visual and semantic classification (focus, personal, health, quick)';
comment on column public.agenda_items.why_it_matters is 'Past-Self Capsule: intentional motivation note';
comment on column public.agenda_items.voice_note_id is 'Reference to attached voice note in voice_notes table';
comment on column public.agenda_items.snooze_count is 'Total times snoozed';
comment on column public.agenda_items.last_snooze_reason is 'Reason declared on last friction snooze (no_time, low_energy, blocked)';
comment on column public.agenda_items.snooze_history is 'JSON array recording full snooze audit trail';
comment on column public.agenda_items.notified_at is 'Timestamp when notification modal was last fired';

comment on table public.voice_notes is 'Metadata and audio storage links for Past-Self Capsule voice recordings';
comment on column public.voice_notes.storage_path is 'Storage bucket file path for audio blob';
comment on column public.voice_notes.mime_type is 'MIME type of recorded audio (e.g. audio/webm)';
comment on column public.voice_notes.duration_sec is 'Audio length in seconds';
