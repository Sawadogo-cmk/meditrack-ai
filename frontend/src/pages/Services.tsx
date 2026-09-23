import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Building2, Plus, X } from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import ServiceRow from '../components/ServiceRow';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import { Input, Textarea } from '../components/ui/Input';
import { toast } from '../components/ui/Toast';
import { servicesApi } from '../api/endpoints';
import { extractErrorMessage } from '../api/client';
import type { Paginated, Service } from '../types';

export default function Services() {
  const [data, setData] = useState<Paginated<Service> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');

  // Formulaire inline
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newActive, setNewActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadServices = useCallback(() => {
    setLoading(true);
    setError(null);

    servicesApi
      .list({ search, per_page: 50 })
      .then(setData)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const resetForm = () => {
    setNewName('');
    setNewDescription('');
    setNewActive(true);
    setFormError(null);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    try {
      await servicesApi.create({
        name: newName,
        description: newDescription || null,
        is_active: newActive,
      } as Partial<Service>);

      toast.success(`Service "${newName}" créé.`);
      resetForm();
      setShowForm(false);
      loadServices();
    } catch (err) {
      setFormError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Supprimer le service "${name}" ?\n\nCette action est irréversible.`)) {
      return;
    }

    try {
      await servicesApi.delete(id);
      toast.success(`Service "${name}" supprimé.`);
      loadServices();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Services médicaux"
        subtitle={data ? `${data.meta.total} service(s)` : 'Chargement…'}
        action={
          <Button
            icon={showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            variant={showForm ? 'secondary' : 'primary'}
            onClick={() => {
              setShowForm((s) => !s);
              if (showForm) resetForm();
            }}
          >
            {showForm ? 'Annuler' : 'Nouveau service'}
          </Button>
        }
      />

      {/* Formulaire inline */}
      {showForm && (
        <Card className="mb-6 animate-fade-in">
          <h2 className="font-semibold text-slate-800 mb-4">Nouveau service</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nom"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex : Neurologie"
              />
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newActive}
                    onChange={(e) => setNewActive(e.target.checked)}
                    className="rounded text-primary-600"
                  />
                  Service actif
                </label>
              </div>
            </div>

            <Textarea
              label="Description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={2}
              placeholder="Description du service (optionnel)"
            />

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                {formError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                Annuler
              </Button>
              <Button type="submit" loading={saving}>
                Créer le service
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card padding="none">
        <div className="p-5 border-b border-slate-100">
          <SearchBar
            placeholder="Rechercher un service…"
            onSearch={setSearch}
          />
        </div>

        {loading && (
          <div className="p-5">
            <TableSkeleton rows={5} cols={4} />
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
              icon={<Building2 className="w-7 h-7" />}
              title={search ? 'Aucun résultat' : 'Aucun service'}
              description={
                search
                  ? 'Essayez un autre terme de recherche.'
                  : 'Créez votre premier service médical.'
              }
              action={
                !search ? (
                  <Button
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => setShowForm(true)}
                  >
                    Nouveau service
                  </Button>
                ) : undefined
              }
            />
          </div>
        )}

        {!loading && !error && data && data.data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 bg-slate-50/50">
                  <th className="py-3 px-4 font-medium text-xs uppercase tracking-wider">Service</th>
                  <th className="py-3 px-4 font-medium text-xs uppercase tracking-wider">Description</th>
                  <th className="py-3 px-4 font-medium text-xs uppercase tracking-wider">Médecins</th>
                  <th className="py-3 px-4 font-medium text-xs uppercase tracking-wider">Statut</th>
                  <th className="py-3 px-4 font-medium text-xs uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((service) => (
                  <ServiceRow
                    key={service.id}
                    service={service}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </Layout>
  );
}