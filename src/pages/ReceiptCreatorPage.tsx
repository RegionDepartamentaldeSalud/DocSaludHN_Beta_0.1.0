import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const ReceiptCreatorPage = () => {
  const [receiptNumber, setReceiptNumber] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [healthUnit, setHealthUnit] = useState('');
  const [patientName, setPatientName] = useState('');
  const [attentionTypes, setAttentionTypes] = useState([
    'Control de Embarazo',
    'Examenes de laboratorio',
    'Odontologia',
    'Planificacion Familiar',
    'Gratis',
  ]);
  const [selectedAttentionTypes, setSelectedAttentionTypes] = useState<string[]>([]);
  const [exceptions, setExceptions] = useState('');
  const [otherException, setOtherException] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSavedReceipt, setLastSavedReceipt] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [expediente, setExpediente] = useState('');
  const [identidad, setIdentidad] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [edad, setEdad] = useState('');

  const attentionSubtypes: Record<string, { label: string; price: number }[]> = {
    'Control de Embarazo': [
      { label: 'Consulta', price: 10 },
      { label: 'Ultrasonido', price: 150 },
      { label: 'Monitoreo Fetal', price: 100 },
    ],
    'Examenes de laboratorio': [
      { label: 'Paquete de Examenes Laboratorio Embarazos', price: 400 },
      { label: 'General Orina', price: 80 },
      { label: 'General Heces', price: 80 },
      { label: 'Glicemia', price: 80 },
      { label: 'Hemograma', price: 80 },
      { label: 'Colesterol', price: 80 },
      { label: 'Trigliceridos', price: 80 },
      { label: 'Acido Urico', price: 80 },
      { label: 'TGO', price: 80 },
      { label: 'TGP', price: 80 },
      { label: 'Otros', price: 80 },
    ],
    'Odontologia': [
      { label: 'Consulta', price: 20 },
      { label: 'Extraccion', price: 50 },
      { label: 'Limpieza', price: 200 },
      { label: 'Tapones', price: 200 },
    ],
    'Planificacion Familiar': [
      { label: 'Citologia', price: 20 },
      { label: 'Colocacion DIU', price: 20 },
      { label: 'Colocacion de Implante', price: 50 },
      { label: 'Retiro de implante', price: 100 },
    ],
    'Gratis': [
      { label: 'Partos', price: 0 },
      { label: 'Servicio de Ambulancia', price: 0 },
      { label: 'Psicologia', price: 0 },
    ],
  };

  const [selectedSubtypes, setSelectedSubtypes] = useState<{ [key: string]: string[] }>({});

  useEffect(() => {
    // Set current date
    const today = new Date();
    setCurrentDate(today.toLocaleDateString());

    // Fetch user's institution y el siguiente número de recibo
    const fetchUserDataAndNextReceipt = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (user) {
          const { data, error: profileError } = await supabase
            .from('users')
            .select('institution')
            .eq('id', user.id)
            .single();

          if (profileError) throw profileError;
          if (data) {
            setHealthUnit(data.institution);
            // Buscar el siguiente número de recibo para esta unidad
            const { data: recibos, error: recibosError } = await supabase
              .from('Recibos')
              .select('numero_recibo')
              .eq('unidad_salud', data.institution);
            if (recibosError) throw recibosError;
            let nextNumber = '1';
            if (recibos && recibos.length > 0) {
              // Convertir todos los numeros a número y buscar el mayor
              const max = recibos
                .map((r: any) => Number(r.numero_recibo))
                .filter((n: number) => !isNaN(n) && isFinite(n))
                .reduce((a: number, b: number) => Math.max(a, b), 0);
              nextNumber = (max + 1).toString();
            }
            setReceiptNumber(nextNumber);
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndNextReceipt();
  }, []);

  // Autocompletar datos del paciente al escribir el número de expediente
  useEffect(() => {
    const buscarPacientePorExpediente = async () => {
      if (expediente.trim() === '' || !healthUnit) return;
      const { data: paciente, error } = await supabase
        .from('pacientes')
        .select('*')
        .eq('numero_expediente', expediente.trim())
        .eq('unidad_salud', healthUnit)
        .single();
      if (paciente) {
        setPatientName(paciente.nombre || '');
        setIdentidad(paciente.numero_identidad || '');
        setDireccion(paciente.direccion || '');
        setTelefono(paciente.telefono || '');
        setEdad(paciente.edad ? paciente.edad.toString() : '');
      }
    };
    buscarPacientePorExpediente();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expediente, healthUnit]);

  const handleAddAttentionType = (type: string) => {
    if (!selectedAttentionTypes.includes(type)) {
      setSelectedAttentionTypes([...selectedAttentionTypes, type]);
    }
  };

  const handleRemoveAttentionType = (type: string) => {
    setSelectedAttentionTypes(selectedAttentionTypes.filter(t => t !== type));
  };

  const handleSubtypeChange = (type: string, subtype: string) => {
    setSelectedSubtypes((prev) => {
      const current = prev[type] || [];
      if (current.includes(subtype)) {
        return { ...prev, [type]: current.filter((s) => s !== subtype) };
      } else {
        return { ...prev, [type]: [...current, subtype] };
      }
    });
  };

  const getSubtypePrice = (type: string, subtype: string) => {
    const found = attentionSubtypes[type]?.find((s) => s.label === subtype);
    return found ? found.price : 0;
  };

  // Si hay excepción seleccionada, el total es 0
  const hayExcepcion = exceptions && exceptions !== '';
  const totalCalculado = Object.entries(selectedSubtypes)
    .reduce((acc, [type, subs]) => {
      return (
        acc +
        subs.reduce((sum, sub) => sum + getSubtypePrice(type, sub), 0)
      );
    }, 0);
  const totalFactura = hayExcepcion ? 0 : totalCalculado;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setError(null);
    try {
      // Guardar paciente si no existe
      let pacienteId = null;
      const { data: pacienteExistente } = await supabase
        .from('pacientes')
        .select('id')
        .eq('numero_expediente', expediente)
        .eq('unidad_salud', healthUnit)
        .single();
      if (!pacienteExistente) {
        const { data: nuevoPaciente, error: errorNuevoPaciente } = await supabase
          .from('pacientes')
          .insert([{
            nombre: patientName,
            numero_expediente: expediente,
            numero_identidad: identidad,
            direccion: direccion,
            telefono: telefono,
            edad: edad ? parseInt(edad, 10) : null,
            unidad_salud: healthUnit,
          }])
          .select()
          .single();
        if (errorNuevoPaciente) throw errorNuevoPaciente;
        pacienteId = nuevoPaciente.id;
      } else {
        pacienteId = pacienteExistente.id;
      }
      // ... resto del guardado del recibo ...
      const excepcionFinal = exceptions === 'Otros (Especificar)' ? otherException : exceptions;
      const detalles = Object.entries(selectedSubtypes)
        .flatMap(([type, subs]) =>
          subs.map(sub => {
            const price = getSubtypePrice(type, sub);
            return `${type} - ${sub} (L. ${price})`;
          })
        ).join(', ');
      const receiptData = {
        numero_recibo: receiptNumber || 'N/A',
        fecha_recibo: new Date().toISOString().slice(0, 10),
        unidad_salud: healthUnit,
        nombre_paciente: patientName,
        tipo_atencion: detalles,
        excepciones: excepcionFinal,
        total: totalFactura,
        paciente_id: pacienteId,
      };
      const { error: insertError } = await supabase.from('Recibos').insert([receiptData]);
      if (insertError) throw insertError;
      setSuccessMsg('¡Recibo guardado exitosamente!');
      setLastSavedReceipt(receiptData);
      // Opcional: limpiar campos si lo deseas
      // setPatientName(''); setSelectedAttentionTypes([]); setExceptions(''); setOtherException(''); setSelectedSubtypes({});
    } catch (err: any) {
      setError(err.message || 'Error al guardar el recibo');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const win = window.open('', '', 'width=800,height=1000');
      if (win) {
        win.document.write('<html><head><title>Imprimir Recibo</title>');
        // Inyectar Tailwind desde CDN y estilos personalizados
        win.document.write('<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">');
        win.document.write('<style>body{margin:0;} .carta{width:21.59cm;height:27.94cm;padding:2cm;background:#fff;color:#222;font-family:sans-serif;} h2{text-align:center;} .campo{margin-bottom:1.2em;} .etiqueta{font-weight:bold;} @media print { body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }</style>');
        win.document.write('</head><body>');
        win.document.write(printContents);
        win.document.write('</body></html>');
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); win.close(); }, 500);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-4">
        <p>Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-4">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-0">
      <div className="flex flex-col md:flex-row gap-4 w-full max-w-full items-start justify-center">
        {/* Formulario a la izquierda */}
        <div className="flex-1 w-full md:max-w-2xl">
          <div className="backdrop-blur-lg bg-gray-800/70 border border-purple-500/30 hover:border-purple-400/60 transition-all duration-300 p-8 rounded-lg shadow-2xl">
            <h1 className="text-4xl font-extrabold mb-8 text-center drop-shadow-lg tracking-wide">Creador de Recibos</h1>
            <form onSubmit={handleSave}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Numero de Recibo */}
                <div>
                  <label htmlFor="receiptNumber" className="block text-purple-300 text-sm font-semibold mb-2 tracking-wide">Número de Recibo</label>
                  <input
                    type="text"
                    id="receiptNumber"
                    className="shadow-md border-none rounded-xl w-full py-2.5 px-4 text-gray-200 bg-gray-700/80 focus:ring-2 focus:ring-purple-500 focus:bg-gray-800/80 transition-all duration-200 placeholder-gray-400 outline-none"
                    value={receiptNumber}
                    readOnly
                  />
                </div>
                {/* Fecha */}
                <div>
                  <label htmlFor="date" className="block text-purple-300 text-sm font-semibold mb-2 tracking-wide">Fecha</label>
                  <input
                    type="text"
                    id="date"
                    className="shadow-md border-none rounded-xl w-full py-2.5 px-4 text-gray-200 bg-gray-700/80 focus:ring-2 focus:ring-purple-500 focus:bg-gray-800/80 transition-all duration-200 placeholder-gray-400 outline-none"
                    value={currentDate}
                    readOnly
                  />
                </div>
                {/* Unidad de Salud */}
                <div className="md:col-span-2">
                  <label htmlFor="healthUnit" className="block text-purple-300 text-sm font-semibold mb-2 tracking-wide">Unidad de Salud</label>
                  <input
                    type="text"
                    id="healthUnit"
                    className="shadow-md border-none rounded-xl w-full py-2.5 px-4 text-gray-200 bg-gray-700/80 focus:ring-2 focus:ring-purple-500 focus:bg-gray-800/80 transition-all duration-200 placeholder-gray-400 outline-none"
                    value={healthUnit}
                    readOnly
                  />
                </div>
                {/* Nombre del Paciente */}
                <div className="md:col-span-2">
                  <label htmlFor="patientName" className="block text-purple-300 text-sm font-semibold mb-2 tracking-wide">Nombre del Paciente</label>
                  <input
                    type="text"
                    id="patientName"
                    className="shadow-md border-none rounded-xl w-full py-2.5 px-4 text-gray-200 bg-gray-700/80 focus:ring-2 focus:ring-purple-500 focus:bg-gray-800/80 transition-all duration-200 placeholder-gray-400 outline-none"
                    placeholder="Ingrese el nombre del paciente"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                  />
                </div>
                {/* Numero de Expediente */}
                <div>
                  <label htmlFor="expediente" className="block text-purple-300 text-sm font-semibold mb-2 tracking-wide">Número de Expediente</label>
                  <input
                    type="text"
                    id="expediente"
                    className="shadow-md border-none rounded-xl w-full py-2.5 px-4 text-gray-200 bg-gray-700/80 focus:ring-2 focus:ring-purple-500 focus:bg-gray-800/80 transition-all duration-200 placeholder-gray-400 outline-none"
                    placeholder="Ingrese el número de expediente"
                    value={expediente}
                    onChange={(e) => setExpediente(e.target.value)}
                  />
                </div>
                {/* Numero de Identidad */}
                <div>
                  <label htmlFor="identidad" className="block text-purple-300 text-sm font-semibold mb-2 tracking-wide">Número de Identidad</label>
                  <input
                    type="text"
                    id="identidad"
                    className="shadow-md border-none rounded-xl w-full py-2.5 px-4 text-gray-200 bg-gray-700/80 focus:ring-2 focus:ring-purple-500 focus:bg-gray-800/80 transition-all duration-200 placeholder-gray-400 outline-none"
                    placeholder="Ingrese el número de identidad"
                    value={identidad}
                    onChange={(e) => setIdentidad(e.target.value)}
                  />
                </div>
                {/* Direccion */}
                <div className="md:col-span-2">
                  <label htmlFor="direccion" className="block text-purple-300 text-sm font-semibold mb-2 tracking-wide">Dirección</label>
                  <input
                    type="text"
                    id="direccion"
                    className="shadow-md border-none rounded-xl w-full py-2.5 px-4 text-gray-200 bg-gray-700/80 focus:ring-2 focus:ring-purple-500 focus:bg-gray-800/80 transition-all duration-200 placeholder-gray-400 outline-none"
                    placeholder="Ingrese la dirección"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                  />
                </div>
                {/* Telefono */}
                <div>
                  <label htmlFor="telefono" className="block text-purple-300 text-sm font-semibold mb-2 tracking-wide">Número de Teléfono</label>
                  <input
                    type="text"
                    id="telefono"
                    className="shadow-md border-none rounded-xl w-full py-2.5 px-4 text-gray-200 bg-gray-700/80 focus:ring-2 focus:ring-purple-500 focus:bg-gray-800/80 transition-all duration-200 placeholder-gray-400 outline-none"
                    placeholder="Ingrese el número de teléfono"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                  />
                </div>
                {/* Edad */}
                <div>
                  <label htmlFor="edad" className="block text-purple-300 text-sm font-semibold mb-2 tracking-wide">Edad</label>
                  <input
                    type="number"
                    id="edad"
                    className="shadow-md border-none rounded-xl w-full py-2.5 px-4 text-gray-200 bg-gray-700/80 focus:ring-2 focus:ring-purple-500 focus:bg-gray-800/80 transition-all duration-200 placeholder-gray-400 outline-none"
                    placeholder="Ingrese la edad"
                    value={edad}
                    onChange={(e) => setEdad(e.target.value)}
                    min="0"
                  />
                </div>
                {/* Tipo de Atención múltiple */}
                <div className="md:col-span-2">
                  <label className="block text-purple-300 text-sm font-semibold mb-2 tracking-wide">Tipo de Atención</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {attentionTypes.map(type => (
                      <button
                        type="button"
                        key={type}
                        className={`px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all duration-150 ${selectedAttentionTypes.includes(type) ? 'bg-purple-600 border-purple-700 text-white' : 'bg-gray-700/80 border-gray-500 text-gray-200 hover:bg-purple-700 hover:text-white'}`}
                        onClick={() => handleAddAttentionType(type)}
                        disabled={selectedAttentionTypes.includes(type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  {/* Mostrar tipos seleccionados */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedAttentionTypes.map(type => (
                      <span key={type} className="flex items-center bg-purple-200 text-purple-900 px-3 py-1 rounded-full text-xs font-semibold">
                        {type}
                        <button
                          type="button"
                          className="ml-2 text-purple-700 hover:text-red-600 font-bold"
                          onClick={() => handleRemoveAttentionType(type)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  {/* Subtipos para cada tipo seleccionado */}
                  {selectedAttentionTypes.map(type => (
                    <div key={type} className="mb-4 ml-2">
                      <div className="font-semibold text-purple-400 mb-1">Opciones de {type}:</div>
                      <div className="flex flex-wrap gap-2">
                        {attentionSubtypes[type]?.map(sub => (
                          <label key={sub.label} className="flex items-center gap-1 bg-gray-700/60 px-2 py-1 rounded-lg cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedSubtypes[type]?.includes(sub.label) || false}
                              onChange={() => handleSubtypeChange(type, sub.label)}
                              className="accent-purple-600"
                            />
                            <span>{sub.label} <span className="text-xs text-gray-300">L. {sub.price}</span></span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Excepciones */}
                <div className="md:col-span-2">
                  <label htmlFor="exceptions" className="block text-purple-300 text-sm font-semibold mb-2 tracking-wide">Excepciones</label>
                  <select
                    id="exceptions"
                    className="shadow-md border-none rounded-xl w-full py-2.5 px-4 text-gray-200 bg-gray-700/80 focus:ring-2 focus:ring-purple-500 focus:bg-gray-800/80 transition-all duration-200 outline-none"
                    value={exceptions}
                    onChange={(e) => setExceptions(e.target.value)}
                  >
                    <option value="">Seleccione una excepción</option>
                    <option value="Escasos Recursos">Escasos Recursos</option>
                    <option value="Tercera Edad">Tercera Edad</option>
                    <option value="Otros (Especificar)">Otros (Especificar)</option>
                  </select>
                  {exceptions === 'Otros (Especificar)' && (
                    <input
                      type="text"
                      className="mt-3 shadow-md border-none rounded-xl w-full py-2.5 px-4 text-gray-200 bg-gray-700/80 focus:ring-2 focus:ring-purple-500 focus:bg-gray-800/80 transition-all duration-200 placeholder-gray-400 outline-none"
                      placeholder="Especifique la excepción"
                      value={otherException}
                      onChange={e => setOtherException(e.target.value)}
                    />
                  )}
                </div>
                {/* Totalizador de Factura */}
                <div className="md:col-span-2 mt-8">
                  <h2 className="text-3xl font-extrabold text-center text-purple-200 drop-shadow-lg">Total de la Factura: L. {totalFactura.toFixed(2)}</h2>
                </div>
                {/* Botón Guardar */}
                <div className="md:col-span-2 flex justify-center mt-6">
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={saving || !patientName.trim() || selectedAttentionTypes.length === 0}
                  >
                    {saving ? 'Guardando...' : 'Guardar Recibo'}
                  </button>
                </div>
                {/* Mensajes de éxito o error */}
                {successMsg && (
                  <div className="md:col-span-2 mt-4 text-center text-green-400 font-semibold">{successMsg}</div>
                )}
                {error && (
                  <div className="md:col-span-2 mt-4 text-center text-red-400 font-semibold">{error}</div>
                )}
              </div>
            </form>
          </div>
        </div>
        {/* Recibo imprimible a la derecha */}
        <div className="flex-1 flex flex-col items-center">
          <div
            ref={printRef}
            className="bg-white text-gray-900 carta shadow-xl flex flex-col items-start justify-start border border-black"
            style={{ width: '21.59cm', height: '27.94cm', padding: '2cm', boxSizing: 'border-box', marginBottom: '1.5rem', borderRadius: '0.5rem' }}
          >
            <div className="w-full flex flex-row justify-between items-start mb-8">
              <div className="text-2xl font-bold">DOCSALUD HN</div>
              <div className="flex flex-row items-center gap-2">
                <span className="font-bold text-xl">RECIBO #</span>
                <span className="bg-yellow-300 px-6 py-1 rounded text-xl font-bold border border-black">{lastSavedReceipt?.numero_recibo || ''}</span>
              </div>
            </div>
            <div className="mb-4">
              <span className="font-bold">UNIDAD DE SALUD:</span>
              <span className="bg-yellow-300 px-4 py-1 ml-2 rounded border border-black inline-block min-w-[300px] align-middle">{lastSavedReceipt?.unidad_salud || ''}</span>
            </div>
            <div className="mb-8">
              <span className="font-bold">NOMBRE DEL PACIENTE:</span>
              <span className="bg-yellow-300 px-4 py-1 ml-2 rounded border border-black inline-block min-w-[300px] align-middle">{lastSavedReceipt?.nombre_paciente || ''}</span>
            </div>
            <div className="font-bold mb-2">PAGO POR:</div>
            <table className="w-full border border-black mb-2" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th className="border border-black p-2 text-left">DESCRIPCION</th>
                  <th className="border border-black p-2 text-left">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {lastSavedReceipt?.tipo_atencion?.split(',').map((desc: string, idx: number) => {
                  // Extraer precio si está en el string
                  const match = desc.match(/\(L\.\s*([\d.]+)\)/);
                  const price = match ? parseFloat(match[1]) : 0;
                  return (
                  <tr key={idx} className="bg-yellow-300">
                      <td className="border border-black p-2">{desc.replace(/\(L\.\s*[\d.]+\)/, '').trim()}</td>
                      <td className="border border-black p-2">L. {price.toFixed(2)}</td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="w-full border-t border-black mb-2"></div>
            <div className="mb-2">
              <span className="font-bold">Excepciones:</span>
              <span className="bg-yellow-300 px-4 py-1 ml-2 rounded border border-black inline-block min-w-[300px] align-middle">{lastSavedReceipt?.excepciones || ''}</span>
            </div>
            <div className="w-full flex flex-row justify-between items-center mt-8">
              <div className="font-bold">TOTAL</div>
              <div className="bg-yellow-300 px-8 py-1 rounded border border-black font-bold text-lg">L. {lastSavedReceipt?.total?.toFixed(2) || '0.00'}</div>
            </div>
            <div className="w-full flex flex-row justify-end items-center mt-12">
              <span className="font-bold mr-2">FECHA:</span>
              <span className="bg-yellow-300 px-8 py-1 rounded border border-black">{lastSavedReceipt?.fecha_recibo || ''}</span>
            </div>
            <div className="mb-4">
              <span className="font-bold">NÚMERO DE EXPEDIENTE:</span>
              <span className="bg-yellow-300 px-4 py-1 ml-2 rounded border border-black inline-block min-w-[200px] align-middle">{lastSavedReceipt?.numero_expediente || expediente}</span>
            </div>
            <div className="mb-4">
              <span className="font-bold">NÚMERO DE IDENTIDAD:</span>
              <span className="bg-yellow-300 px-4 py-1 ml-2 rounded border border-black inline-block min-w-[200px] align-middle">{lastSavedReceipt?.numero_identidad || identidad}</span>
            </div>
            <div className="mb-4">
              <span className="font-bold">DIRECCIÓN:</span>
              <span className="bg-yellow-300 px-4 py-1 ml-2 rounded border border-black inline-block min-w-[200px] align-middle">{lastSavedReceipt?.direccion || direccion}</span>
            </div>
            <div className="mb-4">
              <span className="font-bold">TELÉFONO:</span>
              <span className="bg-yellow-300 px-4 py-1 ml-2 rounded border border-black inline-block min-w-[200px] align-middle">{lastSavedReceipt?.telefono || telefono}</span>
            </div>
            <div className="mb-4">
              <span className="font-bold">EDAD:</span>
              <span className="bg-yellow-300 px-4 py-1 ml-2 rounded border border-black inline-block min-w-[100px] align-middle">{lastSavedReceipt?.edad || edad}</span>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-8 rounded-xl shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={!lastSavedReceipt}
          >
            Imprimir Recibo
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptCreatorPage;
