import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  Phone,
  MapPin,
  Droplets,
  Calendar,
  User as UserIcon,
  AlertCircle,
  Heart,
  FileText,
  Activity,
} from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import Button from '../components/ui/Button';
import Card, { CardHeader } from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import MedicalRecordTimeline from '../components/MedicalRecordTimeline';
import { Skeleton } from '../components/ui/Skeleton';
import { patientsApi } from '../api/endpoints';
import type { MedicalRecord, Patient } from '../types';

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      setError('Identifiant de patient invalide.');
      setLoading(false);
      return;
    }

    Promise.all([
      patientsApi.get(numericId),
      patientsApi.medicalRecords(numericId),
    ])
      .then(([p, r]) => {
        setPatient(p);
        setRecords(r.data);
      })
      .catch(() => setError('Impossible de charger ce patient.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-80" />
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !patient) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error ?? 'Patient introuvable.'}
        </div>
        <Link to="/patients" className="text-primary-600 hover:underline mt-4 inline-block">
          ← Retour à la liste
        </Link>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <Link
          to="/patients"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux patients
        </Link>

        {/* Bandeau patient */}
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Avatar
              firstName={patient.first_name}
              lastName={patient.last_name}
              size="lg"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-800">
                  {patient.full_name}
                </h1>
                {patient.is_archived && (
                  <Badge tone="gray">Archivé</Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="font-mono text-sm text-primary-700">
                  {patient.code}
                </span>
                {patient.age !== null && (
                  <span className="text-sm text-slate-500">
                    · {patient.age} ans
                  </span>
                )}
                {patient.gender && (
                  <span className="text-sm text-slate-500">
                    · {patient.gender === 'M' ? 'Homme' : patient.gender === 'F' ? 'Femme' : 'Autre'}
                  </span>
                )}
              </div>
            </div>

            <Link to={`/patients/${patient.id}/edit`}>
              <Button icon={<Pencil className="w-4 h-4" />}>
                Modifier
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche : infos */}
        <div className="space-y-6">
          {/* Contact */}
          <Card>
            <CardHeader title="Contact" />
            <dl className="space-y-3">
              <InfoRow
                icon={<Phone className="w-4 h-4" />}
                label="Téléphone"
                value={patient.phone}
              />
              <InfoRow
                icon={<MapPin className="w-4 h-4" />}
                label="Adresse"
                value={patient.address}
              />
            </dl>
          </Card>

          {/* Médical */}
          <Card>
            <CardHeader title="Informations médicales" />
            <dl className="space-y-3">
              <InfoRow
                icon={<Droplets className="w-4 h-4" />}
                label="Groupe sanguin"
                value={patient.blood_group}
                valueClass="font-semibold text-red-600"
              />
              <InfoRow
                icon={<Calendar className="w-4 h-4" />}
                label="Date de naissance"
                value={
                  patient.birth_date
                    ? new Date(patient.birth_date).toLocaleDateString('fr-FR')
                    : null
                }
              />
              <InfoRow
                icon={<UserIcon className="w-4 h-4" />}
                label="Âge"
                value={patient.age !== null ? `${patient.age} ans` : null}
              />
            </dl>
          </Card>

          {/* Contact d'urgence */}
          <Card>
            <CardHeader
              title="Contact d'urgence"
              action={<AlertCircle className="w-4 h-4 text-amber-500" />}
            />
            {patient.emergency_contact_name ? (
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                <p className="text-sm font-medium text-slate-800">
                  {patient.emergency_contact_name}
                </p>
                {patient.emergency_contact_phone && (
                  <p className="text-sm text-amber-800 mt-0.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    {patient.emergency_contact_phone}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Non renseigné</p>
            )}
          </Card>
        </div>

        {/* Colonne droite : dossier médical */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats rapides */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MiniStat
              icon={<FileText className="w-4 h-4" />}
              label="Consultations"
              value={records.filter((r) => r.record_type === 'consultation').length}
              color="primary"
            />
            <MiniStat
              icon={<Activity className="w-4 h-4" />}
              label="Examens"
              value={records.filter((r) => r.record_type === 'examen').length}
              color="teal"
            />
            <MiniStat
              icon={<Heart className="w-4 h-4" />}
              label="Vaccins"
              value={records.filter((r) => r.record_type === 'vaccin').length}
              color="emerald"
            />
            <MiniStat
              icon={<AlertCircle className="w-4 h-4" />}
              label="Allergies"
              value={records.filter((r) => r.record_type === 'allergie').length}
              color="amber"
            />
          </div>

          {/* Timeline dossier médical */}
          <Card>
            <CardHeader
              title="Dossier médical"
              subtitle={`${records.length} enregistrement${records.length > 1 ? 's' : ''}`}
              action={
                <Link to={`/consultations/new?patient_id=${patient.id}`}>
                  <Button size="sm" variant="secondary">
                    + Consultation
                  </Button>
                </Link>
              }
            />
            <MedicalRecordTimeline records={records} />
          </Card>
        </div>
      </div>
    </Layout>
  );
}

// ============================================
// Sous-composants
// ============================================

function InfoRow({
  icon,
  label,
  value,
  valueClass = '',
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  valueClass?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <dt className="text-xs text-slate-500">{label}</dt>
        <dd className={`text-sm text-slate-800 mt-0.5 ${valueClass}`}>
          {value ?? <span className="text-slate-400">Non renseigné</span>}
        </dd>
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'primary' | 'teal' | 'emerald' | 'amber';
}) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    teal:    'bg-teal-50 text-teal-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber:   'bg-amber-50 text-amber-600',
  };
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors[color]} mb-2`}>
        {icon}
      </div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-bold text-slate-800">{value}</p>
    </div>
  );
}