import { Link, useLocation } from 'react-router-dom';
import { Search, User, Sparkles, Languages, Book } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthProvider';

export function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, login, logout } = useAuth();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname === '/processing' || location.pathname === '/reader';

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="bg-surface/30 backdrop-blur-xl border-b border-white/10 top-0 sticky z-50 shadow-[0_0_20px_rgba(73,75,214,0.1)]">
      <nav className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-secondary to-primary rounded-lg shadow-lg flex items-center justify-center">
              <Book className="w-5 h-5 text-white" />
            </div>
            <span className="font-headline text-lg font-extrabold tracking-tighter">SUMMARIZER <span className="font-light opacity-60">AI</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-8 ml-4">
            <Link 
              to="/dashboard" 
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest transition-colors",
                location.pathname === '/dashboard' ? "text-secondary border-b border-secondary pb-1" : "opacity-60 hover:opacity-100"
              )}
            >
              {t('nav.dashboard')}
            </Link>
            <a className="text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-colors" href="#">Docs</a>
            <a className="text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-colors" href="#">{t('nav.pricing')}</a>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Language Selector */}
          <div className="flex items-center gap-2 group relative">
            <Languages className="w-4 h-4 text-on-surface-variant group-hover:text-primary transition-colors" />
            <select 
              value={i18n.language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-transparent text-[10px] uppercase font-bold tracking-widest border-none focus:ring-0 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
            >
              <option value="en" className="bg-surface text-white">EN</option>
              <option value="fr" className="bg-surface text-white">FR</option>
              <option value="es" className="bg-surface text-white">ES</option>
            </select>
          </div>

          {isDashboard && (
            <div className="hidden lg:relative lg:block">
              <input 
                className="bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-2 w-64 focus:outline-none focus:border-primary/50 transition-all text-xs" 
                placeholder={t('nav.search')} 
                type="text"
              />
              <Search className="absolute right-3 top-2.5 w-4 h-4 text-on-surface-variant" />
            </div>
          )}
          
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full border border-primary/20" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
                    <User className="w-4 h-4" />
                  </div>
                )}
                <span className="hidden md:block text-[10px] uppercase font-bold opacity-60 max-w-[100px] truncate">{user.displayName || user.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout} className="text-[10px] uppercase font-bold text-red-400">Logout</Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={login} className="text-[10px] uppercase font-bold">{t('nav.login')}</Button>
              <Button variant="primary" size="md" onClick={login}>Sign Up</Button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
