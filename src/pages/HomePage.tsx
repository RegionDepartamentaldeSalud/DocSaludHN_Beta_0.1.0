import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Database, 
  MapPin, 
  Users, 
  BarChart3, 
  Shield, 
  ArrowRight,
  CheckCircle,
  Zap,
  Globe
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const HomePage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleComenzar = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center px-4 sm:px-6 lg:px-8 py-24">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute top-3/4 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow delay-2000"></div>
        </div>

        <div className="relative max-w-4xl md:max-w-7xl mx-auto text-center min-w-[700px]">
          {/* Main Hero Content */}
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-blue-200 text-sm font-medium mb-6">
              <Zap className="h-4 w-4 mr-2" />
              Transformando la gestión en salud
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                FACTUSALUD
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed">
              Factusalud es una herramienta para ayudar a secretaría de salud y a sus diferentes 
              instalaciones en la generación de facturas y una base de datos completa de los 
              pacientes en los diferentes municipios del departamento.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={handleComenzar}
              className="group relative px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25"
            >
              <span className="flex items-center">
                Comenzar Ahora
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </button>
            
            <Link
              to="/login"
              className="px-6 py-3 sm:px-8 sm:py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              Iniciar Sesión
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { number: '50+', label: 'Municipios' },
              { number: '1000+', label: 'Pacientes' },
              { number: '24/7', label: 'Disponibilidad' },
              { number: '99.9%', label: 'Confiabilidad' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Características Principales
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Una plataforma integral diseñada para modernizar y optimizar la gestión 
              de salud en todo el departamento.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: 'Facturación Inteligente',
                description: 'Generación automática de facturas con validación en tiempo real y cumplimiento normativo.'
              },
              {
                icon: Database,
                title: 'Base de Datos Unificada',
                description: 'Centralización de información de pacientes con acceso seguro y actualización en tiempo real.'
              },
              {
                icon: MapPin,
                title: 'Gestión Municipal',
                description: 'Control descentralizado por municipios con reportes específicos y análisis locales.'
              },
              {
                icon: Users,
                title: 'Gestión de Pacientes',
                description: 'Historiales médicos completos, seguimiento de tratamientos y alertas automáticas.'
              },
              {
                icon: BarChart3,
                title: 'Análisis y Reportes',
                description: 'Dashboards interactivos con métricas en tiempo real y reportes personalizables.'
              },
              {
                icon: Shield,
                title: 'Seguridad Avanzada',
                description: 'Encriptación de extremo a extremo, auditorías y cumplimiento de normativas sanitarias.'
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="group relative p-4 sm:p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-1000"></div>
                <div className="relative">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-blue-100">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                Beneficios para tu Institución
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Transforma la gestión de salud con tecnología de vanguardia y procesos optimizados.
              </p>
              
              <div className="space-y-4">
                {[
                  'Reducción del 80% en tiempo de facturación',
                  'Eliminación de errores en registros médicos',
                  'Acceso instantáneo a información de pacientes',
                  'Cumplimiento automático de normativas',
                  'Reportes gerenciales en tiempo real',
                  'Integración con sistemas existentes'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
                    <span className="text-blue-100">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-100">Eficiencia Operacional</span>
                    <span className="text-2xl font-bold text-green-400">+85%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full w-[85%]"></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-blue-100">Reducción de Errores</span>
                    <span className="text-2xl font-bold text-green-400">-92%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full w-[92%]"></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-blue-100">Satisfacción del Personal</span>
                    <span className="text-2xl font-bold text-green-400">+95%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-400 to-cyan-500 h-2 rounded-full w-[95%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-12">
            <Globe className="h-16 w-16 text-blue-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
              ¿Listo para Transformar tu Gestión de Salud?
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              Únete a las instituciones que ya confían en FACTUSALUD para optimizar 
              sus procesos y brindar mejor atención a sus pacientes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                Solicitar Demo Gratuita
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                Acceder al Sistema
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;