import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, User } from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { toast } from '../components/ui/Toast';
import { patientsApi } from '../api/endpoints';
import { extractErrorMessage } from '../api/client';
import type { BloodGroup, Gender, Patient } from '../types';

interface FormState {
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: Gender | '';
  phone: string;
  address: string;
  blood_group: BloodGroup | '';
  emergency_contact_name: string;
  emergency_contact_phone: string;
}

const emptyForm: FormState = {
  first_name: '',
  last_name: '',
  birth_date: '',
  gender: '',
  phone: '',
  address: '',
  blood_group: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
};

export default function PatientForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!isEdit || !id) return;

    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      setError('Identifiant invalide.');
      setLoading(false);
      return;
    }

    patientsApi
      .get(numericId)
      .then((p: Patient) => {
        setForm({
          first_name: p.first_name,
          last_name: p.last_name,
          birth_date: p.birth_date ?? '',
          gender: p.gender ?? '',
          phone: p.phone ?? '',
          address: p.address ?? '',
          blood_group: p.blood_group ?? '',
          emergency_contact_name: p.emergency_contact_name ?? '',
          emergency_contact_phone: p.emergency_contact_phone ?? '',
        });
      })
      .catch(() => setError('Impossible de charger ce patient.'))
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

    const payload: Record<string, unknown> = {};
    Object.entries(form).forEach(([key, value]) => {
      payload[key] = value === '' ? null : value;
    });

    try {
      if (isEdit && id) {
        await patientsApi.update(Number(id), payload);
        toast.success('Patient modifié avec succès.');
        navigate(`/patients/${id}`);
      } else {
        const created = await patientsApi.create(payload);
        toast.success(`Patient ${created.code} créé.`);
        navigate(`/patients/${created.id}`);
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

  const backUrl = isEdit && id ? `/patients/${id}` : '/patients';
  const firstError = (field: string) => fieldErrors[field]?.[0];

  return (
    <Layout>
      <div className="mb-6">
        <Link
          to={backUrl}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {isEdit ? 'Retour à la fiche' : 'Retour aux patients'}
        </Link>

        <PageHeader
          title={isEdit ? 'Modifier le patient' : 'Nouveau patient'}
          subtitle={
            isEdit
              ? 'Mettez à jour les informations du patient'
              : 'Enregistrez un nouveau patient dans la base'
          }
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Identité */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
              <User className="w-4 h-4" />
            </div>
            <h2 className="font-semibold text-slate-800">Identité</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Prénom"
              required
              value={form.first_name}
              onChange={(e) => updateField('first_name', e.target.value)}
              error={firstError('first_name')}
              placeholder="Ex : Awa"
            />
            <Input
              label="Nom"
              required
              value={form.last_name}
              onChange={(e) => updateField('last_name', e.target.value)}
              error={firstError('last_name')}
              placeholder="Ex : Traoré"
            />
            <Input
              label="Date de naissance"
              type="date"
              value={form.birth_date}
              onChange={(e) => updateField('birth_date', e.target.value)}
              error={firstError('birth_date')}
            />
            <Select
              label="Genre"
              value={form.gender}
              onChange={(e) => updateField('gender', e.target.value as Gender | '')}
              error={firstError('gender')}
            >
              <option value="">— Non précisé —</option>
              <option value="M">Homme</option>
              <option value="F">Femme</option>
              <option value="autre">Autre</option>
            </Select>
          </div>
        </Card>

        {/* Contact */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h2 className="font-semibold text-slate-800">Contact</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Téléphone"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              error={firstError('phone')}
              placeholder="+226 70 00 00 00"
            />
            <Select
              label="Groupe sanguin"
              value={form.blood_group}
              onChange={(e) => updateField('blood_group', e.target.value as BloodGroup | '')}
              error={firstError('blood_group')}
            >
              <option value="">— Non précisé —</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </Select>
            <div className="md:col-span-2">
              <Textarea
                label="Adresse"
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                error={firstError('address')}
                rows={2}
                placeholder="Quartier, ville, pays"
              />
            </div>
          </div>
        </Card>

        {/* Contact d'urgence */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="font-semibold text-slate-800">Contact d'urgence</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nom du contact"
              value={form.emergency_contact_name}
              onChange={(e) => updateField('emergency_contact_name', e.target.value)}
              error={firstError('emergency_contact_name')}
              placeholder="Ex : Moussa Traoré"
            />
            <Input
              label="Téléphone du contact"
              value={form.emergency_contact_phone}
              onChange={(e) => updateField('emergency_contact_phone', e.target.value)}
              error={firstError('emergency_contact_phone')}
              placeholder="+226 70 00 00 00"
            />
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link to={backUrl}>
            <Button type="button" variant="secondary">
              Annuler
            </Button>
          </Link>
          <Button
            type="submit"
            loading={saving}
            icon={<Save className="w-4 h-4" />}
          >
            {isEdit ? 'Enregistrer les modifications' : 'Créer le patient'}
          </Button>
        </div>
      </form>
    </Layout>
  );
}