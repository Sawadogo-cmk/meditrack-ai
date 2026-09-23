import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

type Color = 'primary' | 'accent' | 'amber' | 'emerald' | 'rose' | 'purple';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color?: Color;
  hint?: string;
}

const colorClasses: Record<Color, { bg: string; text: string }> = {
  primary: { bg: 'bg-primary-50',  text: 'text-primary-600' },
  accent:  { bg: 'bg-teal-50',     text: 'text-teal-600' },
  amber:   { bg: 'bg-amber-50',    text: 'text-amber-600' },
  emerald: { bg: 'bg-emerald-50',  text: 'text-emerald-600' },
  rose:    { bg: 'bg-rose-50',     text: 'text-rose-600' },
  purple:  { bg: 'bg-purple-50',   text: 'text-purple-600' },
};

export default function StatCard({ title, value, icon, color = 'primary', hint }: StatCardProps) {
  const c = colorClasses[color];
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm text-slate-500 truncate">{title}</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
          {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
        </div>
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', c.bg, c.text)}>
          {icon}
        </div>
      </div>
    </div>
  );
}