import { useEffect, useMemo } from 'react';
import {
  addDays,
  endOfDay,
  endOfWeek,
  startOfDay,
  startOfWeek,
  subDays,
} from 'date-fns';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { db } from '@/shared/db/database';
import { useAppStore } from '@/app/store';
import { Button, Card } from '@/design-system';
import { formatDayHeading } from '@/shared/utils/dateFormat';
import { useReminderEngine } from '@/features/reminders/useReminderEngine';
import { AgendaCard } from '@/features/agenda/AgendaCard';
import { AgendaFormModal } from '@/features/agenda/AgendaFormModal';
import { ActiveReminderModal } from '@/features/reminders/ActiveReminderModal';
import { SettingsModal } from '@/features/settings/SettingsModal';

export function App() {
  const { t, i18n } = useTranslation();
  const selectedDate = useAppStore((s) => s.selectedDate);
  const viewMode = useAppStore((s) => s.viewMode);
  const theme = useAppStore((s) => s.theme);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const openCreateForm = useAppStore((s) => s.openCreateForm);
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);

  useReminderEngine();

  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
    root.classList.toggle('dark', isDark);
  }, [theme]);

  const { rangeStart, rangeEnd } = useMemo(() => {
    if (viewMode === 'day') {
      return {
        rangeStart: startOfDay(selectedDate).getTime(),
        rangeEnd: endOfDay(selectedDate).getTime(),
      };
    }
    return {
      rangeStart: startOfWeek(selectedDate, { weekStartsOn: 1 }).getTime(),
      rangeEnd: endOfWeek(selectedDate, { weekStartsOn: 1 }).getTime(),
    };
  }, [selectedDate, viewMode]);

  const items =
    useLiveQuery(
      () =>
        db.items
          .where('startAt')
          .between(rangeStart, rangeEnd, true, true)
          .sortBy('startAt'),
      [rangeStart, rangeEnd],
    ) ?? [];

  const handleStepDate = (direction: -1 | 1) => {
    const delta = viewMode === 'day' ? 1 : 7;
    const next =
      direction === 1 ? addDays(selectedDate, delta) : subDays(selectedDate, delta);
    setSelectedDate(next.getTime());
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/85 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] text-white flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h1 className="text-base font-bold tracking-tight">
              {t('app.name')}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={t('nav.settings')}
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button type="button" size="sm" onClick={openCreateForm}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('nav.newEvent')}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleStepDate(-1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setSelectedDate(Date.now())}
            >
              {t('nav.today')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleStepDate(1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <h2 className="font-serif-editorial text-2xl font-medium tracking-tight ml-2 capitalize">
              {formatDayHeading(selectedDate, i18n.language)}
            </h2>
          </div>

          <div className="inline-flex p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
            {(['day', 'week'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  viewMode === mode
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {t(`nav.${mode}`)}
              </button>
            ))}
          </div>
        </div>

        {items.length === 0 ? (
          <Card className="p-10 text-center space-y-3">
            <p className="text-base font-semibold text-[var(--text-primary)]">
              {t('agenda.emptyTitle')}
            </p>
            <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
              {t('agenda.emptySubtitle')}
            </p>
            <div className="pt-2">
              <Button type="button" onClick={openCreateForm}>
                <Plus className="w-4 h-4" />
                {t('nav.newEvent')}
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="px-4 sm:px-6 divide-y-0">
            {items.map((item) => (
              <AgendaCard key={item.id} item={item} />
            ))}
          </Card>
        )}
      </main>

      <AgendaFormModal />
      <ActiveReminderModal />
      <SettingsModal />
    </div>
  );
}
