import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { LogIn, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/shared/db/supabaseClient';
import { useAppStore } from '@/app/store';
import { Button, Input, Modal } from '@/design-system';

export function AuthModal() {
  const { t } = useTranslation();
  const isAuthModalOpen = useAppStore((s) => s.isAuthModalOpen);
  const setAuthModalOpen = useAppStore((s) => s.setAuthModalOpen);
  const setUser = useAppStore((s) => s.setUser);
  const fetchItemsFromSupabase = useAppStore((s) => s.fetchItemsFromSupabase);

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setAuthModalOpen(false);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
          return;
        }

        if (data.user) {
          setUser(data.user);
          handleClose();
          void fetchItemsFromSupabase();
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
          return;
        }

        if (data.user) {
          if (data.session) {
            setUser(data.user);
            handleClose();
            void fetchItemsFromSupabase();
          } else {
            setSuccessMsg(t('auth.signupSuccess'));
            setMode('login');
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={isAuthModalOpen} onClose={handleClose} title={t('auth.title')}>
      <div className="space-y-4">
        {/* Toggle Mode */}
        <div className="flex p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              mode === 'login'
                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{t('auth.loginTab')}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              mode === 'signup'
                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{t('auth.signupTab')}</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            id="auth-email"
            type="email"
            label={t('auth.emailLabel')}
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            id="auth-password"
            type="password"
            label={t('auth.passwordLabel')}
            placeholder={t('auth.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={handleClose}>
              {t('form.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? '...' : mode === 'login' ? t('auth.loginBtn') : t('auth.signupBtn')}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
