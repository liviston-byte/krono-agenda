-- Add audio_base64 column to store voice recording data directly in Supabase
alter table public.voice_notes add column if not exists audio_base64 text;
comment on column public.voice_notes.audio_base64 is 'Base64 data URL for voice note audio';
