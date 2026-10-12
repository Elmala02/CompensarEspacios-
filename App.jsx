import React, { useState } from 'react';
import { NotificationFactory } from './NotificationFactory';

/**
 * =========================================================================
 * COMPONENTE PRINCIPAL: UCOMPENSAR ESPACIOS (REACT + TAILWIND CSS)
 * =========================================================================
 * Cumple estrictamente con:
 * 1. Clean Corporate Minimalist (Flat + sutil profundidad Z, sin degradados).
 * 2. Paleta Estricta: bg-orange-500, bg-white, bg-gray-50, border-gray-800 para rechazados (SIN ROJOS/AZULES/VERDES).
 * 3. Layout milimétrico:
 *    - Navbar h-16 bg-white border-b-4 border-orange-500
 *    - Sidebar w-64 bg-orange-500 con hover:bg-orange-600 y border-l-4 border-white
 *    - Main flex-1 bg-gray-50 p-8
 *    - Cards bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6 con border-t-[3px] border-orange-500
 *    - Botones Primarios y Secundarios corporativos
 * 4. Antipatrones de usabilidad intencionales:
 *    - Login fallido silencioso (Estudiante)
 *    - Calendario anti-intuitivo (Días libres y ocupados idénticos en estilo)
 *    - Franjas horarias ocultas (Dependencia abrupta no anunciada)
 * 5. Notificaciones Factory Method flotantes
 */

