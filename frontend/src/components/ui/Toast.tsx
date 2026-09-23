import { create } from 'zustand';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastState {
  toasts: Toast[];
  add: (type: ToastType, message: string) => void;
  remove: (id: number) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  add: (type, message) => {
    const id = Date.now() + Math.random();
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4500);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (message: string) => useToastStore.getState().add('success', message),
  error:   (message: string) => useToastStore.getState().add('error', message),
  info:    (message: string) => useToastStore.getState().add('info', message),
  warning: (message: string) => useToastStore.getState().add('warning', message),
};

const config: Record<ToastType, { icon: typeof CheckCircle2; classes: string; iconClasses: string }> = {
  success: { icon: CheckCircle2,  classes: 'bg-white border-emerald-200', iconClasses: 'text-emerald-500' },
  error:   { icon: AlertCircle,   classes: 'bg-white border-red-200',     iconClasses: 'text-red-500' },
  info:    { icon: Info,          classes: 'bg-white border-primary-200', iconClasses: 'text-primary-500' },
  warning: { icon: AlertTriangle, classes: 'bg-white border-amber-200',   iconClasses: 'text-amber-500' },
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map((t) => {
        const { icon: Icon, classes, iconClasses } = config[t.type];
        return (
          <div
            key={t.id}
            className={cn(
              'flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-slide-in-right',
              classes
            )}
          >
            <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', iconClasses)} />
            <p className="flex-1 text-sm text-slate-700">{t.message}</p>
            <button
              onClick={() => remove(t.id)}
              className="text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}