import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import LoadBadge from '../components/LoadBadge';
import AppointmentRow from '../components/AppointmentRow';
import { dashboardApi } from '../api/endpoints';
import type { Appointment, DashboardStats } from '../types';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      dashboardApi.stats(),
      dashboardApi.appointmentsUpcoming(30),
    ])
      .then(([s, a]) => {
        setStats(s);
        setUpcoming(a);
      })
      .catch((e) => setError('Erreur lors du chargement des données.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <p className="text-slate-500">Chargement…</p>
      </Layout>
    );
  }

  if (error || !stats) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error ?? 'Impossible de charger le tableau de bord.'}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Tableau de bord</h1>

      {/* Cards stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Patients" value={stats.patients.active} color="primary" />
        <StatCard title="Médecins actifs" value={stats.doctors.active} color="accent" />
        <StatCard title="RDV aujourd’hui" value={stats.appointments.today} color="warn" />
        <StatCard title="Consultations (mois)" value={stats.consultations.this_month} color="neutral" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charge par service */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Charge par service</h2>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100">
                <th className="pb-2 font-medium">Service</th>
                <th className="pb-2 font-medium text-center">Médecins</th>
                <th className="pb-2 font-medium text-center">RDV</th>
                <th className="pb-2 font-medium text-right">Charge</th>
              </tr>
            </thead>
            <tbody>
              {stats.services.distribution.map((s) => (
                <tr key={s.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-2 text-slate-700">{s.name}</td>
                  <td className="py-2 text-center text-slate-600">{s.doctors_count}</td>
                  <td className="py-2 text-center text-slate-600">{s.appointments_count}</td>
                  <td className="py-2 text-right">
                    <LoadBadge level={s.load_level} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Prochains RDV */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">
            Prochains rendez-vous
          </h2>

          {upcoming.length === 0 ? (
            <p className="text-slate-500 text-sm">Aucun rendez-vous à venir.</p>
          ) : (
            <div>
              {upcoming.map((a) => (
                <AppointmentRow key={a.id} appointment={a} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}