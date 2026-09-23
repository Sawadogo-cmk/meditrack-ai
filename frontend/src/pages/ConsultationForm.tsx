import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, User, Stethoscope, FileText, ClipboardList } from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Input, Select, Textarea } from '../components/ui/Input';
import { toast } from '../components/ui/Toast';
import { consultationsApi, doctorsApi, patientsApi } from '../api/endpoints';
import { extractErrorMessage } from '../api/client';
import type { Doctor, Patient } from '../types';

interface FormState {
  patient_id: string;
  doctor_id: string;
  appointment_id: string;
  consultation_date: string;
  motif: string;
  observations: string;
  diagnostic: string;
  traitement: string;
  notes: string;
}

const emptyForm: FormState = {
  patient_id: '',
  doctor_id: '',
  appointment_id: '',
  consultation_date: new Date().toISOString().slice(0, 16),
  motif: '',
  observations: '',
  diagnostic: '',
  traitement: '',
  notes: '',
};

export default function ConsultationForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Pré-remplir si vient d'un RDV
  useEffect(() => {
    const patientId = searchParams.get('patient_id');
    const doctorId = searchParams.get('doctor_id');
    const appointmentId = searchParams.get('appointment_id');

    if (patientId || doctorId || appointmentId) {
      setForm((prev) => ({
        ...prev,
        patient_id: patientId ?? '',
        doctor_id: doctorId ?? '',
        appointment_id: appointmentId ?? '',
      }));
    }
  }, [searchParams]);

  useEffect(() => {
    Promise.all([
      patientsApi.list({ per_page: 100 }),
      doctorsApi.list({ per_page: 100 }),
    ])
      .then(([p, d]) => {
        setPatients(p.data);
        setDoctors(d.data);
      })
      .catch(() => setError('Impossible de charger les données.'))
      .finally(() => setLoading(false));
  }, []);

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSaving(true);

    const payload = {
      patient_id: Number(form.patient_id),
      doctor_id: Number(form.doctor_id),
      appointment_id: form.appointment_id ? Number(form.appointment_id) : undefined,
      consultation_date: form.consultation_date || undefined,
      motif: form.motif || undefined,
      observations: form.observations || undefined,
      diagnostic: form.diagnostic || undefined,
      traitement: form.traitement || undefined,
      notes: form.notes || undefined,
    };

    try {
      await consultationsApi.create(payload);
      toast.success('Consultation enregistrée. Dossier médical mis à jour.');
      navigate('/consultations');
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

  const firstError = (field: string) => fieldErrors[field]?.[0];

  const selectedPatient = patients.find((p) => p.id === Number(form.patient_id));
  const selectedDoctor = doctors.find((d) => d.id === Number(form.doctor_id));

  return (
    <Layout>
      <div className="mb-6">
        <Link
          to="/consultations"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux consultations
        </Link>

        <PageHeader
          title="Nouvelle consultation"
          subtitle="Enregistrez un acte médical. Une entrée sera automatiquement créée dans le dossier du patient."
        />
      </div>

      {/* Info bandeau */}
      <div className="bg-primary-50 border border-primary-100 rounded-lg px-4 py-3 mb-6 flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
          i
        </div>
        <p className="text-sm text-primary-800">
          La consultation génère automatiquement une entrée <strong>« consultation »</strong> dans
          le dossier médical du patient. Le RDV lié, s'il y en a un, passera au statut{' '}
          <strong>« terminé »</strong>.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Contexte médical */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Contexte médical</h2>
              <p className="text-xs text-slate-500">Patient, médecin et date de l'acte</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Select
                label="Patient"
                required
                value={form.patient_id}
                onChange={(e) => updateField('patient_id', e.target.value)}
                error={firstError('patient_id')}
              >
                <option value="">— Sélectionner un patient —</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} — {p.full_name}
                  </option>
                ))}
              </Select>
              {selectedPatient && (
                <div className="mt-2 px-3 py-2 bg-slate-50 rounded-lg text-xs text-slate-600 flex items-center gap-2">
                  <span className="font-mono">{selectedPatient.code}</span>
                  <span>·</span>
                  <span>{selectedPatient.full_name}</span>
                  {selectedPatient.blood_group && (
                    <>
                      <span>·</span>
                      <span className="font-semibold text-red-600">{selectedPatient.blood_group}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div>
              <Select
                label="Médecin"
                required
                value={form.doctor_id}
                onChange={(e) => updateField('doctor_id', e.target.value)}
                error={firstError('doctor_id')}
              >
                <option value="">— Sélectionner un médecin —</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    Dr {d.user.full_name} — {d.speciality}
                  </option>
                ))}
              </Select>
              {selectedDoctor && (
                <div className="mt-2 px-3 py-2 bg-slate-50 rounded-lg text-xs text-slate-600 flex items-center gap-2">
                  <span className="font-medium">{selectedDoctor.speciality}</span>
                  {selectedDoctor.service && (
                    <>
                      <span>·</span>
                      <span className="text-teal-700">{selectedDoctor.service.name}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <Input
              label="Date et heure"
              type="datetime-local"
              value={form.consultation_date}
              onChange={(e) => updateField('consultation_date', e.target.value)}
              error={firstError('consultation_date')}
            />

            <Input
              label="ID du rendez-vous (optionnel)"
              type="number"
              value={form.appointment_id}
              onChange={(e) => updateField('appointment_id', e.target.value)}
              error={firstError('appointment_id')}
              hint="Laissez vide pour une consultation directe"
            />
          </div>
        </Card>

        {/* Motif & observations */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Examen clinique</h2>
              <p className="text-xs text-slate-500">Motif de la consultation et observations</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Motif de consultation"
              value={form.motif}
              onChange={(e) => updateField('motif', e.target.value)}
              error={firstError('motif')}
              placeholder="Ex : Douleurs thoraciques"
            />
            <Textarea
              label="Observations cliniques"
              value={form.observations}
              onChange={(e) => updateField('observations', e.target.value)}
              error={firstError('observations')}
              rows={3}
              placeholder="Ex : Patient stable, pas de fièvre, tension 14/9…"
            />
          </div>
        </Card>

        {/* Diagnostic & traitement */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Diagnostic & Traitement</h2>
              <p className="text-xs text-slate-500">
                Ces éléments figureront dans le dossier médical du patient
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Textarea
              label="Diagnostic"
              value={form.diagnostic}
              onChange={(e) => updateField('diagnostic', e.target.value)}
              error={firstError('diagnostic')}
              rows={3}
              placeholder="Ex : Hypertension artérielle modérée"
            />
            <Textarea
              label="Traitement prescrit"
              value={form.traitement}
              onChange={(e) => updateField('traitement', e.target.value)}
              error={firstError('traitement')}
              rows={3}
              placeholder="Ex : Amlodipine 10mg — 1 comprimé/jour"
            />
          </div>
        </Card>

        {/* Notes */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Notes internes</h2>
              <p className="text-xs text-slate-500">Visible uniquement par le personnel soignant</p>
            </div>
          </div>

          <Textarea
            value={form.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            error={firstError('notes')}
            rows={2}
            placeholder="Ex : Contrôle dans 1 mois, à surveiller…"
          />
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link to="/consultations">
            <Button type="button" variant="secondary">
              Annuler
            </Button>
          </Link>
          <Button
            type="submit"
            loading={saving}
            disabled={loading}
            icon={<Save className="w-4 h-4" />}
          >
            Enregistrer la consultation
          </Button>
        </div>
      </form>
    </Layout>
  );
}