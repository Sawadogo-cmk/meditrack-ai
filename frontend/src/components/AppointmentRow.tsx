import type { Appointment } from '../types';

const statusClasses: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700',
  confirmed: 'bg-primary-100 text-primary-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
  no_show:   'bg-slate-100 text-slate-600',
};

const statusLabels: Record<string, string> = {
  pending:   'En attente',
  confirmed: 'Confirmé',
  completed: 'Terminé',
  cancelled: 'Annulé',
  no_show:   'Absent',
};

export default function AppointmentRow({ appointment }: { appointment: Appointment }) {
  const date = new Date(appointment.scheduled_at);
  const formatted = date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-800">
          {appointment.patient?.full_name ?? '—'}
        </p>
        <p className="text-xs text-slate-500">
          {appointment.doctor?.full_name ?? '—'} · {appointment.service?.name ?? '—'}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm text-slate-700">{formatted}</p>
        <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${statusClasses[appointment.status]}`}>
          {statusLabels[appointment.status]}
        </span>
      </div>
    </div>
  );
}