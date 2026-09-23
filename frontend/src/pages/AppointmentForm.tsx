import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Stethoscope, Calendar, MessageSquare } from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Input, Select, Textarea } from '../components/ui/Input';
import { toast } from '../components/ui/Toast';
import { appointmentsApi, doctorsApi, patientsApi } from '../api/endpoints';
import { extractErrorMessage } from '../api/client';
import type { Doctor, Patient } from '../types';

interface FormState {
  patient_id: string;
  doctor_id: string;
  service_id: string;
  scheduled_at: string;
  duration_minutes: string;
  reason: string;
  notes: string;
}

const emptyForm: FormState = {
  patient_id: '',
  doctor_id: '',
  service_id: '',
  scheduled_at: '',
  duration_minutes: '30',
  reason: '',
  notes: '',
};

export default function AppointmentForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Charger les listes
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

  // Auto-remplir le service depuis le médecin sélectionné
  useEffect(() => {
    if (!form.doctor_id) return;
    const doctor = doctors.find((d) => d.id === Number(form.doctor_id));
    if (doctor?.service?.id) {
      setForm((prev) => ({ ...prev, service_id: String(doctor.service!.id) }));
    }
  }, [form.doctor_id, doctors]);

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
      service_id: form.service_id ? Number(form.service_id) : undefined,
      scheduled_at: form.scheduled_at,
      duration_minutes: Number(form.duration_minutes),
      reason: form.reason || undefined,
      notes: form.notes || undefined,
    };

    try {
      await appointmentsApi.create(payload);
      toast.success('Rendez-vous créé avec succès.');
      navigate('/appointments');
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

  // Info du médecin sélectionné
  const selectedDoctor = doctors.find((d) => d.id === Number(form.doctor_id));
  const selectedPatient = patients.find((p) => p.id === Number(form.patient_id));

  return (
    <Layout>
      <div className="mb-6">
        <Link
          to="/appointments"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux rendez-vous
        </Link>

        <PageHeader
          title="Nouveau rendez-vous"
          subtitle="Planifiez un rendez-vous entre un patient et un médecin"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Personnes */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Patient & Médecin</h2>
              <p className="text-xs text-slate-500">Qui consulte qui ?</p>
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
                  <span className="font-mono text-slate-500">{selectedPatient.code}</span>
                  <span>·</span>
                  <span>{selectedPatient.phone ?? 'Pas de téléphone'}</span>
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
          </div>
        </Card>

        {/* Créneau */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Créneau</h2>
              <p className="text-xs text-slate-500">Date, heure et durée du rendez-vous</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Date et heure"
                type="datetime-local"
                required
                value={form.scheduled_at}
                onChange={(e) => updateField('scheduled_at', e.target.value)}
                error={firstError('scheduled_at')}
                hint="Le rendez-vous doit être dans le futur"
              />
            </div>
            <Select
              label="Durée"
              value={form.duration_minutes}
              onChange={(e) => updateField('duration_minutes', e.target.value)}
              error={firstError('duration_minutes')}
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 heure</option>
              <option value="90">1h30</option>
              <option value="120">2 heures</option>
            </Select>
          </div>
        </Card>

        {/* Motif */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Motif</h2>
              <p className="text-xs text-slate-500">Raison de la consultation</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Raison du rendez-vous"
              value={form.reason}
              onChange={(e) => updateField('reason', e.target.value)}
              error={firstError('reason')}
              placeholder="Ex : Douleurs thoraciques, suivi tension…"
            />
            <Textarea
              label="Notes internes"
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              error={firstError('notes')}
              rows={3}
              placeholder="Informations complémentaires (optionnel)"
            />
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link to="/appointments">
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
            Créer le rendez-vous
          </Button>
        </div>
      </form>
    </Layout>
  );
}