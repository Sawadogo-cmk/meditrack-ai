import { Link } from 'react-router-dom';
import { Eye, Pencil, UserX } from 'lucide-react';
import Avatar from './ui/Avatar';
import Badge from './ui/Badge';
import type { Doctor } from '../types';

interface DoctorRowProps {
  doctor: Doctor;
  onDeactivate: (id: number, name: string) => void;
}

export default function DoctorRow({ doctor, onDeactivate }: DoctorRowProps) {
  const fullName = `${doctor.user.first_name} ${doctor.user.last_name}`;
  const isActive = doctor.is_available && doctor.user.is_active;

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <Avatar
            firstName={doctor.user.first_name}
            lastName={doctor.user.last_name}
            size="sm"
          />
          <div className="min-w-0">
            <Link
              to={`/doctors/${doctor.id}/edit`}
              className="font-medium text-slate-800 hover:text-primary-700 transition-colors block truncate"
            >
              Dr {fullName}
            </Link>
            <p className="text-xs text-slate-500 truncate">{doctor.user.email}</p>
          </div>
        </div>
      </td>

      <td className="py-3 px-4 text-slate-600 text-sm">{doctor.speciality}</td>

      <td className="py-3 px-4">
        {doctor.service ? (
          <Badge tone="teal">{doctor.service.name}</Badge>
        ) : (
          <span className="text-slate-400 text-sm">—</span>
        )}
      </td>

      <td className="py-3 px-4 text-slate-600 text-sm">
        {doctor.user.phone ?? '—'}
      </td>

      <td className="py-3 px-4">
        <Badge tone={isActive ? 'green' : 'gray'} dot>
          {isActive ? 'Actif' : 'Inactif'}
        </Badge>
      </td>

      <td className="py-3 px-4 text-right">
        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            to={`/doctors/${doctor.id}/edit`}
            className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition"
            title="Modifier"
          >
            <Pencil className="w-4 h-4" />
          </Link>
          {isActive && (
            <button
              onClick={() => onDeactivate(doctor.id, fullName)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
              title="Désactiver"
            >
              <UserX className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}