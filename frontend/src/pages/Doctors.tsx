import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Plus, UserCheck, UserX } from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import DoctorRow from '../components/DoctorRow';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import { toast } from '../components/ui/Toast';
import { doctorsApi } from '../api/endpoints';
import { extractErrorMessage } from '../api/client';
import type { Doctor, Paginated } from '../types';

export default function Doctors() {
  const [data, setData] = useState<Paginated<Doctor> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [includeInactive, setIncludeInactive] = useState(false);

  const loadDoctors = useCallback(() => {
    setLoading(true);
    setError(null);

    doctorsApi
      .list({
        search,
        page,
        include_inactive: includeInactive,
        per_page: 10,
      })
      .then(setData)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [search, page, includeInactive]);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleDeactivate = async (id: number, name: string) => {
    if (!confirm(`Désactiver le Dr ${name} ?\n\nSon historique médical sera conservé.`)) {
      return;
    }

    try {
      await doctorsApi.deactivate(id);
      toast.success(`Dr ${name} désactivé. L'historique est préservé.`);
      loadDoctors();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Médecins"
        subtitle={data ? `${data.meta.total} médecin(s) enregistré(s)` : 'Chargement…'}
        action={
          <Link to="/doctors/new">
            <Button icon={<Plus className="w-4 h-4" />}>
              Nouveau médecin
            </Button>
          </Link>
        }
      />

      <Card padding="none">
        <div className="p-5 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <SearchBar
                placeholder="Rechercher par nom, email…"
                onSearch={handleSearch}
              />
            </div>

            <button
              onClick={() => {
                setIncludeInactive((v) => !v);
                setPage(1);
              }}
              className={`inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition ${
                includeInactive
                  ? 'bg-primary-50 text-primary-700 border-primary-200 font-medium'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {includeInactive ? (
                <UserX className="w-4 h-4" />
              ) : (
                <UserCheck className="w-4 h-4" />
              )}
              {includeInactive ? 'Inclut les inactifs' : 'Actifs uniquement'}
            </button>
          </div>
        </div>

        {loading && (
          <div className="p-5">
            <TableSkeleton rows={5} cols={5} />
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
              title={search ? 'Aucun résultat' : 'Aucun médecin'}
              description={
                search
                  ? 'Essayez un autre terme de recherche.'
                  : 'Ajoutez votre premier médecin pour commencer.'
              }
              action={
                !search ? (
                  <Link to="/doctors/new">
                    <Button icon={<Plus className="w-4 h-4" />}>
                      Ajouter un médecin
                    </Button>
                  </Link>
                ) : undefined
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
                    <th className="py-3 px-4 font-medium text-xs uppercase tracking-wider">Médecin</th>
                    <th className="py-3 px-4 font-medium text-xs uppercase tracking-wider">Spécialité</th>
                    <th className="py-3 px-4 font-medium text-xs uppercase tracking-wider">Service</th>
                    <th className="py-3 px-4 font-medium text-xs uppercase tracking-wider">Téléphone</th>
                    <th className="py-3 px-4 font-medium text-xs uppercase tracking-wider">Statut</th>
                    <th className="py-3 px-4 font-medium text-xs uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((doctor) => (
                    <DoctorRow
                      key={doctor.id}
                      doctor={doctor}
                      onDeactivate={handleDeactivate}
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