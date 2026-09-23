import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import type { AppointmentStatus, DashboardStats } from '../types';

// ============================================
// Bar chart — Charge par service
// ============================================

interface ServiceChartProps {
  distribution: DashboardStats['services']['distribution'];
}

const loadColors: Record<string, string> = {
  idle:      '#cbd5e1', // slate-300
  low:       '#10b981', // emerald-500
  medium:    '#f59e0b', // amber-500
  high:      '#ef4444', // red-500
  no_doctor: '#ef4444',
};

export function ServiceLoadChart({ distribution }: ServiceChartProps) {
  const data = distribution
    .filter((s) => s.doctors_count > 0 || s.appointments_count > 0)
    .map((s) => ({
      name: s.name.length > 14 ? s.name.slice(0, 14) + '…' : s.name,
      rdv: s.appointments_count,
      load: s.load_level,
    }));

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        Aucune donnée de charge
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              fontSize: 12,
            }}
            formatter={(v: number) => [`${v} RDV`, 'Rendez-vous']}
          />
          <Bar dataKey="rdv" radius={[6, 6, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={loadColors[entry.load] ?? '#cbd5e1'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// Pie chart — Statuts des RDV
// ============================================

interface StatusChartProps {
  appointments: DashboardStats['appointments'];
}

const statusConfig: { key: AppointmentStatus; label: string; color: string }[] = [
  { key: 'pending',   label: 'En attente', color: '#f59e0b' },
  { key: 'confirmed', label: 'Confirmé',   color: '#2c5fab' },
  { key: 'completed', label: 'Terminé',    color: '#10b981' },
  { key: 'cancelled', label: 'Annulé',     color: '#ef4444' },
  { key: 'no_show',   label: 'Absent',     color: '#94a3b8' },
];

export function AppointmentStatusChart({ appointments }: StatusChartProps) {
  const data = statusConfig
    .map((s) => ({ name: s.label, value: appointments[s.key], color: s.color }))
    .filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        Aucun rendez-vous
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              fontSize: 12,
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: 12, color: '#64748b' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}