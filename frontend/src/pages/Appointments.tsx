import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Plus, Filter, X } from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import AppointmentRow from '../components/AppointmentRow';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import { Select, Input } from '../components/ui/Input';
import { toast } from '../components/ui/Toast';
import { appointmentsApi } from '../api/endpoints';
import { extractErrorMessage } from '../api/client';
import type { Appointment, AppointmentStatus, Paginated } from '../types';

export default function Appointments() {
  const [data, setData] = useState<Paginated<Appointment> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('');
  const [date, setDate] = useState<string>('');

  const loadAppointments = useCallback(() => {
    setLoading(true);
    setError(null);

    appointmentsApi
      .list({
        page,
        status: status || undefined,
        date: date || undefined,
        per_page: 10,
        sort: 'desc',
      })
      .then(setData)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [page, status, date]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleStatusChange = async (id: number, newStatus: AppointmentStatus) => {
    try {
      await appointmentsApi.updateStatus(id, newStatus);
      toast.success('Statut mis à jour.');
      loadAppointments();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Annuler ce rendez-vous ?')) return;
    try {
      await appointmentsApi.cancel(id);
      toast.success('Rendez-vous annulé.');
      loadAppointments();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const hasFilters = status !== '' || date !== '';

  const resetFilters = () => {
    setStatus('');
    setDate('');
    setPage(1);
  };

  return (
    <Layout>
      <PageHeader
        title="Rendez-vous"
        subtitle={data ? `${data.meta.total} rendez-vous enregistré(s)` : 'Chargement…'}
        action={
          <Link to="/appointments/new">
            <Button icon={<Plus className="w-4 h-4" />}>
              Nouveau rendez-vous
            </Button>
          </Link>
        }
      />

      <Card padding="none">
        {/* Filtres */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Filtres
            </span>
            {hasFilters && (
              <button
                onClick={resetFilters}
                className="ml-auto inline-flex items-center gap-1 text-xs text-primary-600 hover:underline"
              >
                <X className="w-3 h-3" />
                Réinitialiser
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Statut"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmé</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
              <option value="no_show">Absent</option>
            </Select>

            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => { setDate(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {loading && (
          <div className="p-5">
            <TableSkeleton rows={6} cols={6} />
          </div>
        )}

        {error && (
          <div className="p-5">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          </div>
        )}

        {!loading && !error && data && data.data.length === 0 && (
          <div className="p-5">
            <EmptyState
              icon={<CalendarDays className="w-7 h-7" />}
              title={hasFilters ? 'Aucun résultat' : 'Aucun rendez-vous'}
              description={
                hasFilters
                  ? 'Essayez de modifier vos filtres.'
                  : 'Créez votre premier rendez-vous pour commencer.'
              }
              action={
                hasFilters ? (
                  <Button variant="secondary" onClick={resetFilters}>
                    Réinitialiser les filtres
                  </Button>
                ) : (
                  <Link to="/appointments/new">
                    <Button icon={<Plus className="w-4 h-4" />}>
                      Nouveau rendez-vous
                    </Button>
                  </Link>
                )
              }
            />
          </div>
        )}

        {!loading && !error && data && data.data.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 bg-slate-50/50">
                    <th className="py-3 px-4 font-medium text-xs uppercase tracking-wider">Date</th>
                    <th className="py-3 px-4 font-medium text-xs uppercase tracking-wider">Patient</th>
                    <th className="py-3 px-4 font-medium text-xs uppercase tracking-wider">Médecin</th>
                    <th className="py-3 px-4 font-medium text-xs uppercase tracking-wider">Service</th>
                    <th className="py-3 px-4 font-medium text-xs uppercase tracking-wider">Statut</th>
                    <th className="py-3 px-4 font-medium text-xs uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((apt) => (
                    <AppointmentRow
                      key={apt.id}
                      appointment={apt}
                      onStatusChange={handleStatusChange}
                      onCancel={handleCancel}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {data.meta.last_page > 1 && (
              <div className="p-5 border-t border-slate-100">
                <Pagination
                  currentPage={data.meta.current_page}
                  lastPage={data.meta.last_page}
                  total={data.meta.total}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </Layout>
  );
}