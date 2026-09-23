import { FileText, Syringe, AlertTriangle, Stethoscope, Microscope, Hospital } from 'lucide-react';
import type { MedicalRecord, MedicalRecordType } from '../types';

interface TimelineProps {
  records: MedicalRecord[];
}

const typeConfig: Record<
  MedicalRecordType,
  { label: string; icon: typeof FileText; bg: string; color: string; border: string }
> = {
  consultation:    { label: 'Consultation',     icon: Stethoscope,   bg: 'bg-primary-50',  color: 'text-primary-600',  border: 'border-primary-500' },
  examen:          { label: 'Examen',           icon: Microscope,    bg: 'bg-teal-50',     color: 'text-teal-600',     border: 'border-teal-500' },
  hospitalisation: { label: 'Hospitalisation',  icon: Hospital,      bg: 'bg-purple-50',   color: 'text-purple-600',   border: 'border-purple-500' },
  vaccin:          { label: 'Vaccin',           icon: Syringe,       bg: 'bg-emerald-50',  color: 'text-emerald-600',  border: 'border-emerald-500' },
  allergie:        { label: 'Allergie',         icon: AlertTriangle, bg: 'bg-amber-50',    color: 'text-amber-600',    border: 'border-amber-500' },
  autre:           { label: 'Autre',            icon: FileText,      bg: 'bg-slate-100',   color: 'text-slate-600',    border: 'border-slate-400' },
};

export default function MedicalRecordTimeline({ records }: TimelineProps) {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-slate-700">Aucun enregistrement</p>
        <p className="text-xs text-slate-500 mt-1">
          Les consultations, examens et actes médicaux apparaîtront ici.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Ligne verticale */}
      <div className="absolute left-5 top-2 bottom-2 w-px bg-slate-200" />

      <div className="space-y-4">
        {records.map((record) => {
          const config = typeConfig[record.record_type] ?? typeConfig.autre;
          const Icon = config.icon;
          const date = new Date(record.record_date);
          const day = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
          const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

          return (
            <div key={record.id} className="relative flex gap-4">
              {/* Point sur la timeline */}
              <div className={`relative z-10 w-10 h-10 rounded-full ${config.bg} ${config.color} flex items-center justify-center shrink-0 border-2 border-white shadow-sm`}>
                <Icon className="w-4 h-4" />
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 break-words">
                      {record.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="text-xs text-slate-500">
                        {day} · {time}
                      </span>
                    </div>
                  </div>
                </div>

                {record.description && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                      {record.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}