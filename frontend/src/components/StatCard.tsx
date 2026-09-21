import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  color?: 'primary' | 'accent' | 'warn' | 'neutral';
}

const colorClasses = {
  primary: 'bg-primary-50 text-primary-700 border-primary-100',
  accent:  'bg-teal-50 text-teal-700 border-teal-100',
  warn:    'bg-amber-50 text-amber-700 border-amber-100',
  neutral: 'bg-slate-50 text-slate-700 border-slate-100',
};

export default function StatCard({ title, value, color = 'primary' }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
      <div className={`h-1 w-12 rounded mt-3 ${colorClasses[color].split(' ')[0]}`} />
    </div>
  );
}