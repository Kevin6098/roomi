import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

type Variant = 'success' | 'error';

interface CenteredToastProps {
  message: string;
  variant: Variant;
  onDismiss: () => void;
  /** Auto-dismiss after ms (e.g. 3000 for success). Omit for error so user can dismiss. */
  autoDismissMs?: number;
}

export function CenteredToast({ message, variant, onDismiss, autoDismissMs }: CenteredToastProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (autoDismissMs == null || autoDismissMs <= 0) return;
    const id = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(id);
  }, [autoDismissMs, onDismiss]);

  const isSuccess = variant === 'success';
  const containerClass = isSuccess
    ? 'bg-roomi-mint text-white'
    : 'bg-red-500 text-white border-2 border-red-600';

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-center gap-3 max-w-[min(90vw,24rem)]">
        <div
          className={`rounded-xl px-5 py-3.5 shadow-lg font-medium text-center ${containerClass}`}
          role={isSuccess ? 'status' : 'alert'}
        >
          {message}
        </div>
        {!isSuccess && (
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-lg bg-roomi-brown text-white px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            {t('common.ok')}
          </button>
        )}
      </div>
    </div>
  );
}
