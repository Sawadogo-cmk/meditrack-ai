import { Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import Avatar from './ui/Avatar';
import Badge from './ui/Badge';
import type { Appointment, AppointmentStatus } from '../types';

interface AppointmentRowProps {
  appointment: Appointment;
  onStatusChange: (id: number, status: AppointmentStatus) => void;
  onCancel: (id: number) => void;
}

const statusTone: Record<AppointmentStatus, 'amber' | 'blue' | 'green' | 'red' | 'gray'> = {
  pending:   'amber',
  confirmed: 'blue',
  completed: 'green',
  cancelled: 'red',
  no_show:   'gray',
};

const statusLabel: Record<AppointmentStatus, string> = {
  pending:   'En attente',
  confirmed: 'Confirmé',
  completed: 'Terminé',
  cancelled: 'Annulé',
  no_show:   'Absent',
};

export default function AppointmentRow({
  appointment,
  onStatusChange,
  onCancel,
}: AppointmentRowProps) {
  const date = new Date(appointment.scheduled_at);
  const day = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const isTerminal = ['completed', 'cancelled', 'no_show'].includes(appointment.status);

  const patientFirstName = appointment.patient?.full_name.split(' ')[0] ?? '?';
  const patientLastName = appointment.patient?.full_name.split(' ').slice(1).join(' ') ?? '?';

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2 text-slate-700">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-slate-800 whitespace-nowrap">{day}</p>
            <p className="text-xs text-slate-500">{time} · {appointment.duration_minutes} min</p>
          </div>
        </div>
      </td>

      <td className="py-3 px-4">
        {appointment.patient ? (
          <div className="flex items-center gap-3">
            <Avatar firstName={patientFirstName} lastName={patientLastName} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
                {appointment.patient.full_name}
              </p>
              <p className="text-xs text-slate-500 font-mono">
                {appointment.patient.code}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-slate-400 text-sm">—</span>
        )}
      </td>

      <td className="py-3 px-4">
        <p className="text-sm text-slate-700">{appointment.doctor?.full_name ?? '—'}</p>
        <p className="text-xs text-slate-500">{appointment.doctor?.speciality ?? ''}</p>
      </td>

      <td className="py-3 px-4">
        {appointment.service ? (
          <Badge tone="teal">{appointment.service.name}</Badge>
        ) : (
          <span className="text-slate-400 text-sm">—</span>
        )}
      </td>

      <td className="py-3 px-4">
        <Badge tone={statusTone[appointment.status]} dot>
          {statusLabel[appointment.status]}
        </Badge>
      </td>

      <td className="py-3 px-4 text-right">
        {isTerminal ? (
          <span className="text-xs text-slate-400">Aucune action</span>
        ) : (
          <div className="flex justify-end gap-1">
            {appointment.status === 'pending' && (
              <button
                onClick={() => onStatusChange(appointment.id, 'confirmed')}
                className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition"
                title="Confirmer"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
            {appointment.status === 'confirmed' && (
              <button
                onClick={() => onStatusChange(appointment.id, 'completed')}
                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
                title="Marquer comme terminé"
              >
                <Clock className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onCancel(appointment.id)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
              title="Annuler"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}