import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Plus, Filter, X } from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import ConsultationRow from '../components/ConsultationRow';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import { Input } from '../components/ui/Input';
import { consultationsApi } from '../api/endpoints';
import { extractErrorMessage } from '../api/client';
import type { Consultation, Paginated } from '../types';

export default function Consultations() {
  const [data, setData] = useState<Paginated<Consultation> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');

  const loadConsultations = useCallback(() => {
    setLoading(true);
    setError(null);

    consultationsApi
      .list({
        page,
        from: from || undefined,
        to: to || undefined,
        per_page: 10,
        sort: 'desc',
      })
      .then(setData)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [page, from, to]);

  useEffect(() => {
    loadConsultations();
  }, [loadConsultations]);

  const hasFilters = from !== '' || to !== '';

  const resetFilters = () => {
    setFrom('');
    setTo('');
    setPage(1);
  };

  return (
    <Layout>
      <PageHeader
        title="Consultations"
        subtitle={data ? `${data.meta.total} consultation(s) enregistrée(s)` : 'Chargement…'}
        action={
          <Link to="/consultations/new">
            <Button icon={<Plus className="w-4 h-4" />}>
              Nouvelle consultation
            </Button>
          </Link>
        }
      />

      <Card padding="none">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Période
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
            <Input
              label="Du"
              type="date"
              value={from}
              onChange={(e) => { setFrom(e.target.value); setPage(1); }}
            />
            <Input
              label="Au"
              type="date"
              value={to}
              onChange={(e) => { setTo(e.target.value); setPage(1); }}
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
              icon={<Stethoscope className="w-7 h-7" />}
              title={hasFilters ? 'Aucun résultat' : 'Aucune consultation'}
              description={
                hasFilters
                  ? 'Essayez de modifier la période.'
                  : 'Créez votre première consultation pour commencer.'
              }
              action={
                hasFilters ? (
                  <Button variant="secondary" onClick={resetFilters}>
                    Réinitialiser les filtres
                  </Button>
                ) : (
                  <Link to="/consultations/new">
                    <Button icon={<Plus className="w-4 h-4" />}>
                      Nouvelle consultation
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
                    <th className="py-3 px-4 font-medium text-xs uppercase tracking-wider">Motif</th>
                    <th className="py-3 px-4 font-medium text-xs uppercase tracking-wider">Diagnostic</th>
                    <th className="py-3 px-4 font-medium text-xs uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((c) => (
                    <ConsultationRow key={c.id} consultation={c} />
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