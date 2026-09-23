import { Link } from 'react-router-dom';
import { Eye, Pencil } from 'lucide-react';
import type { Patient } from '../types';

interface PatientRowProps {
  patient: Patient;
}

export default function PatientRow({ patient }: PatientRowProps) {
  const genderLabel =
    patient.gender === 'M' ? 'Homme' : patient.gender === 'F' ? 'Femme' : '—';

  const genderTone =
    patient.gender === 'M' ? 'blue' : patient.gender === 'F' ? 'purple' : 'gray';

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
      <td className="py-3 px-4">
        <Link
          to={`/patients/${patient.id}`}
          className="font-mono text-xs font-medium text-primary-700 hover:underline"
        >
          {patient.code}
        </Link>
      </td>

      <td className="py-3 px-4">
        <Link
          to={`/patients/${patient.id}`}
          className="font-medium text-slate-800 hover:text-primary-700 transition-colors"
        >
          {patient.full_name}
        </Link>
      </td>

      <td className="py-3 px-4">
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            genderTone === 'blue'
              ? 'bg-primary-50 text-primary-700'
              : genderTone === 'purple'
              ? 'bg-purple-50 text-purple-700'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {genderLabel}
        </span>
      </td>

      <td className="py-3 px-4 text-slate-600 text-sm">
        {patient.age !== null ? `${patient.age} ans` : '—'}
      </td>

      <td className="py-3 px-4 text-slate-600 text-sm">
        {patient.phone ?? '—'}
      </td>

      <td className="py-3 px-4">
        {patient.blood_group ? (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-red-50 text-red-700">
            {patient.blood_group}
          </span>
        ) : (
          <span className="text-slate-400 text-sm">—</span>
        )}
      </td>

      <td className="py-3 px-4 text-right">
        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            to={`/patients/${patient.id}`}
            className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition"
            title="Voir la fiche"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <Link
            to={`/patients/${patient.id}/edit`}
            className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition"
            title="Modifier"
          >
            <Pencil className="w-4 h-4" />
          </Link>
        </div>
      </td>
    </tr>
  );
}