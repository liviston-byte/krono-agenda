import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, LogIn, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '@/shared/db/supabaseClient';
import { useAppStore } from '@/app/store';
import { Button, Input, Card } from '@/design-system';

export function AuthPage() {
  const { t } = useTranslation();
  const setUser = useAppStore((s) => s.setUser);
  const fetchItemsFromSupabase = useAppStore((s) => s.fetchItemsFromSupabase);

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-primary)] text-white flex items-center justify-center mx-auto shadow-md">
            <Calendar className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{t('app.name')}</h1>
          <p className="text-sm text-[var(--text-muted)]">{t('app.subtitle')}</p>
        </div>

        {/* Auth Card */}
        <Card className="p-6 sm:p-8 space-y-5 shadow-[var(--shadow-md)]">
          {!isSupabaseConfigured && (
            <div role="alert" className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-[var(--text-secondary)]">
              {t('auth.configurationRequired')}
            </div>
          )}
          {/* Toggle Mode */}
          <div className="flex p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>{t('auth.loginTab')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{t('auth.signupTab')}</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="auth-email"
              type="email"
              label={t('auth.emailLabel')}
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={!isSupabaseConfigured}
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
              disabled={!isSupabaseConfigured}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full justify-center py-2.5 text-sm"
                disabled={isLoading || !isSupabaseConfigured}
              >
                {isLoading
                  ? '...'
                  : mode === 'login'
                    ? t('auth.loginBtn')
                    : t('auth.signupBtn')}
              </Button>
            </div>
          </form>
        </Card>

        {/* Footer Note */}
        <p className="text-center text-xs text-[var(--text-muted)] font-serif-editorial italic">
          “No mundo haveis de ter aflições. Coragem! Eu venci o mundo.”
        </p>
      </div>
    </div>
  );
}
