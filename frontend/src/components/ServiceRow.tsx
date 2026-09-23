import { Building2, Trash2, Users } from 'lucide-react';
import Badge from './ui/Badge';
import type { Service } from '../types';

interface ServiceRowProps {
  service: Service;
  onDelete: (id: number, name: string) => void;
}

export default function ServiceRow({ service, onDelete }: ServiceRowProps) {
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <p className="font-medium text-slate-800">{service.name}</p>
        </div>
      </td>

      <td className="py-3 px-4 text-slate-600 text-sm max-w-md truncate">
        {service.description ?? '—'}
      </td>

      <td className="py-3 px-4">
        <div className="inline-flex items-center gap-1.5 text-sm text-slate-700">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium">{service.doctors_count ?? 0}</span>
          <span className="text-slate-400">médecin{(service.doctors_count ?? 0) > 1 ? 's' : ''}</span>
        </div>
      </td>

      <td className="py-3 px-4">
        <Badge tone={service.is_active ? 'green' : 'gray'} dot>
          {service.is_active ? 'Actif' : 'Inactif'}
        </Badge>
      </td>

      <td className="py-3 px-4 text-right">
        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onDelete(service.id, service.name)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}