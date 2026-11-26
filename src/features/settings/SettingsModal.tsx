import { useState } from 'react';
import { Bell, Globe, Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/app/store';
import { Badge, Button, Modal } from '@/design-system';
import type { SupportedLocale, ThemeMode } from '@/shared/types/agenda';
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendBrowserNotification,
} from '@/features/reminders/notificationService';

const LOCALES: { code: SupportedLocale; label: string }[] = [
  { code: 'pt-BR', label: 'Português (BR)' },
  { code: 'en-US', label: 'English (US)' },
];

const THEMES: ThemeMode[] = ['system', 'light', 'dark'];

export function SettingsModal() {
  const { t, i18n } = useTranslation();
  const isSettingsOpen = useAppStore((s) => s.isSettingsOpen);
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  const [perm, setPerm] = useState(getNotificationPermission);

  const handleRequestPerm = async () => {
    const next = await requestNotificationPermission();
    setPerm(next);
  };

  const handleTestNotification = async () => {
    await sendBrowserNotification(t('app.name'), t('settings.testNotificationBody'));
  };

  return (
    <Modal
      open={isSettingsOpen}
      onClose={() => setSettingsOpen(false)}
      title={t('settings.title')}
    >
      <div className="space-y-6">
        {/* Idioma */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
            <Globe className="w-3.5 h-3.5" />
            <span>{t('settings.language')}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {LOCALES.map((loc) => {
              const active = i18n.language === loc.code;
              return (
                <button
                  key={loc.code}
                  type="button"
                  onClick={() => i18n.changeLanguage(loc.code)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-colors cursor-pointer ${
                    active
                      ? 'bg-[var(--accent-soft)] border-[var(--accent-primary)] text-[var(--accent-primary)]'
                      : 'bg-[var(--bg-canvas)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                  }`}
                >
                  {loc.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tema */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
            <Palette className="w-3.5 h-3.5" />
            <span>{t('settings.theme')}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map((mode) => {
              const active = theme === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTheme(mode)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-colors cursor-pointer ${
                    active
                      ? 'bg-[var(--accent-soft)] border-[var(--accent-primary)] text-[var(--accent-primary)]'
                      : 'bg-[var(--bg-canvas)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                  }`}
                >
                  {t(`settings.themes.${mode}`)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notificações */}
        <div className="space-y-3 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
              <Bell className="w-4 h-4 text-[var(--accent-primary)]" />
              <span>{t('settings.notificationsTitle')}</span>
            </div>
            <Badge
              tone={
                perm === 'granted' ? 'calm' : perm === 'denied' ? 'urgent' : 'soon'
              }
            >
              {perm === 'granted'
                ? t('settings.notificationsGranted')
                : perm === 'denied'
                  ? t('settings.notificationsDenied')
                  : t('settings.notificationsDefault')}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            {perm !== 'granted' && perm !== 'unsupported' && (
              <Button type="button" size="sm" onClick={handleRequestPerm}>
                {t('settings.enableNotifications')}
              </Button>
            )}
            {perm === 'granted' && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleTestNotification}
              >
                {t('settings.testNotification')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
