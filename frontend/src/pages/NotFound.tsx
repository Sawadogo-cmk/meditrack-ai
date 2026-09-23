import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-6">
          <Search className="w-10 h-10" />
        </div>
        <p className="text-6xl font-bold text-primary-900 mb-2">404</p>
        <h1 className="text-xl font-semibold text-slate-800 mb-2">
          Page introuvable
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <Link to="/dashboard">
          <Button icon={<Home className="w-4 h-4" />}>
            Retour au tableau de bord
          </Button>
        </Link>
      </div>
    </div>
  );
}