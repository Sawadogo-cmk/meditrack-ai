import { useEffect, useState, type ReactNode } from 'react';
import {
  Users,
  Stethoscope,
  CalendarDays,
  FileText,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/ui/StatCard';
import Card, { CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import EmptyState from '../components/ui/EmptyState';
import { ServiceLoadChart, AppointmentStatusChart } from '../components/DashboardCharts';
import AiPredictionsCard from '../components/AiPredictions';
import { dashboardApi, aiApi } from '../api/endpoints';
import type {
  AiPredictions,
  Appointment,
  AppointmentStatus,
  DashboardStats,
} from '../types';

const statusTone: Record<AppointmentStatus, 'amber' | 'blue' | 'green' | 'red' | 'gray'> = {
  pending: 'amber',
  confirmed: 'blue',
  completed: 'green',
  cancelled: 'red',
  no_show: 'gray',
};

const statusLabel: Record<AppointmentStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  completed: 'Terminé',
  cancelled: 'Annulé',
  no_show: 'Absent',
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [aiData, setAiData] = useState<AiPredictions | null>(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      dashboardApi.stats(),
      dashboardApi.appointmentsUpcoming(30),
    ])
      .then(([s, a]) => {
        setStats(s);
        setUpcoming(a);
      })
      .catch(() => setError('Erreur lors du chargement des données.'))
      .finally(() => setLoading(false));

    aiApi
      .predictions()
      .then(setAiData)
      .catch(() => setAiError('Service IA indisponible'))
      .finally(() => setAiLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <PageHeader title="Tableau de bord" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 p-5 h-28 animate-pulse"
            />
          ))}
        </div>
      </Layout>
    );
  }

  if (error || !stats) {
    return (
      <Layout>
        <PageHeader title="Tableau de bord" />
        <Card>
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">
              {error ?? 'Impossible de charger le tableau de bord.'}
            </p>
          </div>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader
        title="Tableau de bord"
        subtitle="Vue d'ensemble de l'activité de l'établissement"
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Patients actifs"
          value={stats.patients.active}
          icon={<Users className="w-5 h-5" />}
          color="primary"
          hint={`${stats.patients.new_this_month} nouveaux ce mois`}
        />
        <StatCard
          title="Médecins actifs"
          value={stats.doctors.active}
          icon={<Stethoscope className="w-5 h-5" />}
          color="accent"
          hint={`${stats.doctors.total} au total`}
        />
        <StatCard
          title="RDV aujourd'hui"
          value={stats.appointments.today}
          icon={<CalendarDays className="w-5 h-5" />}
          color="amber"
          hint={`${stats.appointments.upcoming} à venir`}
        />
        <StatCard
          title="Consultations du mois"
          value={stats.consultations.this_month}
          icon={<FileText className="w-5 h-5" />}
          color="emerald"
          hint={`${stats.consultations.total} au total`}
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader
            title="Charge par service"
            subtitle="Répartition des rendez-vous"
          />
          <ServiceLoadChart distribution={stats.services.distribution} />
        </Card>

        <Card>
          <CardHeader
            title="Statuts des rendez-vous"
            subtitle="Sur l'ensemble des rendez-vous"
          />
          <AppointmentStatusChart appointments={stats.appointments} />
        </Card>
      </div>

      {/* Prévisions IA + Activité */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AiPredictionsCard data={aiData} loading={aiLoading} error={aiError} />

        <Card>
          <CardHeader title="Activité de la semaine" />
          <div className="space-y-3">
            <ActivityRow
              icon={<Users className="w-4 h-4" />}
              color="primary"
              label="Nouveaux patients"
              value={stats.patients.new_this_month}
            />
            <ActivityRow
              icon={<CalendarDays className="w-4 h-4" />}
              color="amber"
              label="RDV ce mois"
              value={stats.appointments.this_month}
            />
            <ActivityRow
              icon={<FileText className="w-4 h-4" />}
              color="emerald"
              label="Consultations cette semaine"
              value={stats.consultations.this_week}
            />
            <ActivityRow
              icon={<Activity className="w-4 h-4" />}
              color="accent"
              label="Services actifs"
              value={stats.services.active}
            />
          </div>
        </Card>
      </div>

      {/* Prochains RDV */}
      <Card padding="none">
        <div className="p-5 border-b border-slate-100">
          <CardHeader
            title="Prochains rendez-vous"
            subtitle="Les 30 prochains jours"
            action={
              <Link
                to="/appointments"
                className="text-sm text-primary-600 hover:underline font-medium"
              >
                Voir tout →
              </Link>
            }
          />
        </div>

        {upcoming.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<CalendarDays className="w-7 h-7" />}
              title="Aucun rendez-vous à venir"
              description="Les rendez-vous confirmés apparaîtront ici."
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {upcoming.slice(0, 5).map((apt) => (
              <AppointmentMiniRow key={apt.id} appointment={apt} />
            ))}
          </div>
        )}
      </Card>

      {/* Résumé */}
      <div className="mt-6">
        <Card>
          <CardHeader title="Résumé" />
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <SummaryRow label="Total patients" value={stats.patients.total} />
            <SummaryRow label="Patients archivés" value={stats.patients.archived} />
            <SummaryRow label="Total médecins" value={stats.doctors.total} />
            <SummaryRow
              label="Total consultations"
              value={stats.consultations.total}
            />
            <SummaryRow label="Total services" value={stats.services.total} />
          </div>
        </Card>
      </div>
    </Layout>
  );
}

// ============================================
// Sous-composants
// ============================================

function AppointmentMiniRow({ appointment }: { appointment: Appointment }) {
  const date = new Date(appointment.scheduled_at);
  const day = date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
  });
  const time = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition">
      <div className="w-12 text-center shrink-0">
        <p className="text-xs text-slate-500 uppercase font-medium">{day}</p>
        <p className="text-sm font-semibold text-slate-800">{time}</p>
      </div>

      {appointment.patient && (
        <Avatar
          firstName={appointment.patient.full_name.split(' ')[0] ?? '?'}
          lastName={appointment.patient.full_name.split(' ')[1] ?? '?'}
          size="sm"
        />
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">
          {appointment.patient?.full_name ?? '—'}
        </p>
        <p className="text-xs text-slate-500 truncate">
          {appointment.doctor?.full_name ?? '—'} ·{' '}
          {appointment.service?.name ?? '—'}
        </p>
      </div>

      <Badge tone={statusTone[appointment.status]} dot>
        {statusLabel[appointment.status]}
      </Badge>
    </div>
  );
}

function ActivityRow({
  icon,
  color,
  label,
  value,
}: {
  icon: ReactNode;
  color: 'primary' | 'accent' | 'amber' | 'emerald';
  label: string;
  value: number;
}) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    accent: 'bg-teal-50 text-teal-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[color]}`}
        >
          {icon}
        </div>
        <span className="text-sm text-slate-700">{label}</span>
      </div>
      <span className="text-sm font-semibold text-slate-800">{value}</span>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-bold text-slate-800 mt-0.5">{value}</p>
    </div>
  );
}