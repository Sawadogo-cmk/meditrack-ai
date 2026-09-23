import { Link } from 'react-router-dom';
import { FileText, Eye } from 'lucide-react';
import Avatar from './ui/Avatar';
import type { Consultation } from '../types';

interface ConsultationRowProps {
  consultation: Consultation;
}

export default function ConsultationRow({ consultation }: ConsultationRowProps) {
  const date = new Date(consultation.consultation_date);
  const day = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const patientFirstName = consultation.patient?.full_name.split(' ')[0] ?? '?';
  const patientLastName = consultation.patient?.full_name.split(' ').slice(1).join(' ') ?? '?';

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2 text-slate-700">
          <FileText className="w-4 h-4 text-slate-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-slate-800 whitespace-nowrap">{day}</p>
            <p className="text-xs text-slate-500">{time}</p>
          </div>
        </div>
      </td>

      <td className="py-3 px-4">
        {consultation.patient ? (
          <div className="flex items-center gap-3">
            <Avatar firstName={patientFirstName} lastName={patientLastName} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
                {consultation.patient.full_name}
              </p>
              <p className="text-xs text-slate-500 font-mono">
                {consultation.patient.code}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-slate-400 text-sm">—</span>
        )}
      </td>

      <td className="py-3 px-4">
        <p className="text-sm text-slate-700">{consultation.doctor?.full_name ?? '—'}</p>
        <p className="text-xs text-slate-500">{consultation.doctor?.speciality ?? ''}</p>
      </td>

      <td className="py-3 px-4 text-slate-600 text-sm max-w-xs">
        <p className="truncate" title={consultation.motif ?? ''}>
          {consultation.motif ?? '—'}
        </p>
      </td>

      <td className="py-3 px-4 text-slate-600 text-sm max-w-xs">
        <p className="truncate" title={consultation.diagnostic ?? ''}>
          {consultation.diagnostic ?? '—'}
        </p>
      </td>

      <td className="py-3 px-4 text-right">
        <Link
          to={`/consultations/${consultation.id}`}
          className="inline-flex p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition opacity-0 group-hover:opacity-100"
          title="Voir le détail"
        >
          <Eye className="w-4 h-4" />
        </Link>
      </td>
    </tr>
  );
}