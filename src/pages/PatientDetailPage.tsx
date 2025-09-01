import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const PatientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [patient, setPatient] = useState<any>(null);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [institution, setInstitution] = useState<string | null>(null);

  // Obtener la institución del usuario
  useEffect(() => {
    const fetchInstitution = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('users')
          .select('institution')
          .eq('id', user.id)
          .single();
        if (error) throw error;
        setInstitution(data?.institution || null);
      } catch (err: any) {
        setError('Error al obtener la institución.');
      }
    };
    if (user) fetchInstitution();
  }, [user]);

  // Obtener información del paciente y sus recibos
  useEffect(() => {
    const fetchPatientData = async () => {
      if (!id || !institution) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Obtener información del paciente
        const { data: patientData, error: patientError } = await supabase
          .from('pacientes')
          .select('*')
          .eq('id', id)
          .eq('unidad_salud', institution)
          .single();
        
        if (patientError) throw patientError;
        setPatient(patientData);

        // Obtener recibos del paciente
        const { data: receiptsData, error: receiptsError } = await supabase
          .from('Recibos')
          .select('*')
          .eq('nombre_paciente', patientData.nombre)
          .eq('unidad_salud', institution)
          .order('fecha_recibo', { ascending: false });
        
        if (receiptsError) throw receiptsError;
        setReceipts(receiptsData || []);
        
      } catch (err: any) {
        setError('Error al cargar la información del paciente.');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id && institution) fetchPatientData();
  }, [id, institution]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p>Cargando información del paciente...</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Paciente no encontrado'}</p>
          <button
            onClick={handleBack}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            ← Volver
          </button>
          <h1 className="text-4xl font-bold text-center">Información del Paciente</h1>
          <div className="w-24"></div> {/* Espaciador para centrar el título */}
        </div>

        {/* Información del Paciente */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-6 text-purple-300">Datos Personales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Nombre Completo</label>
              <p className="text-lg text-white font-semibold">{patient.nombre}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Número de Expediente</label>
              <p className="text-lg text-white font-semibold">{patient.numero_expediente}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Número de Identidad</label>
              <p className="text-lg text-white font-semibold">{patient.numero_identidad}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Edad</label>
              <p className="text-lg text-white font-semibold">{patient.edad} años</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Dirección</label>
              <p className="text-lg text-white font-semibold">{patient.direccion}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Teléfono</label>
              <p className="text-lg text-white font-semibold">{patient.telefono}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Establecimiento</label>
              <p className="text-lg text-white font-semibold">{patient.unidad_salud}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Fecha de Registro</label>
              <p className="text-lg text-white font-semibold">
                {new Date(patient.created_at).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Historial de Recibos */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-purple-300">Historial de Recibos</h2>
          
          {receipts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-lg">Este paciente no tiene recibos registrados.</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-gray-300">
                  Total de recibos: <span className="text-purple-400 font-bold">{receipts.length}</span>
                </p>
                <p className="text-gray-300">
                  Total facturado: <span className="text-green-400 font-bold">
                    L. {receipts.reduce((acc, r) => acc + (Number(r.total) || 0), 0).toFixed(2)}
                  </span>
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Número de Recibo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Tipo de Atención
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Excepciones
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {receipts.map((receipt, idx) => (
                      <tr key={receipt.id} className={`${idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}`}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                          #{receipt.numero_recibo}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          {new Date(receipt.fecha_recibo).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300 max-w-xs">
                          <div className="truncate" title={receipt.tipo_atencion}>
                            {receipt.tipo_atencion}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          {receipt.excepciones || 'Ninguna'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-green-400">
                          L. {Number(receipt.total).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetailPage;
