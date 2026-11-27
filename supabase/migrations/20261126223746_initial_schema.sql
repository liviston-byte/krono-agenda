-- Tabela de itens da agenda / lembretes
create table if not exists public.agenda_items (
    id text primary key,
    user_id uuid references auth.users(id) on delete cascade,
    title text not null,
    description text,
    start_at bigint not null,
    end_at bigint not null,
    reminder_minutes_before integer not null default 15,
    remind_at bigint not null,
    status text not null check (status in ('pending', 'completed')) default 'pending',
    category text not null check (category in ('focus', 'personal', 'health', 'quick')) default 'focus',
    why_it_matters text,
    voice_note_id text,
    snooze_count integer not null default 0,
    last_snooze_reason text check (last_snooze_reason in ('no_time', 'low_energy', 'blocked')),
    snooze_history jsonb not null default '[]'::jsonb,
    notified_at bigint,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Tabela de notas de voz (Cápsula do Eu do Passado)
create table if not exists public.voice_notes (
    id text primary key,
    user_id uuid references auth.users(id) on delete cascade,
    storage_path text,
    mime_type text not null default 'audio/webm',
    duration_sec numeric not null default 0,
    created_at timestamptz not null default now()
);

-- Índices para consultas de alta performance
create index if not exists idx_agenda_items_start_at on public.agenda_items (start_at);
create index if not exists idx_agenda_items_status on public.agenda_items (status);
create index if not exists idx_agenda_items_user_id on public.agenda_items (user_id);

-- Ativar Row Level Security (RLS)
alter table public.agenda_items enable row level security;
alter table public.voice_notes enable row level security;

-- Políticas de RLS padrão (acesso aberto caso anônimo para dev ou restrito ao próprio usuário se autenticado)
create policy "Usuários podem gerenciar seus próprios itens da agenda"
    on public.agenda_items
    for all
    using (auth.uid() = user_id or auth.uid() is null);

create policy "Usuários podem gerenciar suas notas de voz"
    on public.voice_notes
    for all
    using (auth.uid() = user_id or auth.uid() is null);
