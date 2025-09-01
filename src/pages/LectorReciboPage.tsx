import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const LectorReciboPage = () => {
  const { id } = useParams();
  const [recibo, setRecibo] = useState<any>(null);
  const [paciente, setPaciente] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    padding: 2, // cm
    fontSize: 16, // px
    boxColor: '#fde047', // amarillo por defecto
    gap: 16, // px
  });

  useEffect(() => {
    const fetchRecibo = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('Recibos')
          .select('*')
          .eq('id', id)
          .single();
        if (fetchError) throw fetchError;
        setRecibo(data);
        if (data && data.paciente_id) {
          const { data: pacienteData } = await supabase
            .from('pacientes')
            .select('*')
            .eq('id', data.paciente_id)
            .single();
          setPaciente(pacienteData);
        }
      } catch (err: any) {
        setError('No se pudo cargar el recibo.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchRecibo();
  }, [id]);

  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const win = window.open('', '', 'width=800,height=1000');
      if (win) {
        win.document.write('<html><head><title>Imprimir Recibo</title>');
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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Cargando...</div>;
  if (error || !recibo) return <div className="min-h-screen flex items-center justify-center text-red-400">{error || 'Recibo no encontrado.'}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col items-center justify-center p-4">
      <div className="mb-6 w-full max-w-4xl flex justify-between">
        <button onClick={() => navigate(-1)} className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg">Volver</button>
        <div className="flex gap-2">
          <button onClick={() => setShowSettings(true)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-xl shadow-lg transition-all duration-200">Ajustes</button>
          <button onClick={handlePrint} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-8 rounded-xl shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2">Imprimir Recibo</button>
        </div>
      </div>
      {/* Modal de Ajustes */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white text-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowSettings(false)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl">×</button>
            <h2 className="text-2xl font-bold mb-4">Ajustes de Recibo</h2>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Márgenes (cm)</label>
              <input type="number" min="0" max="5" step="0.1" value={settings.padding} onChange={e => setSettings(s => ({ ...s, padding: parseFloat(e.target.value) }))} className="w-full border rounded px-2 py-1" />
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Tamaño de letra (px)</label>
              <input type="number" min="10" max="32" value={settings.fontSize} onChange={e => setSettings(s => ({ ...s, fontSize: parseInt(e.target.value) }))} className="w-full border rounded px-2 py-1" />
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Color de los cuadros</label>
              <input type="color" value={settings.boxColor} onChange={e => setSettings(s => ({ ...s, boxColor: e.target.value }))} className="w-16 h-8 border rounded" />
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Espacio entre elementos (px)</label>
              <input type="number" min="0" max="48" value={settings.gap} onChange={e => setSettings(s => ({ ...s, gap: parseInt(e.target.value) }))} className="w-full border rounded px-2 py-1" />
            </div>
            <button onClick={() => setShowSettings(false)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded mt-2">Cerrar</button>
          </div>
        </div>
      )}
      <div
        ref={printRef}
        className="bg-white text-gray-900 carta shadow-xl flex flex-col items-start justify-start border border-black"
        style={{ width: '21.59cm', height: '27.94cm', padding: `${settings.padding}cm`, boxSizing: 'border-box', marginBottom: '1.5rem', borderRadius: '0.5rem', fontSize: `${settings.fontSize}px`, gap: `${settings.gap}px` }}
      >
        <div className="w-full flex flex-row justify-between items-start mb-8">
          <div className="text-2xl font-bold">DOCSALUD HN</div>
          <div className="flex flex-row items-center gap-2">
            <span className="font-bold text-xl">RECIBO #</span>
            <span className="bg-yellow-300 px-6 py-1 rounded text-xl font-bold border border-black">{recibo.numero_recibo}</span>
          </div>
        </div>
        <div className="mb-4">
          <span className="font-bold">UNIDAD DE SALUD:</span>
          <span className="bg-yellow-300 px-4 py-1 ml-2 rounded border border-black inline-block min-w-[300px] align-middle">{recibo.unidad_salud}</span>
        </div>
        <div className="mb-8">
          <span className="font-bold">NOMBRE DEL PACIENTE:</span>
          <span className="bg-yellow-300 px-4 py-1 ml-2 rounded border border-black inline-block min-w-[300px] align-middle">{recibo.nombre_paciente}</span>
        </div>
        {paciente && (
          <>
            <div className="mb-4">
              <span className="font-bold">NÚMERO DE EXPEDIENTE:</span>
              <span style={{ background: settings.boxColor }} className="px-4 py-1 ml-2 rounded border border-black inline-block min-w-[200px] align-middle">{paciente.numero_expediente}</span>
            </div>
            <div className="mb-4">
              <span className="font-bold">NÚMERO DE IDENTIDAD:</span>
              <span style={{ background: settings.boxColor }} className="px-4 py-1 ml-2 rounded border border-black inline-block min-w-[200px] align-middle">{paciente.numero_identidad}</span>
            </div>
            <div className="mb-4">
              <span className="font-bold">DIRECCIÓN:</span>
              <span style={{ background: settings.boxColor }} className="px-4 py-1 ml-2 rounded border border-black inline-block min-w-[200px] align-middle">{paciente.direccion}</span>
            </div>
            <div className="mb-4">
              <span className="font-bold">TELÉFONO:</span>
              <span style={{ background: settings.boxColor }} className="px-4 py-1 ml-2 rounded border border-black inline-block min-w-[200px] align-middle">{paciente.telefono}</span>
            </div>
            <div className="mb-4">
              <span className="font-bold">EDAD:</span>
              <span style={{ background: settings.boxColor }} className="px-4 py-1 ml-2 rounded border border-black inline-block min-w-[100px] align-middle">{paciente.edad}</span>
            </div>
          </>
        )}
        <div className="font-bold mb-2">PAGO POR:</div>
        <table className="w-full border border-black mb-2" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th className="border border-black p-2 text-left">DESCRIPCION</th>
              <th className="border border-black p-2 text-left">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {recibo.tipo_atencion?.split(',').map((desc: string, idx: number) => {
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
          <span className="bg-yellow-300 px-4 py-1 ml-2 rounded border border-black inline-block min-w-[300px] align-middle">{recibo.excepciones}</span>
        </div>
        <div className="w-full flex flex-row justify-between items-center mt-8">
          <div className="font-bold">TOTAL</div>
          <div className="bg-yellow-300 px-8 py-1 rounded border border-black font-bold text-lg">L. {recibo.total !== undefined && recibo.total !== null ? Number(recibo.total).toFixed(2) : '0.00'}</div>
        </div>
        <div className="w-full flex flex-row justify-end items-center mt-12">
          <span className="font-bold mr-2">FECHA:</span>
          <span className="bg-yellow-300 px-8 py-1 rounded border border-black">{recibo.fecha_recibo}</span>
        </div>
      </div>
    </div>
  );
};

export default LectorReciboPage; 