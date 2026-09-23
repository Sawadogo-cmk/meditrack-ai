import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

type Tone = 'gray' | 'blue' | 'green' | 'amber' | 'red' | 'teal' | 'purple';

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}

const tones: Record<Tone, string> = {
  gray:   'bg-slate-100 text-slate-700 ring-slate-200',
  blue:   'bg-primary-50 text-primary-700 ring-primary-200',
  green:  'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amber:  'bg-amber-50 text-amber-700 ring-amber-200',
  red:    'bg-red-50 text-red-700 ring-red-200',
  teal:   'bg-teal-50 text-teal-700 ring-teal-200',
  purple: 'bg-purple-50 text-purple-700 ring-purple-200',
};

const dotColors: Record<Tone, string> = {
  gray:   'bg-slate-500',
  blue:   'bg-primary-500',
  green:  'bg-emerald-500',
  amber:  'bg-amber-500',
  red:    'bg-red-500',
  teal:   'bg-teal-500',
  purple: 'bg-purple-500',
};

export default function Badge({ tone = 'gray', children, className, dot = false }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full ring-1 ring-inset',
        tones[tone],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[tone])} />}
      {children}
    </span>
  );
}