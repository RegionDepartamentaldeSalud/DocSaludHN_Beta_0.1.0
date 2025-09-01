import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Menu, X, User, UserPlus, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [fullName, setFullName] = useState<string | null>(null);

  useEffect(() => {
    const fetchFullName = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', user.id)
          .single();
        if (data && data.full_name) {
          setFullName(data.full_name);
        } else {
          setFullName(null);
        }
      } else {
        setFullName(null);
      }
    };
    fetchFullName();
  }, [user]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="relative z-50">
      <div className="absolute inset-0 bg-white/10 backdrop-blur-md border-b border-white/20"></div>
      <div className="relative w-full px-10">
        <div className="flex justify-between items-center py-4">
          {/* Botón de menú lateral solo si el usuario está autenticado */}
          {user && (
            <button
              onClick={() => setDrawerOpen(true)}
              className="mr-4 p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors duration-300"
              aria-label="Abrir menú"
              style={{ position: 'relative', left: 0 }}
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-display font-bold text-white">
                DOCSALUD HN
              </span>
              <span className="text-xs text-blue-200 font-medium">
                Gestión Inteligente
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                isActive('/') 
                  ? 'bg-white/20 text-white' 
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              Inicio
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-white font-semibold cursor-pointer hover:underline" onClick={() => window.location.href = '/user_page'}>
                  Hola, {fullName || user.user_metadata?.full_name || user.email}!
                </span>
                <button
                  onClick={signOut}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-4 py-2 text-blue-100 hover:text-white transition-colors duration-300"
                >
                  <User className="h-4 w-4" />
                  <span>Iniciar Sesión</span>
                </Link>
                
                <Link
                  to="/register"
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Registrarse</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors duration-300"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Drawer lateral */}
        {user && drawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Fondo oscuro con transición */}
            <div className="fixed inset-0 bg-black/40 transition-opacity duration-300 ease-in-out" onClick={() => setDrawerOpen(false)}></div>
            {/* Panel lateral animado */}
            <div
              className="relative h-full shadow-2xl flex flex-col"
              style={{
                width: '19rem',
                maxWidth: '100vw',
                animation: 'slideInLeft 0.35s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              <div className="bg-gradient-to-br from-purple-900/90 via-slate-900/90 to-blue-900/90 backdrop-blur-xl h-full w-full rounded-r-2xl border-r-4 border-purple-700 shadow-2xl flex flex-col p-6 relative">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-purple-200/30 transition-colors"
                  aria-label="Cerrar menú"
                >
                  <X className="h-6 w-6 text-purple-200" />
                </button>
                <nav className="mt-8 flex flex-col gap-4">
                  <Link to="/" onClick={() => setDrawerOpen(false)} className="text-lg font-semibold text-white hover:text-purple-300 transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-white/10">Inicio</Link>
                  <Link to="/dashboard" onClick={() => setDrawerOpen(false)} className="text-lg font-semibold text-white hover:text-purple-300 transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-white/10">Panel de Control</Link>
                  <Link to="/terminos" onClick={() => setDrawerOpen(false)} className="text-lg font-semibold text-white hover:text-purple-300 transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-white/10">Términos y Condiciones</Link>
                  <Link to="/mensajes" onClick={() => setDrawerOpen(false)} className="text-lg font-semibold text-white hover:text-purple-300 transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-white/10">Mensajes</Link>
                  <Link to="/settings" onClick={() => setDrawerOpen(false)} className="text-lg font-semibold text-white hover:text-purple-300 transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-white/10">Ajustes</Link>
                </nav>
              </div>
            </div>
            {/* Animación keyframes */}
            <style>{`
              @keyframes slideInLeft {
                0% { transform: translateX(-100%); opacity: 0; }
                100% { transform: translateX(0); opacity: 1; }
              }
            `}</style>
          </div>
        )}

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 mt-2 mx-4">
            <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4 space-y-3">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive('/') 
                    ? 'bg-white/20 text-white' 
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
              >
                Inicio
              </Link>
              {user ? (
                <button
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-red-100 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 w-full justify-start"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                  >
                    <User className="h-4 w-4" />
                    <span>Iniciar Sesión</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg transition-all duration-300"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Registrarse</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;