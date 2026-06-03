import React from 'react';
import { useToastStore } from '@/hooks/useToast';

const ACCENT: Record<string, string> = {
  success: 'border-emerald-500/40',
  error: 'border-red-500/40',
  info: 'border-brass/40',
};

export const Toaster: React.FC = () => {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto rounded-md border bg-dark-gray/95 p-3 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.8)] backdrop-blur ${ACCENT[t.kind]}`}
          onClick={() => dismiss(t.id)}
        >
          <p className="text-[13px] font-semibold text-neutral-100">{t.title}</p>
          {t.message && <p className="mt-0.5 text-[12px] leading-snug text-zinc-400">{t.message}</p>}
        </div>
      ))}
    </div>
  );
};
