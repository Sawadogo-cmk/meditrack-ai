import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { extractErrorMessage } from '../api/client';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [email, setEmail] = useState('admin@meditrack.test');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Colonne gauche : branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary-900 via-primary-700 to-accent-500 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
              <span className="text-white font-bold text-2xl">M</span>
            </div>
            <span className="font-bold text-white text-xl">MediTrack AI</span>
          </div>

          <div className="max-w-md">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 mb-6">
              <Activity className="w-8 h-8 text-accent-300" />
            </div>

            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Des données de santé,
              <br />
              <span className="text-accent-300">un meilleur demain.</span>
            </h1>

            <p className="text-white/70 text-base leading-relaxed mb-8">
              Centralisez la gestion de votre établissement de santé :
              patients, médecins, rendez-vous, consultations et dossiers
              médicaux, dans une seule plateforme sécurisée.
            </p>

            <div className="space-y-3">
              <Feature text="Gestion centralisée des patients" />
              <Feature text="Suivi médical complet et sécurisé" />
              <Feature text="Intelligence artificielle intégrée" />
            </div>
          </div>

          <div className="flex items-center gap-2 text-white/50 text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Données chiffrées · Conforme à la confidentialité médicale</span>
          </div>
        </div>
      </div>

      {/* Colonne droite : formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="font-bold text-primary-900 text-lg">MediTrack AI</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Bon retour 👋</h2>
            <p className="text-sm text-slate-500 mt-1">
              Connectez-vous à votre espace professionnel
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="relative">
              <Input
                label="Adresse email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@etablissement.com"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-[38px] pointer-events-none" />
            </div>

            <div className="relative">
              <Input
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 transition"
                aria-label={showPassword ? 'Masquer' : 'Afficher'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2.5 rounded-lg animate-fade-in">
                {error}
              </div>
            )}

            <Button
              type="submit"
              loading={isLoading}
              className="w-full justify-center"
              size="lg"
              icon={!isLoading ? <ArrowRight className="w-4 h-4" /> : undefined}
            >
              {isLoading ? 'Connexion…' : 'Se connecter'}
            </Button>
          </form>

          <div className="mt-6 p-3 bg-primary-50 border border-primary-100 rounded-lg">
            <p className="text-xs text-primary-800 font-medium mb-1">
              🎯 Compte de démonstration
            </p>
            <p className="text-xs text-primary-700 font-mono">
              admin@meditrack.test / password
            </p>
          </div>

          <p className="text-center text-xs text-slate-400 mt-8">
            © 2026 MediTrack AI · Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 rounded-full bg-accent-400/20 flex items-center justify-center shrink-0">
        <div className="w-2 h-2 rounded-full bg-accent-300" />
      </div>
      <span className="text-white/80 text-sm">{text}</span>
    </div>
  );
}