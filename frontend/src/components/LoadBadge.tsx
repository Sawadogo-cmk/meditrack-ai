import type { LoadLevel } from '../types';

const config: Record<LoadLevel, { label: string; classes: string }> = {
  idle:      { label: 'Inactif',    classes: 'bg-slate-100 text-slate-600' },
  low:       { label: 'Faible',     classes: 'bg-emerald-100 text-emerald-700' },
  medium:    { label: 'Moyen',      classes: 'bg-amber-100 text-amber-700' },
  high:      { label: 'Élevé',      classes: 'bg-red-100 text-red-700' },
  no_doctor: { label: 'Sans médecin', classes: 'bg-red-100 text-red-700' },
};

export default function LoadBadge({ level }: { level: LoadLevel }) {
  const { label, classes } = config[level];
  return (
    <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${classes}`}>
      {label}
    </span>
  );
}