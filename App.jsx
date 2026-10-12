import React, { useState, useEffect } from 'react';
import SpaceConfig from './SpaceConfig';
import { ReservationService, ReservationEvents, ReservationSubject } from './ReservationService';
import { NotificationFactory } from './NotificationFactory';

/**
 * =========================================================================
 * COMPONENTE REACT: UCOMPENSAR ESPACIOS (REFACTORIZADO CON SOLID & GOF)
 * =========================================================================
 * 1. SRP: Validación y lógica de reserva delegada a ReservationService.
 * 2. Eliminación de Hard Coding: Interfaz alimentada dinámicamente desde SpaceConfig.
 * 3. Patrón Observer: Interacción calendario-horarios coordinada a través de ReservationSubject.
 * 4. Antipatrones de usabilidad PRESERVADOS (Login silencioso, calendario ciego, franjas ocultas).
 * 5. NotificationFactory intacto.
 */

// Instancia única del servicio y bus de eventos
const reservationServiceInstance = new ReservationService(SpaceConfig);
const reservationEventBus = reservationServiceInstance.getEventBus();

export default function App() {
  const [activeView, setActiveView] = useState('reservation');

  // Usuario activo
  const [currentUser, setCurrentUser] = useState({
    name: 'Prof. Carlos Mendoza',
    role: 'Docente de Ingeniería',
    initials: 'CM'
  });

  // Notificaciones Toasts (Factory Method)
  const [toasts, setToasts] = useState([]);

  const addNotification = (type, title, message) => {
    const toastObj = NotificationFactory.create(type, title, message);
    setToasts((prev) => [...prev, toastObj]);
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== toastObj.id));
    }, 4500);
  };

  const removeNotification = (id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  };

  // Estado del Formulario
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [purpose, setPurpose] = useState('');

  // 3. PATRÓN OBSERVER (SUBSCRIBER): Visibilidad de las franjas horarias
  const [isTimeSlotVisible, setIsTimeSlotVisible] = useState(false);

  useEffect(() => {
    let currentRoom = null;
    let currentDate = null;

    const evaluate = () => {
      // Regla de negocio preservada: Solo visible si ambos están presentes
      setIsTimeSlotVisible(Boolean(currentRoom && currentDate));
    };

    const unsubscribeDate = reservationEventBus.subscribe(ReservationEvents.DATE_SELECTED, (date) => {
      currentDate = date;
      evaluate();
    });

    const unsubscribeRoom = reservationEventBus.subscribe(ReservationEvents.ROOM_SELECTED, (roomId) => {
      currentRoom = roomId;
      evaluate();
    });

    const unsubscribeReset = reservationEventBus.subscribe(ReservationEvents.FORM_RESET, () => {
      currentRoom = null;
      currentDate = null;
      evaluate();
    });

    return () => {
      unsubscribeDate();
      unsubscribeRoom();
      unsubscribeReset();
    };
  }, []);

  // 1. ANTIPATRÓN PRESERVADO: Login silencioso para estudiantes
  const [loginRole, setLoginRole] = useState('Docente');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginLoading(true);

    if (loginRole === 'Estudiante') {
      setTimeout(() => {
        setLoginLoading(false);
        // Cero retroalimentación (Antipatrón preservado)
      }, 1800);
    } else {
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

  // 1. DELEGACIÓN SRP: Envío de Reserva a ReservationService
  const handleReservationSubmit = () => {
    const payload = {
      roomId: selectedRoom,
      date: selectedDate ? `2026-11-${String(selectedDate).padStart(2, '0')}` : null,
      slot: selectedSlot,
      reason: purpose,
      requesterName: currentUser.name
    };

    // La UI delega la validación completa a la capa de servicio
    const result = reservationServiceInstance.processReservation(payload);

    if (result.success) {
      addNotification('aprobada', result.title, result.message);
      handleResetReservation();
    } else {
      addNotification('rechazada', result.title, result.message);
    }
  };

  const handleResetReservation = () => {
    setSelectedBuilding('');
    setSelectedRoom('');
    setSelectedDate(null);
    setSelectedSlot('');
    setPurpose('');
    reservationServiceInstance.resetForm();
  };

  const handleDateClick = (dayNumber) => {
    setSelectedDate(dayNumber);
    const formatted = `2026-11-${String(dayNumber).padStart(2, '0')}`;
    // 3. Emisión de evento al Subject
    reservationServiceInstance.selectDate(formatted);
  };

  const handleRoomChange = (roomId) => {
    setSelectedRoom(roomId);
    // 3. Emisión de evento al Subject
    reservationServiceInstance.selectRoom(roomId);
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden font-['Inter',sans-serif] bg-gray-50 text-gray-900 antialiased">
      
      {/* NAVBAR */}
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
            <span>Periodo Académico Activo: <strong className="text-gray-900">{SpaceConfig.metadata.academicPeriod}</strong></span>
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

      {/* BODY LAYOUT */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR */}
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
                activeView === 'reservation' ? 'bg-orange-600 border-l-4 border-white shadow-sm' : 'hover:bg-orange-600 hover:border-l-4 hover:border-white'
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
                activeView === 'login' ? 'bg-orange-600 border-l-4 border-white shadow-sm' : 'hover:bg-orange-600 hover:border-l-4 hover:border-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Acceso Institucional</span>
            </button>
          </div>

          <div className="px-6 pt-4 border-t border-orange-400 border-opacity-40">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white opacity-80 mb-3">
              Prueba Factory Method
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => addNotification('aprobada', 'Notificación Aprobada', 'Demostración de toast con borde naranja.')}
                className="w-full py-2 px-3 text-xs font-semibold text-orange-500 bg-white rounded-lg shadow-sm hover:bg-orange-50 transition-all duration-200 ease-in-out text-center"
              >
                Toast Aprobada
              </button>
              <button
                onClick={() => addNotification('rechazada', 'Notificación Rechazada', 'Demostración con borde gris oscuro (#1F2937).')}
                className="w-full py-2 px-3 text-xs font-semibold text-gray-900 bg-white rounded-lg shadow-sm hover:bg-gray-100 transition-all duration-200 ease-in-out text-center"
              >
                Toast Rechazada
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 bg-gray-50 p-8 overflow-y-auto">
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
                {/* COLUMNA IZQUIERDA */}
                <div className="lg:col-span-7 flex flex-col">
                  {/* CARD 1: Espacios Dinámicos desde SpaceConfig */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="border-t-[3px] border-orange-500 p-6 pb-4">
                      <h2 className="text-lg font-extrabold tracking-tight text-gray-900">
                        1. Selección de Espacio Físico
                      </h2>
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
                            {SpaceConfig.buildings.map((b) => (
                              <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                            Salón / Laboratorio
                          </label>
                          <select
                            value={selectedRoom}
                            onChange={(e) => handleRoomChange(e.target.value)}
                            className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg p-3 focus:outline-none focus:border-orange-500 transition-all duration-200"
                          >
                            <option value="">Seleccione Salón...</option>
                            {SpaceConfig.rooms.map((r) => (
                              <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: Calendario Dinámico (Antipatrón Preservado) */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="border-t-[3px] border-orange-500 p-6 pb-3 flex items-center justify-between">
                      <h2 className="text-lg font-extrabold tracking-tight text-gray-900">
                        2. Fecha de Ocupación
                      </h2>
                      <span className="text-xs font-bold text-gray-900 uppercase tracking-wider px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg">
                        {SpaceConfig.metadata.monthName}
                      </span>
                    </div>

                    <div className="p-6 pt-2">
                      <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
                        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, idx) => (
                          <span key={idx} className="text-[11px] font-bold text-gray-500 py-1">{d}</span>
                        ))}
                      </div>

                      {/* Renderizado dinámico desde SpaceConfig.calendarDays con estilos idénticos */}
                      <div className="grid grid-cols-7 gap-2">
                        {SpaceConfig.calendarDays.map((item) => {
                          const isSelected = selectedDate === item.day;
                          return (
                            <button
                              key={item.day}
                              type="button"
                              onClick={() => handleDateClick(item.day)}
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

                {/* COLUMNA DERECHA */}
                <div className="lg:col-span-5 flex flex-col">
                  {/* CARD 3: Franjas Horarias (Controladas por Observer) */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="border-t-[3px] border-orange-500 p-6 pb-4">
                      <h2 className="text-lg font-extrabold tracking-tight text-gray-900">
                        3. Franja Horaria
                      </h2>
                    </div>

                    <div className="p-6 pt-0">
                      {!isTimeSlotVisible ? (
                        <div className="py-8 px-4 text-center border-2 border-dashed border-gray-200 rounded-lg">
                          <p className="text-xs font-semibold text-gray-700">Disponibilidad horaria no cargada</p>
                          <p className="text-[11px] text-gray-500 mt-1 max-w-xs mx-auto">
                            Debes seleccionar primero un salón y una fecha para desbloquear el selector.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
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
                              {SpaceConfig.timeSlots.map((s) => (
                                <option key={s.id} value={s.id}>{s.label}</option>
                              ))}
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
                              placeholder="Ej: Práctica de Laboratorio..."
                              className="w-full bg-white border border-gray-200 text-gray-900 text-xs rounded-lg p-3 focus:outline-none focus:border-orange-500 transition-all duration-200 resize-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CARD 4: Acciones */}
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

          {/* VISTA 2: LOGIN */}
          {activeView === 'login' && (
            <div className="max-w-md mx-auto pt-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="border-t-[3px] border-orange-500 p-8 pb-4 text-center">
                  <h2 className="text-xl font-extrabold tracking-tight text-gray-900">
                    Portal de Autenticación
                  </h2>
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
                      {SpaceConfig.roles.map((r) => (
                        <option key={r.id} value={r.id}>{r.label}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full bg-orange-500 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ease-in-out hover:bg-orange-600 py-3.5 px-4 text-sm flex items-center justify-center gap-2"
                  >
                    {loginLoading ? <span>Verificando Credenciales...</span> : <span>Ingresar al Sistema</span>}
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* TOASTS FLOTANTES */}
      <div className="fixed top-20 right-6 flex flex-col gap-3 z-50 pointer-events-none">
        {toasts.map((toast) => {
          const styles = toast.getStyles();
          return (
            <div
              key={toast.id}
              className={`bg-white w-80 p-4 rounded-xl shadow-xl border-l-8 ${styles.borderClass} flex items-start gap-3 transform transition-all duration-300 relative pointer-events-auto select-none`}
            >
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
                ✕
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
