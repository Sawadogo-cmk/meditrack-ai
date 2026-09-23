import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Stethoscope, ClipboardList, Calendar, User } from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import { Skeleton } from '../components/ui/Skeleton';
import { consultationsApi } from '../api/endpoints';
import type { Consultation } from '../types';

export default function ConsultationDetail() {
  const { id } = useParams<{ id: string }>();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      setError('Identifiant invalide.');
      setLoading(false);
      return;
    }

    consultationsApi
      .get(numericId)
      .then(setConsultation)
      .catch(() => setError('Impossible de charger cette consultation.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </Layout>
    );
  }

  if (error || !consultation) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error ?? 'Consultation introuvable.'}
        </div>
        <Link to="/consultations" className="text-primary-600 hover:underline mt-4 inline-block">
          ← Retour aux consultations
        </Link>
      </Layout>
    );
  }

  const date = new Date(consultation.consultation_date);
  const formatted = date.toLocaleString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Layout>
      <div className="mb-6">
        <Link
          to="/consultations"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux consultations
        </Link>

        <PageHeader
          title="Consultation"
          subtitle={formatted}
        />
      </div>

      {/* Bandeau : patient + médecin */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {consultation.patient && (
          <Card>
            <div className="flex items-center gap-3">
              <Avatar
                firstName={consultation.patient.full_name.split(' ')[0] ?? '?'}
                lastName={consultation.patient.full_name.split(' ').slice(1).join(' ') ?? '?'}
              />
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Patient</p>
                <Link
                  to={`/patients/${consultation.patient.id}`}
                  className="font-medium text-slate-800 hover:text-primary-700 transition"
                >
                  {consultation.patient.full_name}
                </Link>
                <p className="text-xs text-slate-500 font-mono">
                  {consultation.patient.code}
                </p>
              </div>
            </div>
          </Card>
        )}

        {consultation.doctor && (
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Médecin</p>
                <p className="font-medium text-slate-800">
                  {consultation.doctor.full_name}
                </p>
                <p className="text-xs text-slate-500">{consultation.doctor.speciality}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Motif + observations */}
      <div className="space-y-6">
        {consultation.motif && (
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="font-semibold text-slate-800">Motif de consultation</h2>
            </div>
            <p className="text-sm text-slate-700">{consultation.motif}</p>
          </Card>
        )}

        {consultation.observations && (
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                <User className="w-4 h-4" />
              </div>
              <h2 className="font-semibold text-slate-800">Observations cliniques</h2>
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {consultation.observations}
            </p>
          </Card>
        )}

        {consultation.diagnostic && (
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <ClipboardList className="w-4 h-4" />
              </div>
              <h2 className="font-semibold text-slate-800">Diagnostic</h2>
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {consultation.diagnostic}
            </p>
          </Card>
        )}

        {consultation.traitement && (
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <ClipboardList className="w-4 h-4" />
              </div>
              <h2 className="font-semibold text-slate-800">Traitement prescrit</h2>
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {consultation.traitement}
            </p>
          </Card>
        )}

        {consultation.notes && (
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="font-semibold text-slate-800">Notes internes</h2>
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {consultation.notes}
            </p>
          </Card>
        )}

        {consultation.appointment && (
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="font-semibold text-slate-800">Rendez-vous lié</h2>
            </div>
            <p className="text-sm text-slate-700">
              RDV #{consultation.appointment.id} ·{' '}
              {new Date(consultation.appointment.scheduled_at).toLocaleString('fr-FR')}
            </p>
          </Card>
        )}
      </div>
    </Layout>
  );
}