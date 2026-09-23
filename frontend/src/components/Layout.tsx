import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Building2,
  CalendarDays,
  FileText,
  Menu,
  X,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import Avatar from './ui/Avatar';
import { cn } from '../utils/cn';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/dashboard',     label: 'Tableau de bord', icon: LayoutDashboard },
  { path: '/patients',      label: 'Patients',        icon: Users },
  { path: '/doctors',       label: 'Médecins',        icon: Stethoscope },
  { path: '/services',      label: 'Services',        icon: Building2 },
  { path: '/appointments',  label: 'Rendez-vous',     icon: CalendarDays },
  { path: '/consultations', label: 'Consultations',   icon: FileText },
];

export default function Layout({ children }: LayoutProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Ferme le menu mobile à chaque changement de page
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Ferme le dropdown user au clic extérieur
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ============ HEADER ============ */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-accent-500 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="font-bold text-primary-900 hidden sm:block">
                MediTrack AI
              </span>
            </Link>

            {/* Nav desktop */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors',
                      active
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-100'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Dropdown user (desktop) */}
              <div className="relative hidden sm:block" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 transition"
                >
                  {user && (
                    <Avatar
                      firstName={user.first_name}
                      lastName={user.last_name}
                      size="sm"
                    />
                  )}
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium text-slate-800 leading-tight">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-slate-500 leading-tight capitalize">
                      {user?.role?.label}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg border border-slate-200 shadow-lg py-1 animate-fade-in">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-800">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>

              {/* Burger mobile */}
              <button
                onClick={() => setMobileOpen((o) => !o)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition"
                aria-label="Menu"
              >
                {mobileOpen ? (
                  <X className="w-5 h-5 text-slate-700" />
                ) : (
                  <Menu className="w-5 h-5 text-slate-700" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Nav mobile */}
        {mobileOpen && (
          <nav className="lg:hidden border-t border-slate-200 bg-white animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors',
                      active
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-slate-700 hover:bg-slate-100'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}

              {/* User + logout sur mobile */}
              <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {user && (
                    <Avatar
                      firstName={user.first_name}
                      lastName={user.last_name}
                      size="sm"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">
                      {user?.role?.label}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* ============ MAIN ============ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}