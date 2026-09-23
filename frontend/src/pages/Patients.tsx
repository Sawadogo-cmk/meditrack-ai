import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Archive } from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import PatientRow from '../components/PatientRow';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import { patientsApi } from '../api/endpoints';
import { extractErrorMessage } from '../api/client';
import type { Paginated, Patient } from '../types';

export default function Patients() {
  const [data, setData] = useState<Paginated<Patient> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [archived, setArchived] = useState(false);

  const loadPatients = useCallback(() => {
    setLoading(true);
    setError(null);

    patientsApi
      .list({ search, page, archived, per_page: 10 })
      .then(setData)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [search, page, archived]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  return (
    <Layout>
      <PageHeader
        title="Patients"
        subtitle={data ? `${data.meta.total} patient(s) dans la base` : 'Chargement…'}
        action={
          <Link to="/patients/new">
            <Button icon={<Plus className="w-4 h-4" />}>
              Nouveau patient
            </Button>
          </Link>
        }
      />

      <Card padding="none">
        {/* Barre de filtres */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <SearchBar
                placeholder="Rechercher par nom, code, téléphone…"
                onSearch={handleSearch}
              />
            </div>

            <button
              onClick={() => {
                setArchived((a) => !a);
                setPage(1);
              }}
              className={`inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition ${
                archived
                  ? 'bg-primary-50 text-primary-700 border-primary-200 font-medium'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Archive className="w-4 h-4" />
              {archived ? 'Voir les actifs' : 'Voir les archivés'}
            </button>
          </div>
        </div>

        {/* Contenu */}
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
              icon={<Users className="w-7 h-7" />}
              title={
                archived
                  ? 'Aucun patient archivé'
                  : search
                  ? 'Aucun résultat'
                  : 'Aucun patient'
              }
              description={
                search
                  ? 'Essayez un autre terme de recherche.'
                  : 'Commencez par ajouter votre premier patient.'
              }
              action={
                !search && !archived ? (
                  <Link to="/patients/new">
                    <Button icon={<Plus className="w-4 h-4" />}>
                      Ajouter un patient
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
                    <th className="py-3 px-4 font-medium text-xs uppercase tracking-wider">Code</th>
                    <th className="py-3 px-4 font-medium text-xs uppercase tracking-wider">Nom complet</th>
                    <th className="py-3 px-4 font-medium text-xs uppercase tracking-wider">Genre</th>
                    <th className="py-3 px-4 font-medium text-xs uppercase tracking-wider">Âge</th>
                    <th className="py-3 px-4 font-medium text-xs uppercase tracking-wider">Téléphone</th>
                    <th className="py-3 px-4 font-medium text-xs uppercase tracking-wider">Groupe</th>
                    <th className="py-3 px-4 font-medium text-xs uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((patient) => (
                    <PatientRow key={patient.id} patient={patient} />
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