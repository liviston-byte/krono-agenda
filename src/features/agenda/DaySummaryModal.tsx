import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { startOfDay, endOfDay } from 'date-fns';
import { useAppStore } from '@/app/store';
import { Button, Modal } from '@/design-system';
import { movePendingToTomorrow } from '@/features/agenda/agendaRepository';

export function DaySummaryModal() {
  const { t } = useTranslation();
  const isSummaryModalOpen = useAppStore((s) => s.isSummaryModalOpen);
  const setSummaryModalOpen = useAppStore((s) => s.setSummaryModalOpen);
  const selectedDate = useAppStore((s) => s.selectedDate);
  const items = useAppStore((s) => s.items);

  const [movedSuccess, setMovedSuccess] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  const { completedItems, pendingItems } = useMemo(() => {
    const dayStart = startOfDay(selectedDate).getTime();
    const dayEnd = endOfDay(selectedDate).getTime();

    const todayItems = items.filter(
      (item) => item.startAt >= dayStart && item.startAt <= dayEnd,
    );

    return {
      completedItems: todayItems.filter((i) => i.status === 'completed'),
      pendingItems: todayItems.filter((i) => i.status === 'pending'),
    };
  }, [items, selectedDate]);

  const handleClose = () => {
    setSummaryModalOpen(false);
    setMovedSuccess(false);
  };

  const handleMoveToTomorrow = async () => {
    if (pendingItems.length === 0) return;
    setIsMoving(true);
    try {
      await movePendingToTomorrow(pendingItems);
      setMovedSuccess(true);
    } catch (err) {
      console.error('Erro ao mover tarefas para amanhã:', err);
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <Modal open={isSummaryModalOpen} onClose={handleClose} title={t('daySummary.modalTitle')}>
      <div className="space-y-5">
        {/* Quote Card */}
        <div className="p-4 rounded-2xl bg-[var(--accent-soft)] border border-[var(--accent-primary)]/20 space-y-2 text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Reflexão da Noite</span>
          </div>
          <p className="font-serif-editorial italic text-lg sm:text-xl text-[var(--text-primary)] leading-relaxed px-2">
            {t('daySummary.quote')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Concluídas</span>
            </div>
            <p className="font-mono-time text-2xl font-bold text-[var(--text-primary)]">
              {completedItems.length}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
              <span>Não Concluídas</span>
            </div>
            <p className="font-mono-time text-2xl font-bold text-[var(--text-primary)]">
              {pendingItems.length}
            </p>
          </div>
        </div>

        {/* Actions for Pending Tasks */}
        {pendingItems.length > 0 && !movedSuccess ? (
          <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
            <div className="text-xs text-[var(--text-secondary)]">
              Você ainda tem <strong className="text-[var(--text-primary)]">{pendingItems.length}</strong> tarefa(s) pendente(s) hoje. Deseja transferi-las para o dia de amanhã?
            </div>
            <Button
              type="button"
              variant="secondary"
              className="w-full justify-center"
              onClick={handleMoveToTomorrow}
              disabled={isMoving}
            >
              <ArrowRight className="w-4 h-4" />
              <span>{isMoving ? 'Transferindo...' : t('daySummary.movePendingBtn')}</span>
            </Button>
          </div>
        ) : pendingItems.length === 0 ? (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 text-center font-medium">
            {t('daySummary.allDoneCongrats')}
          </div>
        ) : null}

        {movedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 text-center font-medium">
            {t('daySummary.moveSuccess')}
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <Button type="button" variant="primary" onClick={handleClose}>
            {t('daySummary.close')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