export default function App() {
  // Navegación
  const [activeView, setActiveView] = useState('reservation');

  // Usuario activo
  const [currentUser, setCurrentUser] = useState({
    name: 'Prof. Carlos Mendoza',
    role: 'Docente de Ingeniería',
    initials: 'CM'
  });

  // Notificaciones Toasts (Instanciadas por Factory Method)
  const [toasts, setToasts] = useState([]);

  const addNotification = (type, title, message) => {
    const toastObj = NotificationFactory.create(type, title, message);
    setToasts((prev) => [...prev, toastObj]);

    // Descarte automático en 4.5s
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== toastObj.id));
    }, 4500);
  };

  const removeNotification = (id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  };

  // Estado del Formulario de Reserva
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [purpose, setPurpose] = useState('');

  // Problemática 2: Datos del calendario anti-intuitivo
  // Disponibilidad interna oculta: todas las celdas comparten exactamente la misma apariencia
  const calendarDays = [
    { day: 1, available: false }, { day: 2, available: true }, { day: 3, available: false },
    { day: 4, available: false }, { day: 5, available: true }, { day: 6, available: true },
    { day: 7, available: false }, { day: 8, available: false }, { day: 9, available: false },
    { day: 10, available: true }, { day: 11, available: true }, { day: 12, available: false },
    { day: 13, available: true }, { day: 14, available: true }, { day: 15, available: false },
    { day: 16, available: false }, { day: 17, available: true }, { day: 18, available: true },
    { day: 19, available: false }, { day: 20, available: true }, { day: 21, available: true },
    { day: 22, available: false }, { day: 23, available: false }, { day: 24, available: true },
    { day: 25, available: true }, { day: 26, available: false }, { day: 27, available: true },
    { day: 28, available: true }, { day: 29, available: false }, { day: 30, available: true }
  ];

  // Problemática 1: Login silencioso para estudiantes
  const [loginRole, setLoginRole] = useState('Docente');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginLoading(true);

    if (loginRole === 'Estudiante') {
      // FALLO SILENCIOSO INTENCIONAL:
      // El spinner se detiene y no muestra ningún error ni advertencia al estudiante
      setTimeout(() => {
        setLoginLoading(false);
      }, 1800);
    } else {
      // ACCESO PERMITIDO (Docente / Coordinador)
      setTimeout(() => {
        setLoginLoading(false);
        const newName = loginRole === 'Docente' ? 'Prof. Carlos Mendoza' : 'Ing. Laura Pardo (Admin)';
        const newRole = loginRole === 'Docente' ? 'Docente de Ingeniería' : 'Coordinación Infraestructura';
        const newInitials = loginRole === 'Docente' ? 'CM' : 'LP';

        setCurrentUser({ name: newName, role: newRole, initials: newInitials });
        addNotification('aprobada', 'Sesión Autorizada', `Bienvenido al sistema institucional, ${newName}.`);
        setActiveView('reservation');
      }, 1200);
    }
  };

  // Manejo de Reserva
  const handleReservationSubmit = () => {
    if (!selectedRoom || !selectedDate || !selectedSlot) {
      addNotification(
        'rechazada',
        'Campos Incompletos',
        'Debe seleccionar un salón, fecha y franja horaria para tramitar la reserva.'
      );
      return;
    }

    const dayInfo = calendarDays.find((d) => d.day === selectedDate);
    if (dayInfo && !dayInfo.available) {
      // Consecuencia del calendario sin jerarquía visual: el usuario solo se entera al radicar
      addNotification(
        'rechazada',
        'Espacio No Disponible',
        `El espacio ${selectedRoom} ya se encuentra ocupado en la fecha seleccionada. Elija otro día.`
      );
    } else {
      addNotification(
        'aprobada',
        'Reserva Radicada',
        `Solicitud aprobada con éxito para ${selectedRoom} (Noviembre ${selectedDate}, 2026).`
      );
      handleResetReservation();
    }
  };

  const handleResetReservation = () => {
    setSelectedBuilding('');
    setSelectedRoom('');
    setSelectedDate(null);
    setSelectedSlot('');
    setPurpose('');
  };

  // Determinar si se revelan las franjas horarias ocultas (Problemática 3)
  const isTimeSlotRevealed = Boolean(selectedRoom && selectedDate);

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden font-['Inter',sans-serif] bg-gray-50 text-gray-900 antialiased">
      
      {/* =========================================================================
          A. BARRA SUPERIOR (NAVBAR)
          h-16, bg-white, border-b-4 border-orange-500
          ========================================================================= */}
      <header className="h-16 w-full bg-white border-b-4 border-orange-500 flex items-center justify-between px-8 z-30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-extrabold text-lg">U</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-gray-900 leading-none">
              UCompensar <span className="text-orange-500 font-bold">Espacios</span>
            </span>
            <span className="text-[10px] text-gray-500 font-normal tracking-wide uppercase mt-0.5">
              Campus Virtual & Físico
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span>Periodo Académico Activo: <strong className="text-gray-900">2026-I</strong></span>
          </div>

          <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-gray-900 leading-tight">{currentUser.name}</p>
              <p className="text-[11px] text-gray-500 font-normal">{currentUser.role}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-500 flex items-center justify-center text-orange-500 font-bold text-sm shadow-sm transition-all duration-200 ease-in-out hover:shadow-md cursor-pointer">
              <span>{currentUser.initials}</span>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          LAYOUT INFERIOR: SIDEBAR + CONTENIDO PRINCIPAL
          ========================================================================= */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* =========================================================================
            B. MENÚ LATERAL (SIDEBAR)
            w-64, bg-orange-500, sin bordes externos.
            Hover: bg-orange-600 + border-l-4 border-white
            ========================================================================= */}
        <aside className="w-64 bg-orange-500 flex flex-col justify-between py-6 flex-shrink-0 select-none">
          <div className="flex flex-col space-y-1">
            <div className="px-6 pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white opacity-75">
                Módulos Académicos
              </span>
            </div>

            <button
              onClick={() => setActiveView('reservation')}
              className={`w-full text-left px-6 py-3.5 text-sm font-semibold text-white flex items-center gap-3 transition-all duration-200 ease-in-out ${
                activeView === 'reservation'
                  ? 'bg-orange-600 border-l-4 border-white shadow-sm'
                  : 'hover:bg-orange-600 hover:border-l-4 hover:border-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Reservar Espacio</span>
            </button>

            <button
              onClick={() => setActiveView('login')}
              className={`w-full text-left px-6 py-3.5 text-sm font-semibold text-white flex items-center gap-3 transition-all duration-200 ease-in-out ${
                activeView === 'login'
                  ? 'bg-orange-600 border-l-4 border-white shadow-sm'
                  : 'hover:bg-orange-600 hover:border-l-4 hover:border-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Acceso Institucional</span>
            </button>

            <button
              onClick={() => setActiveView('audit')}
              className={`w-full text-left px-6 py-3.5 text-sm font-semibold text-white flex items-center gap-3 transition-all duration-200 ease-in-out ${
                activeView === 'audit'
                  ? 'bg-orange-600 border-l-4 border-white shadow-sm'
                  : 'hover:bg-orange-600 hover:border-l-4 hover:border-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Diagnóstico UX</span>
            </button>
          </div>

          {/* Gatilladores de Prueba para Notificaciones */}
          <div className="px-6 pt-4 border-t border-orange-400 border-opacity-40">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white opacity-80 mb-3">
              Prueba Factory Method
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => addNotification('aprobada', 'Notificación Aprobada', 'Demostración de toast con borde y tipografía naranja.')}
                className="w-full py-2 px-3 text-xs font-semibold text-orange-500 bg-white rounded-lg shadow-sm hover:bg-orange-50 transition-all duration-200 ease-in-out text-center"
              >
                Toast Aprobada
              </button>
              <button
                onClick={() => addNotification('rechazada', 'Notificación Rechazada', 'Demostración con borde gris muy oscuro sin uso de rojo.')}
                className="w-full py-2 px-3 text-xs font-semibold text-gray-900 bg-white rounded-lg shadow-sm hover:bg-gray-100 transition-all duration-200 ease-in-out text-center"
              >
                Toast Rechazada
              </button>
            </div>
          </div>
        </aside>

        {/* =========================================================================
            C. ÁREA DE CONTENIDO PRINCIPAL
            flex-1, bg-gray-50, p-8, overflow-y-auto
            ========================================================================= */}
        <main className="flex-1 bg-gray-50 p-8 overflow-y-auto">
          
          {/* VISTA 1: RESERVA DE ESPACIOS */}
          {activeView === 'reservation' && (
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
                  Reserva y Asignación de Espacios
                </h1>
                <p className="text-sm font-normal text-gray-500 mt-1">
                  Diligencia los requerimientos para programar laboratorios, aulas magistrales y salas de cómputo.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* COLUMNA IZQUIERDA: ESPACIO Y CALENDARIO (7 Cols) */}
                <div className="lg:col-span-7 flex flex-col">
                  
                  {/* CARD 1: SELECCIÓN DE ESPACIO */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="border-t-[3px] border-orange-500 p-6 pb-4">
                      <h2 className="text-lg font-extrabold tracking-tight text-gray-900">
                        1. Selección de Espacio Físico
                      </h2>
                      <p className="text-xs font-normal text-gray-500 mt-0.5">
                        Indica el bloque y tipo de ambiente requerido para la sesión académica.
                      </p>
                    </div>

                    <div className="p-6 pt-0 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                            Edificio / Sede
                          </label>
                          <select
                            value={selectedBuilding}
                            onChange={(e) => setSelectedBuilding(e.target.value)}
                            className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg p-3 focus:outline-none focus:border-orange-500 transition-all duration-200"
                          >
                            <option value="">Seleccione Edificio...</option>
                            <option value="A">Edificio A - Ingenierías y TI</option>
                            <option value="B">Edificio B - Ciencias Administrativas</option>
                            <option value="C">Edificio C - Innovación y Talleres</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                            Salón / Laboratorio
                          </label>
                          <select
                            value={selectedRoom}
                            onChange={(e) => setSelectedRoom(e.target.value)}
                            className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg p-3 focus:outline-none focus:border-orange-500 transition-all duration-200"
                          >
                            <option value="">Seleccione Salón...</option>
                            <option value="Lab 301 - Redes y Ciberseguridad">Lab 301 - Redes y Ciberseguridad (Cap. 35)</option>
                            <option value="Lab 302 - Desarrollo de Software">Lab 302 - Desarrollo de Software (Cap. 40)</option>
                            <option value="Auditorio Central">Auditorio Central (Cap. 120)</option>
                            <option value="Aula 204 - Magistral">Aula 204 - Magistral (Cap. 45)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: CALENDARIO ANTI-INTUITIVO (PROBLEMÁTICA UX) */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="border-t-[3px] border-orange-500 p-6 pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-extrabold tracking-tight text-gray-900">
                            2. Fecha de Ocupación
                          </h2>
                          <p className="text-xs font-normal text-gray-500 mt-0.5">
                            Selecciona el día programado en la malla académica.
                          </p>
                        </div>
                        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg">
                          Noviembre 2026
                        </span>
                      </div>
                    </div>

                    <div className="p-6 pt-2">
                      <div className="mb-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-[11px] text-gray-500 flex items-center justify-between">
                        <span>Estado de selección:</span>
                        <span className="font-bold text-gray-900">
                          {selectedDate ? `Noviembre ${selectedDate}, 2026` : 'Ninguna fecha seleccionada'}
                        </span>
                      </div>

                      {/* Cabecera de días */}
                      <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
                        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, idx) => (
                          <span key={idx} className="text-[11px] font-bold text-gray-500 py-1">{d}</span>
                        ))}
                      </div>

                      {/*
                        PROBLEMÁTICA INTENCIONAL: Días libres y ocupados idénticos visualmente.
                        Clases Tailwind compartidas: text-gray-700 bg-white border border-gray-200
                      */}
                      <div className="grid grid-cols-7 gap-2">
                        {calendarDays.map((item) => {
                          const isSelected = selectedDate === item.day;
                          return (
                            <button
                              key={item.day}
                              type="button"
                              onClick={() => setSelectedDate(item.day)}
                              className={`py-3 px-2 text-center text-xs font-semibold rounded-lg shadow-sm transition-all duration-200 ease-in-out focus:outline-none ${
                                isSelected
                                  ? 'border-orange-500 bg-orange-50 text-orange-500'
                                  : 'text-gray-700 bg-white border border-gray-200 hover:border-orange-500'
                              }`}
                            >
                              {item.day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                </div>

                {/* COLUMNA DERECHA: FRANJAS OCULTAS Y ACCIÓN (5 Cols) */}
                <div className="lg:col-span-5 flex flex-col">
                  
                  {/* CARD 3: FRANJA HORARIA CON REVELACIÓN OCULTA */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="border-t-[3px] border-orange-500 p-6 pb-4">
                      <h2 className="text-lg font-extrabold tracking-tight text-gray-900">
                        3. Franja Horaria
                      </h2>
                      <p className="text-xs font-normal text-gray-500 mt-0.5">
                        Asignación de turnos y bloques de clase.
                      </p>
                    </div>

                    <div className="p-6 pt-0">
                      {/*
                        PROBLEMÁTICA INTENCIONAL: Oculto hasta que se elijan fecha y salón
                      */}
                      {!isTimeSlotRevealed ? (
                        <div className="py-8 px-4 text-center border-2 border-dashed border-gray-200 rounded-lg">
                          <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-xs font-semibold text-gray-700">Disponibilidad horaria no cargada</p>
                          <p className="text-[11px] text-gray-500 mt-1 max-w-xs mx-auto">
                            Debes seleccionar primero un salón y una fecha para desbloquear el selector.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700">
                            <span className="font-bold text-gray-900">Horarios detectados para el espacio:</span>
                            <p className="text-[11px] text-gray-500 mt-0.5">Seleccione el bloque de inicio y finalización requerido.</p>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                              Franja de Reserva
                            </label>
                            <select
                              value={selectedSlot}
                              onChange={(e) => setSelectedSlot(e.target.value)}
                              className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg p-3 focus:outline-none focus:border-orange-500 transition-all duration-200"
                            >
                              <option value="">Seleccione turno...</option>
                              <option value="07:00 - 09:00">07:00 AM - 09:00 AM (Bloque Mañana 1)</option>
                              <option value="09:00 - 11:00">09:00 AM - 11:00 AM (Bloque Mañana 2)</option>
                              <option value="11:00 - 13:00">11:00 AM - 01:00 PM (Bloque Mediodía)</option>
                              <option value="14:00 - 16:00">02:00 PM - 04:00 PM (Bloque Tarde 1)</option>
                              <option value="16:00 - 18:00">04:00 PM - 06:00 PM (Bloque Tarde 2)</option>
                              <option value="18:30 - 21:30">06:30 PM - 09:30 PM (Bloque Nocturno)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                              Propósito Académico
                            </label>
                            <textarea
                              rows={3}
                              value={purpose}
                              onChange={(e) => setPurpose(e.target.value)}
                              placeholder="Ej: Práctica de Laboratorio de Redes WAN..."
                              className="w-full bg-white border border-gray-200 text-gray-900 text-xs rounded-lg p-3 focus:outline-none focus:border-orange-500 transition-all duration-200 resize-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CARD 4: ACCIONES */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="border-t-[3px] border-orange-500 p-6 pb-4">
                      <h2 className="text-base font-extrabold tracking-tight text-gray-900">
                        Acción de Trámite
                      </h2>
                    </div>

                    <div className="p-6 pt-0 space-y-3">
                      <button
                        onClick={handleReservationSubmit}
                        className="w-full bg-orange-500 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ease-in-out hover:bg-orange-600 py-3 px-4 text-sm flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Confirmar y Enviar Solicitud</span>
                      </button>

                      <button
                        onClick={handleResetReservation}
                        className="w-full bg-white border-2 border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition-all duration-200 ease-in-out py-2.5 px-4 text-sm font-semibold text-center"
                      >
                        Limpiar Campos
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* VISTA 2: ACCESO INSTITUCIONAL (LOGIN CON FALLO SILENCIOSO INTENCIONAL) */}
          {activeView === 'login' && (
            <div className="max-w-md mx-auto pt-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="border-t-[3px] border-orange-500 p-8 pb-4 text-center">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl mx-auto flex items-center justify-center shadow-sm mb-4">
                    <span className="text-white font-extrabold text-xl">U</span>
                  </div>
                  <h2 className="text-xl font-extrabold tracking-tight text-gray-900">
                    Portal de Autenticación
                  </h2>
                  <p className="text-xs font-normal text-gray-500 mt-1">
                    Ingreso al sistema centralizado de recursos UCompensar.
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="p-8 pt-2 space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                      Rol Institucional
                    </label>
                    <select
                      value={loginRole}
                      onChange={(e) => setLoginRole(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg p-3 focus:outline-none focus:border-orange-500 transition-all duration-200"
                    >
                      <option value="Estudiante">Estudiante de Pregrado / Posgrado</option>
                      <option value="Docente">Docente Titular / Catedrático</option>
                      <option value="Administrador">Coordinación de Infraestructura</option>
                    </select>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Demostración del error: Seleccione <strong className="text-gray-700">"Estudiante"</strong> para simular el fallo silencioso.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                      Correo Institucional (@ucompensar.edu.co)
                    </label>
                    <input
                      type="email"
                      defaultValue="usuario@ucompensar.edu.co"
                      className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg p-3 focus:outline-none focus:border-orange-500 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                      Contraseña de Red
                    </label>
                    <input
                      type="password"
                      defaultValue="password123"
                      className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg p-3 focus:outline-none focus:border-orange-500 transition-all duration-200"
                    />
                  </div>

                  {/*
                    PROBLEMÁTICA INTENCIONAL: Botón de login para estudiantes.
                    Muestra spinner durante 1.8s y vuelve a estado normal sin mensaje.
                  */}
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full bg-orange-500 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ease-in-out hover:bg-orange-600 py-3.5 px-4 text-sm flex items-center justify-center gap-2"
                  >
                    {loginLoading ? (
                      <>
                        <span>Verificando Credenciales...</span>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </>
                    ) : (
                      <span>Ingresar al Sistema</span>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* VISTA 3: DIAGNÓSTICO UX */}
          {activeView === 'audit' && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">Matriz de Diagnóstico UX y Refactorización</h2>
                <p className="text-sm font-normal text-gray-500 mt-1">
                  Registro explícito de las problemáticas de usabilidad programadas de forma intencional en esta fase.
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="border-t-[3px] border-orange-500 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-orange-500 uppercase tracking-wider">Antipatrón 01</span>
                        <h3 className="text-lg font-extrabold tracking-tight text-gray-900 mt-0.5">Fallo Silencioso en Autenticación de Estudiantes</h3>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg border border-gray-800 text-[11px] font-bold text-gray-800">Severidad Crítica</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                      Al seleccionar "Estudiante", el botón activa un spinner durante 1.8 segundos y luego regresa a su estado inicial sin ningún mensaje de error, alerta o redirección. Viola la Heurística #1 y #9 de Nielsen.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="border-t-[3px] border-orange-500 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-orange-500 uppercase tracking-wider">Antipatrón 02</span>
                        <h3 className="text-lg font-extrabold tracking-tight text-gray-900 mt-0.5">Calendario Matricial Sin Jerarquía de Disponibilidad</h3>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg border border-gray-800 text-[11px] font-bold text-gray-800">Severidad Alta</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                      Los días disponibles y los días saturados comparten la misma clase visual (<code>text-gray-700 bg-white border border-gray-200</code>). El usuario solo se entera de la falta de cupo tras enviar el formulario completo.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="border-t-[3px] border-orange-500 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-orange-500 uppercase tracking-wider">Antipatrón 03</span>
                        <h3 className="text-lg font-extrabold tracking-tight text-gray-900 mt-0.5">Franjas Horarias Ocultas y Dependencia No Señalizada</h3>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg border border-gray-800 text-[11px] font-bold text-gray-800">Severidad Media</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                      El selector de horas está totalmente oculto en el árbol visual hasta que el usuario elige secuencialmente el salón y el día, sin ninguna pista previa de affordance que indique la existencia del campo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* =========================================================================
          5. COMPONENTE FACTORY METHOD FLOTANTE: TOASTS DE NOTIFICACIÓN
          fixed top-20 right-6 flex flex-col gap-3 z-50
          ========================================================================= */}
      <div className="fixed top-20 right-6 flex flex-col gap-3 z-50 pointer-events-none">
        {toasts.map((toast) => {
          const styles = toast.getStyles();
          return (
            <div
              key={toast.id}
              className={`bg-white w-80 p-4 rounded-xl shadow-xl border-l-8 ${styles.borderClass} flex items-start gap-3 transform transition-all duration-300 relative pointer-events-auto select-none`}
            >
              <div className={`${styles.iconClass} mt-0.5 flex-shrink-0`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 pr-2">
                <h4 className={`text-xs font-extrabold ${styles.titleClass} tracking-tight leading-tight`}>
                  {toast.title}
                </h4>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed font-normal">
                  {toast.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeNotification(toast.id)}
                className="text-gray-400 hover:text-gray-600 transition-all duration-200 ease-in-out p-1 -mr-1 -mt-1 rounded"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
