import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const PatientList = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
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

  // Obtener pacientes del establecimiento
  useEffect(() => {
    const fetchPatients = async () => {
      if (!institution) return;
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('pacientes')
          .select('*')
          .eq('unidad_salud', institution)
          .order('nombre', { ascending: true });
        if (error) throw error;
        setPatients(data || []);
      } catch (err: any) {
        setError('Error al cargar los pacientes.');
      } finally {
        setLoading(false);
      }
    };

    if (institution) fetchPatients();
  }, [institution]);

  const handleSearch = (event: any) => {
    setSearchTerm(event.target.value);
  };

  const handlePatientClick = (patient: any) => {
    navigate(`/patient/${patient.id}`, { state: { patient } });
  };

  const filteredPatients = patients.filter(patient =>
    patient.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Lista de Pacientes del Establecimiento</h2>
      <input
        type="text"
        placeholder="Buscar paciente por nombre..."
        className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white mb-4"
        onChange={handleSearch}
        value={searchTerm}
      />
      {loading ? (
        <div className="text-gray-400">Cargando pacientes...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : filteredPatients.length === 0 ? (
        <div className="text-gray-400">
          {searchTerm ? 'No se encontraron pacientes con ese nombre.' : 'No hay pacientes registrados en este establecimiento.'}
        </div>
      ) : (
        <div className="bg-gray-700 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-600">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Número de Expediente
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Identidad
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Edad
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-700 divide-y divide-gray-600">
              {filteredPatients.map((patient) => (
                <tr 
                  key={patient.id} 
                  className="hover:bg-gray-600 cursor-pointer transition-colors" 
                  onClick={() => handlePatientClick(patient)}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-white font-medium">
                    {patient.nombre}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                    {patient.numero_expediente}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                    {patient.numero_identidad}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                    {patient.edad} años
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PatientList;
