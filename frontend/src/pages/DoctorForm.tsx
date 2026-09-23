import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, UserCog, Stethoscope, Building2 } from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Input, Select } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { toast } from '../components/ui/Toast';
import { doctorsApi, servicesApi } from '../api/endpoints';
import { extractErrorMessage } from '../api/client';
import type { Service } from '../types';

interface FormState {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  speciality: string;
  service_id: string;
  office_phone: string;
  is_available: boolean;
}

const emptyForm: FormState = {
  email: '',
  password: '',
  first_name: '',
  last_name: '',
  phone: '',
  speciality: '',
  service_id: '',
  office_phone: '',
  is_available: true,
};

export default function DoctorForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    servicesApi
      .list({ per_page: 100 })
      .then((r) => setServices(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit || !id) return;

    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      setError('Identifiant invalide.');
      setLoading(false);
      return;
    }

    doctorsApi
      .get(numericId)
      .then((d) => {
        setForm({
          email: d.user.email,
          password: '',
          first_name: d.user.first_name,
          last_name: d.user.last_name,
          phone: d.user.phone ?? '',
          speciality: d.speciality,
          service_id: d.service?.id ? String(d.service.id) : '',
          office_phone: d.office_phone ?? '',
          is_available: d.is_available,
        });
      })
      .catch(() => setError('Impossible de charger ce médecin.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSaving(true);

    const payload: Record<string, unknown> = {
      email: form.email,
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone || null,
      speciality: form.speciality,
      service_id: form.service_id ? Number(form.service_id) : null,
      office_phone: form.office_phone || null,
      is_available: form.is_available,
    };

    if (!isEdit) {
      payload.password = form.password;
    }

    try {
      if (isEdit && id) {
        await doctorsApi.update(Number(id), payload);
        toast.success('Médecin modifié avec succès.');
        navigate('/doctors');
      } else {
        await doctorsApi.create(payload as never);
        toast.success(`Dr ${form.first_name} ${form.last_name} créé.`);
        navigate('/doctors');
      }
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { errors?: Record<string, string[]> } } };
      if (anyErr.response?.data?.errors) {
        setFieldErrors(anyErr.response.data.errors);
      }
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </Layout>
    );
  }

  const firstError = (field: string) => fieldErrors[field]?.[0];

  return (
    <Layout>
      <div className="mb-6">
        <Link
          to="/doctors"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux médecins
        </Link>

        <PageHeader
          title={isEdit ? 'Modifier le médecin' : 'Nouveau médecin'}
          subtitle={
            isEdit
              ? 'Mettez à jour les informations du médecin'
              : 'Créez le compte et le profil du nouveau médecin'
          }
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Compte utilisateur */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
              <UserCog className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Compte utilisateur</h2>
              <p className="text-xs text-slate-500">
                Identifiants de connexion du médecin
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Prénom"
              required
              value={form.first_name}
              onChange={(e) => updateField('first_name', e.target.value)}
              error={firstError('first_name')}
              placeholder="Ex : Ibrahim"
            />
            <Input
              label="Nom"
              required
              value={form.last_name}
              onChange={(e) => updateField('last_name', e.target.value)}
              error={firstError('last_name')}
              placeholder="Ex : Koné"
            />
            <Input
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              error={firstError('email')}
              placeholder="dr.nom@meditrack.test"
            />
            {!isEdit && (
              <Input
                label="Mot de passe"
                type="password"
                required
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                error={firstError('password')}
                hint="Minimum 8 caractères"
              />
            )}
            <Input
              label="Téléphone"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              error={firstError('phone')}
              placeholder="+226 70 00 00 00"
            />
          </div>
        </Card>

        {/* Informations professionnelles */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Informations professionnelles</h2>
              <p className="text-xs text-slate-500">
                Spécialité et affectation du médecin
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Spécialité"
              required
              value={form.speciality}
              onChange={(e) => updateField('speciality', e.target.value)}
              error={firstError('speciality')}
              placeholder="Ex : Cardiologue"
            />
            <Select
              label="Service"
              required
              value={form.service_id}
              onChange={(e) => updateField('service_id', e.target.value)}
              error={firstError('service_id')}
            >
              <option value="">— Sélectionner un service —</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
            <Input
              label="Téléphone du bureau"
              value={form.office_phone}
              onChange={(e) => updateField('office_phone', e.target.value)}
              error={firstError('office_phone')}
              placeholder="+226 25 30 00 00"
            />
          </div>
        </Card>

        {/* Disponibilité */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-800">Disponibilité</h2>
                <p className="text-xs text-slate-500">
                  Le médecin peut-il recevoir des rendez-vous ?
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_available}
                onChange={(e) => updateField('is_available', e.target.checked)}
                className="rounded text-primary-600 w-4 h-4"
              />
              <span className="text-sm text-slate-700">Disponible</span>
            </label>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link to="/doctors">
            <Button type="button" variant="secondary">
              Annuler
            </Button>
          </Link>
          <Button type="submit" loading={saving} icon={<Save className="w-4 h-4" />}>
            {isEdit ? 'Enregistrer les modifications' : 'Créer le médecin'}
          </Button>
        </div>
      </form>
    </Layout>
  );
}