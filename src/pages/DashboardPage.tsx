import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import PatientList from '../components/PatientList';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('recibos'); // 'recibos' o 'datos' o 'pacientes'
  const [receiptTab, setReceiptTab] = useState('hoy'); // 'hoy', 'balance', o 'pacientes'
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [institution, setInstitution] = useState<string | null>(null);
  const [receiptsByUnit, setReceiptsByUnit] = useState<any[]>([]);
  const [loadingUnit, setLoadingUnit] = useState(false);
  const [errorUnit, setErrorUnit] = useState<string | null>(null);
  const [receiptsToday, setReceiptsToday] = useState<any[]>([]);
  const [loadingToday, setLoadingToday] = useState(false);
  const [errorToday, setErrorToday] = useState<string | null>(null);

  // Estados para filtros
  const [showFilters, setShowFilters] = useState(false);
  const [attentionTypeFilters, setAttentionTypeFilters] = useState<string[]>([]);
  const [availableAttentionTypes, setAvailableAttentionTypes] = useState<string[]>([]);
  const [selectedSubtypesFilters, setSelectedSubtypesFilters] = useState<string[]>([]); // formato: "main|sub"
  const [enableDateRange, setEnableDateRange] = useState(false);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [printFiltersHeader, setPrintFiltersHeader] = useState(true);

  // Tipos de atención base (coinciden con ReceiptCreatorPage)
  const DEFAULT_ATTENTION_TYPES = [
    'Control de Embarazo',
    'Examenes de laboratorio',
    'Odontologia',
    'Planificacion Familiar',
    'Gratis',
  ];

  // Subtipos (coinciden con ReceiptCreatorPage, solo etiquetas)
  const ATTENTION_SUBTYPES: Record<string, string[]> = {
    'Control de Embarazo': ['Consulta', 'Ultrasonido', 'Monitoreo Fetal'],
    'Examenes de laboratorio': [
      'Paquete de Examenes Laboratorio Embarazos',
      'General Orina',
      'General Heces',
      'Glicemia',
      'Hemograma',
      'Colesterol',
      'Trigliceridos',
      'Acido Urico',
      'TGO',
      'TGP',
      'Otros',
    ],
    'Odontologia': ['Consulta', 'Extraccion', 'Limpieza', 'Tapones'],
    'Planificacion Familiar': [
      'Citologia',
      'Colocacion DIU',
      'Colocacion de Implante',
      'Retiro de implante',
    ],
    'Gratis': ['Partos', 'Servicio de Ambulancia', 'Psicologia'],
  };

  useEffect(() => {
    // Inicializar los tipos disponibles
    setAvailableAttentionTypes(DEFAULT_ATTENTION_TYPES);
  }, []);

  useEffect(() => {
    const fetchUserInstitutionAndReceipts = async () => {
      if (!user) return;
      setLoadingUnit(true);
      setErrorUnit(null);
      setLoadingToday(true);
      setErrorToday(null);

      try {
        // Fetch user's institution
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('institution')
          .eq('id', user.id)
          .single();

        if (userError) throw userError;

        if (userData && userData.institution) {
          setInstitution(userData.institution);

          // Fetch receipts filtered by institution
          const { data: receiptsData, error: receiptsError } = await supabase
            .from('Recibos')
            .select('*')
            .eq('unidad_salud', userData.institution);

          if (receiptsError) throw receiptsError;
          setReceiptsByUnit(receiptsData || []);

          // Fetch today's receipts filtered by institution
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);

          const { data: receiptsTodayData, error: receiptsTodayError } = await supabase
            .from('Recibos')
            .select('*')
            .eq('unidad_salud', userData.institution)
            .gte('fecha_recibo', today.toISOString())
            .lt('fecha_recibo', tomorrow.toISOString());

          if (receiptsTodayError) throw receiptsTodayError;
          setReceiptsToday(receiptsTodayData || []);
        }
      } catch (err: any) {
        console.error('Error fetching user institution or receipts:', err.message);
        setErrorUnit(err.message);
        setErrorToday(err.message);
      } finally {
        setLoadingUnit(false);
        setLoadingToday(false);
      }
    };

    if (user && !authLoading) {
      fetchUserInstitutionAndReceipts();
    }
  }, [user, authLoading]);

  const handlePrintTable = () => {
    const printContent = document.getElementById('balance-general-table');
    if (printContent) {
      const originalContents = document.body.innerHTML;
      const printArea = printContent.cloneNode(true) as HTMLElement;

      // Crear encabezado con filtros aplicados si está habilitado
      if (printFiltersHeader) {
        const header = document.createElement('div');
        header.setAttribute(
          'style',
          'padding:12px 0;margin-bottom:12px;border-bottom:1px solid #000;color:#000;font-family:sans-serif;'
        );

        const parts: string[] = [];
        if (attentionTypeFilters.length) {
          parts.push(`Tipos: ${attentionTypeFilters.join(', ')}`);
        }

        if (selectedSubtypesFilters.length) {
          const groups: Record<string, string[]> = {};
          selectedSubtypesFilters.forEach((key) => {
            const [normMain, normSub] = key.split('|');
            const foundMain = availableAttentionTypes.find(
              (m) => normalizeText(m) === normMain
            );
            const displayMain = foundMain || normMain;
            const subList = ATTENTION_SUBTYPES[foundMain || normMain] || [];
            const foundSub = subList.find((s) => normalizeText(s) === normSub);
            const displaySub = foundSub || normSub;
            if (!groups[displayMain]) groups[displayMain] = [];
            groups[displayMain].push(displaySub);
          });
          const subParts = Object.entries(groups).map(
            ([main, subs]) => `${main}: ${subs.join(', ')}`
          );
          parts.push(`Subcategorías: ${subParts.join(' | ')}`);
        }

        if (enableDateRange && dateFrom && dateTo) {
          const fmt = (s: string) => new Date(s).toLocaleDateString();
          parts.push(`Rango de fechas: ${fmt(dateFrom)} - ${fmt(dateTo)}`);
        }

        header.innerHTML = `
          <div style="font-weight:bold;margin-bottom:4px;">Filtros aplicados</div>
          <div style="font-size:12px;">${parts.length ? parts.join(' • ') : 'Sin filtros'}</div>
        `;

        // Insertar el encabezado al inicio del contenido de impresión
        printArea.insertBefore(header, printArea.firstChild);
      }

      const style = document.createElement('style');
      style.innerHTML = `
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-scheme: light;
          }
          .print-hidden {
            display: none !important;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid black !important;
            color: black !important;
            font-size: 0.8rem !important; /* Smaller font for printing */
            padding: 8px !important;
          }
          thead tr {
            background-color: #e0e0e0 !important; /* Light grey for header */
          }
          .bg-gray-700 {
            background-color: #f0f0f0 !important;
          }
          .bg-gray-800 {
            background-color: white !important;
          }
          .text-gray-200 {
            color: black !important;
          }
          .text-sm {
            font-size: 0.8rem !important;
          }
        }
      `;
      document.head.appendChild(style);

      document.body.innerHTML = printArea.outerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      document.head.removeChild(style);
      window.location.reload(); // Recargar para restaurar los estilos de TailwindCSS
    }
  };

  // Helpers de filtro por Tipo de atencion
  const normalizeText = (s: string): string => {
    if (!s) return '';
    return s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // quitar acentos
      .replace(/[–—−]/g, '-') // normalizar guiones
      .replace(/\s*-\s*/g, '-') // quitar espacios alrededor de guiones
      .replace(/\s+/g, ' ') // colapsar espacios
      .trim();
  };

  const parseMainTypes = (tipo: string): string[] => {
    if (!tipo) return [];
    const t = normalizeText(tipo);
    return t
      .split(',')
      .map((p) => p.split('-')[0]?.trim())
      .filter(Boolean) as string[];
  };

  // Devuelve pares "main|sub" en minúsculas
  const parseMainSubtypePairs = (tipo: string): string[] => {
    if (!tipo) return [];
    const t = normalizeText(tipo);
    return t
      .split(',')
      .map((p) => {
        const [mainRaw, subRaw] = p.split('-');
        const main = (mainRaw || '').trim();
        const sub = (subRaw || '').trim();
        if (!main) return '';
        return sub ? `${main}|${sub}` : `${main}|`;
      })
      .filter(Boolean) as string[];
  };

  const toggleAttentionType = (type: string) => {
    setAttentionTypeFilters((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleSubtype = (main: string, sub: string) => {
    const key = normalizeText(`${main}|${sub}`);
    setSelectedSubtypesFilters((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const selectAllFilters = () => {
    setAttentionTypeFilters(availableAttentionTypes);
    const allPairs: string[] = [];
    availableAttentionTypes.forEach((main) => {
      const subs = ATTENTION_SUBTYPES[main] || [];
      subs.forEach((s) => allPairs.push(normalizeText(`${main}|${s}`)));
    });
    setSelectedSubtypesFilters(allPairs);
  };

  const clearAllFilters = () => {
    setAttentionTypeFilters([]);
    setSelectedSubtypesFilters([]);
    setEnableDateRange(false);
    setDateFrom('');
    setDateTo('');
  };

  const filteredReceiptsByUnit = receiptsByUnit.filter((r) => {
    const text = r.tipo_atencion || '';
    const normalizedText = normalizeText(text);
    const normalizedTextSpaces = normalizedText.replace(/-/g, ' ');

    const mains = parseMainTypes(text); // ya normalizados
    const pairs = parseMainSubtypePairs(text); // ya normalizados (formato main|sub)

    const selectedMains = attentionTypeFilters.map((t) => normalizeText(t));
    const selectedPairs = selectedSubtypesFilters.map((p) => normalizeText(p));

    const matchMain =
      selectedMains.length === 0 ||
      selectedMains.some(
        (sel) =>
          mains.includes(sel) ||
          normalizedText.includes(sel) ||
          normalizedTextSpaces.includes(sel)
      );

    const matchSub =
      selectedPairs.length === 0 ||
      selectedPairs.some((sel) => {
        if (pairs.includes(sel)) return true;
        const hyphenForm = sel.replace('|', '-');
        const spaceForm = sel.replace('|', ' ');
        return (
          normalizedText.includes(hyphenForm) ||
          normalizedTextSpaces.includes(spaceForm)
        );
      });

    let matchDate = true;
    if (enableDateRange && dateFrom && dateTo) {
      const recDate = new Date(r.fecha_recibo);
      const from = new Date(dateFrom);
      const to = new Date(dateTo);
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      matchDate = recDate >= from && recDate <= to;
    }
    return matchMain && matchSub && matchDate;
  });

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8">Panel de Control</h1>

        <div className="flex flex-col mb-6">
          <div className="flex border-b border-gray-700">
            <button
              className={`py-2 px-4 text-lg focus:outline-none ${activeTab === 'recibos' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('recibos')}
            >
              Mis Recibos
            </button>
            <button
              className={`py-2 px-4 text-lg focus:outline-none ${activeTab === 'pacientes' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('pacientes')}
            >
              Mis Pacientes
            </button>
            <button
              className={`py-2 px-4 text-lg focus:outline-none ${activeTab === 'datos' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('datos')}
            >
              Mis Datos
            </button>
          </div>

          {activeTab === 'recibos' && (
            <div>
              <div className="flex border-b border-gray-700 mt-4">
                <button
                  className={`py-2 px-4 text-lg focus:outline-none ${receiptTab === 'hoy' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400 hover:text-white'}`}
                  onClick={() => setReceiptTab('hoy')}
                >
                  Recibos de Hoy
                </button>
                <button
                  className={`py-2 px-4 text-lg focus:outline-none ${receiptTab === 'balance' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400 hover:text-white'}`}
                  onClick={() => setReceiptTab('balance')}
                >
                  Balance General
                </button>
                <button
                  className={`py-2 px-4 text-lg focus:outline-none ${receiptTab === 'pacientes' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400 hover:text-white'}`}
                  onClick={() => setReceiptTab('pacientes')}
                >
                  Pacientes
                </button>
              </div>

              {receiptTab === 'hoy' && (
                <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                  <h2 className="text-2xl font-bold mb-4">Recibos de Hoy</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden" id="recibos-hoy-table">
                      <thead>
                        <tr className="bg-gray-600 text-left text-sm font-semibold text-gray-200">
                          <th className="py-3 px-4">Numero de Recibo</th>
                          <th className="py-3 px-4">Fecha del Recibo</th>
                          <th className="py-3 px-4">Nombre Del Paciente</th>
                          <th className="py-3 px-4">Tipo de Atencion</th>
                          <th className="py-3 px-4 text-right">Monto</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {loadingToday ? (
                          <tr>
                            <td colSpan={5} className="py-3 px-4 text-center text-gray-400">Cargando recibos...</td>
                          </tr>
                        ) : errorToday ? (
                          <tr>
                            <td colSpan={5} className="py-3 px-4 text-center text-red-400">Error: {errorToday}</td>
                          </tr>
                        ) : receiptsToday.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-3 px-4 text-center text-gray-400">No hay recibos del día.</td>
                          </tr>
                        ) : (
                          receiptsToday.map((receipt) => (
                            <tr key={receipt.id} className="border-b border-gray-600 last:border-b-0">
                              <td className="py-3 px-4">{receipt.numero_recibo}</td>
                              <td className="py-3 px-4">{new Date(receipt.fecha_recibo).toLocaleDateString()}</td>
                              <td className="py-3 px-4">{receipt.nombre_paciente}</td>
                              <td className="py-3 px-4">{receipt.tipo_atencion}</td>
                              <td className="py-3 px-4 text-right">L. {receipt.total.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-700">
                          <td colSpan={4} className="py-3 px-4 text-right font-bold text-gray-200 text-sm">Total:</td>
                          <td className="py-3 px-4 text-right font-bold text-gray-200 text-sm">L. {receiptsToday.reduce((sum, receipt) => sum + receipt.total, 0).toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <button
                    onClick={() => navigate('/receipt-creator')}
                    className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg print-hidden"
                  >
                    Nuevo Recibo
                  </button>
                  <button
                    onClick={() => {
                      const printContent = document.getElementById('recibos-hoy-table');
                      if (printContent) {
                        const originalContents = document.body.innerHTML;
                        const printArea = printContent.cloneNode(true);

                        const style = document.createElement('style');
                        style.innerHTML = `
                          @media print {
                            body {
                              -webkit-print-color-adjust: exact;
                              print-color-adjust: exact;
                              color-scheme: light;
                            }
                            .print-hidden {
                              display: none !important;
                            }
                            table {
                              width: 100%;
                              border-collapse: collapse;
                            }
                            th, td {
                              border: 1px solid black !important;
                              color: black !important;
                              font-size: 0.8rem !important;
                              padding: 8px !important;
                            }
                            thead tr {
                              background-color: #e0e0e0 !important;
                            }
                            .bg-gray-700 {
                              background-color: #f0f0f0 !important;
                            }
                            .bg-gray-800 {
                              background-color: white !important;
                            }
                            .text-gray-200 {
                              color: black !important;
                            }
                            .text-sm {
                              font-size: 0.8rem !important;
                            }
                          }
                        `;
                        document.head.appendChild(style);

                        document.body.innerHTML = (printArea as HTMLElement).outerHTML;
                        window.print();
                        document.body.innerHTML = originalContents;
                        document.head.removeChild(style);
                        window.location.reload();
                      }
                    }}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg print-hidden"
                  >
                    Imprimir Tabla
                  </button>
                </div>
              )}
              {receiptTab === 'balance' && (
                <div id="balance-general-table" className="bg-gray-800 p-6 rounded-lg shadow-md">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Balance General</h2>
                    <div className="flex gap-3 print-hidden">
                      <button
                        onClick={() => setShowFilters((s) => !s)}
                        className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg"
                      >
                        {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
                      </button>
                      <button
                        onClick={handlePrintTable}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                      >
                        Imprimir Tabla
                      </button>
                    </div>
                  </div>

                  {showFilters && (
                    <div className="bg-gray-700 p-4 rounded-lg mb-4 print-hidden">
                      <h3 className="text-lg font-semibold mb-2">Rango de Fechas</h3>
                      <div className="flex items-center gap-4 mb-4 flex-wrap">
                        <label className="inline-flex items-center gap-2">
                          <span className="text-sm">Activar</span>
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-blue-600"
                            checked={enableDateRange}
                            onChange={(e) => setEnableDateRange(e.target.checked)}
                          />
                        </label>
                        {enableDateRange && (
                          <div className="flex items-center gap-3 flex-wrap">
                            <label className="text-xs text-gray-300">Desde</label>
                            <input
                              type="date"
                              value={dateFrom}
                              onChange={(e) => setDateFrom(e.target.value)}
                              className="bg-gray-600 text-white rounded px-2 py-1 text-sm"
                            />
                            <label className="text-xs text-gray-300">Hasta</label>
                            <input
                              type="date"
                              value={dateTo}
                              onChange={(e) => setDateTo(e.target.value)}
                              className="bg-gray-600 text-white rounded px-2 py-1 text-sm"
                            />
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Filtrar por Tipo de Atención</h3>
                      <div className="flex flex-wrap gap-4">
                        {availableAttentionTypes.map((type) => (
                          <label key={type} className="inline-flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4 text-blue-600"
                              checked={attentionTypeFilters.includes(type)}
                              onChange={() => toggleAttentionType(type)}
                            />
                            <span className="text-sm">{type}</span>
                          </label>
                        ))}
                      </div>

                      <h3 className="text-lg font-semibold mt-4 mb-2">Filtrar por Subcategoría</h3>
                      <div className="space-y-3">
                        {availableAttentionTypes.map((main) => (
                          <div key={main} className="bg-gray-600/40 rounded p-3">
                            <div className="font-semibold text-sm mb-2">
                              {main}
                            </div>
                            <div className="flex flex-wrap gap-3">
                              {(ATTENTION_SUBTYPES[main] || []).map((sub) => {
                                const key = normalizeText(`${main}|${sub}`);
                                return (
                                  <label key={key} className="inline-flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      className="form-checkbox h-4 w-4 text-blue-600"
                                      checked={selectedSubtypesFilters.includes(key)}
                                      onChange={() => toggleSubtype(main, sub)}
                                    />
                                    <span className="text-xs">{sub}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={clearAllFilters}
                          className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-1 px-3 rounded"
                        >
                          Limpiar filtros
                        </button>
                        <button
                          onClick={selectAllFilters}
                          className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-1 px-3 rounded"
                        >
                          Seleccionar todo
                        </button>
                      </div>
                      <div className="mt-4 flex items-center gap-3">
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-blue-600"
                            checked={printFiltersHeader}
                            onChange={(e) => setPrintFiltersHeader(e.target.checked)}
                          />
                          <span className="text-sm">Añadir A Encabezado de Impresión</span>
                        </label>
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto mt-4">
                    <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-gray-600 text-left text-sm font-semibold text-gray-200">
                          <th className="py-3 px-4 border border-gray-600">Numero de Recibo</th>
                          <th className="py-3 px-4 border border-gray-600">Fecha del Recibo</th>
                          <th className="py-3 px-4 border border-gray-600">Nombre Del Paciente</th>
                          <th className="py-3 px-4 border border-gray-600">Tipo de Atencion</th>
                          <th className="py-3 px-4 text-right text-sm w-1/5 border border-gray-600">Monto</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {loadingUnit ? (
                          <tr>
                            <td colSpan={5} className="py-3 px-4 text-center text-gray-400">Cargando recibos...</td>
                          </tr>
                        ) : errorUnit ? (
                          <tr>
                            <td colSpan={5} className="py-3 px-4 text-center text-red-400">Error: {errorUnit}</td>
                          </tr>
                        ) : receiptsByUnit.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-3 px-4 text-center text-gray-400">No hay recibos disponibles para su institución.</td>
                          </tr>
                        ) : filteredReceiptsByUnit.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-3 px-4 text-center text-gray-400">No hay recibos que coincidan con el filtro seleccionado.</td>
                          </tr>
                        ) : (
                          filteredReceiptsByUnit.map((receipt) => (
                            <tr key={receipt.id} className="border-b border-gray-600 last:border-b-0">
                              <td className="py-3 px-4 border border-gray-600">{receipt.numero_recibo}</td>
                              <td className="py-3 px-4 border border-gray-600">{new Date(receipt.fecha_recibo).toLocaleDateString()}</td>
                              <td className="py-3 px-4 border border-gray-600">{receipt.nombre_paciente}</td>
                              <td className="py-3 px-4 border border-gray-600">{receipt.tipo_atencion}</td>
                              <td className="py-3 px-4 text-right border border-gray-600">L. {receipt.total.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>
                          ))
                        )}
                        <tr className="bg-gray-700">
                          <td colSpan={4} className="py-3 px-4 text-right font-bold text-gray-200 text-sm border border-gray-600">Total:</td>
                          <td className="py-3 px-4 text-right font-bold text-gray-200 text-sm border border-gray-600">L. {filteredReceiptsByUnit.reduce((sum, receipt) => sum + receipt.total, 0).toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {receiptTab === 'pacientes' && (
                <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                  <h2 className="text-2xl font-bold mb-4">Pacientes</h2>
                  <PatientList />
                </div>
              )}
            </div>
          )}
          {activeTab === 'pacientes' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Pacientes</h2>
              <PatientList />
            </div>
          )}
          {activeTab === 'mensajes' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Mensajes</h2>
              {/* Contenido de mensajes */}
              <p>Aquí irá la lista de mensajes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
