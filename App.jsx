import React, { useState, useEffect } from 'react';
import SpaceConfig from './SpaceConfig';
import { ReservationService, ReservationEvents } from './ReservationService';
import { NotificationFactory } from './NotificationFactory';

const reservationServiceInstance = new ReservationService(SpaceConfig);
const reservationEventBus = reservationServiceInstance.getEventBus();

export default function App() {
  // Estado de Autenticación Obligatoria (Inicia como false)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Formulario de Login
  const [loginRole, setLoginRole] = useState('Docente');
  const [loginEmail, setLoginEmail] = useState('carlos.mendoza@ucompensar.edu.co');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [loginLoading, setLoginLoading] = useState(false);
  const [feedbackNote, setFeedbackNote] = useState('Acceso Autorizado al Sistema de Reservas.');

  // Vista activa de la app
  const [activeView, setActiveView] = useState('reservation');

  // Notificaciones Toasts
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

  // Sincronizar credenciales al cambiar de rol en el login
  const handleRoleChange = (roleId) => {
    setLoginRole(roleId);
    const cred = SpaceConfig.demoCredentials.find((c) => c.role === roleId);
    if (cred) {
      setLoginEmail(cred.email);
      setLoginPassword(cred.password);
      setFeedbackNote(cred.behavior);
    }
  };

  const handleShortcutClick = (cred) => {
    setLoginRole(cred.role);
    setLoginEmail(cred.email);
    setLoginPassword(cred.password);
    setFeedbackNote(cred.behavior);
  };

  // Manejo de Login con Antipatrón 1 Preservado
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginLoading(true);

    if (loginRole === 'Estudiante') {
      // FALLO SILENCIOSO INTENCIONAL (Estudiante atrapado en login)
      setTimeout(() => {
        setLoginLoading(false);
      }, 1800);
    } else {
      setTimeout(() => {
        setLoginLoading(false);
        const cred = SpaceConfig.demoCredentials.find((c) => c.role === loginRole) || {
          name: 'Prof. Carlos Mendoza',
          department: 'Docente de Ingeniería',
          initials: 'CM'
        };

        const user = {
          name: cred.name,
          role: cred.department,
          initials: cred.initials
        };

        setCurrentUser(user);
        setIsAuthenticated(true);
        addNotification('aprobada', 'Sesión Autorizada', `Bienvenido al sistema institucional, ${user.name}.`);
      }, 1200);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    handleRoleChange('Docente');
  };

  // Estado del Formulario de Reserva
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isTimeSlotVisible, setIsTimeSlotVisible] = useState(false);

  useEffect(() => {
    let currentRoom = null;
    let currentDate = null;

    const evaluate = () => {
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

  const handleReservationSubmit = () => {
    const payload = {
      roomId: selectedRoom,
      date: selectedDate ? `2026-11-${String(selectedDate).padStart(2, '0')}` : null,
      slot: selectedSlot,
      reason: purpose,
      requesterName: currentUser?.name || 'Docente'
    };

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
    reservationServiceInstance.selectDate(formatted);
  };

  const handleRoomChange = (roomId) => {
    setSelectedRoom(roomId);
    reservationServiceInstance.selectRoom(roomId);
  };

  // =========================================================================
  // RENDER: PANTALLA DE LOGIN OBLIGATORIO (GATEKEEPER)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4 font-['Inter',sans-serif] antialiased">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden my-auto">
          <div className="border-t-[3px] border-orange-500 p-8 pb-4 text-center">
            <div className="w-14 h-14 bg-orange-500 rounded-xl mx-auto flex items-center justify-center shadow-md mb-4">
              <span className="text-white font-extrabold text-2xl">U</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
              UCompensar <span className="text-orange-500 font-bold">Espacios</span>
            </h1>
            <p className="text-xs font-normal text-gray-500 mt-1">
              Acceso Institucional Obligatorio - Sistema de Asignación de Recursos
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="p-8 pt-2 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Rol Institucional
              </label>
              <select
                value={loginRole}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg p-3 focus:outline-none focus:border-orange-500 transition-all duration-200"
              >
                {SpaceConfig.roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Correo Institucional (@ucompensar.edu.co)
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg p-3 focus:outline-none focus:border-orange-500 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Contraseña de Red
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg p-3 focus:outline-none focus:border-orange-500 transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-orange-500 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ease-in-out hover:bg-orange-600 py-3.5 px-4 text-sm flex items-center justify-center gap-2"
            >
              {loginLoading ? <span>Verificando...</span> : <span>Iniciar Sesión</span>}
            </button>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                Credenciales Demo (Click para auto-completar):
              </p>
              <div className="grid grid-cols-3 gap-2">
                {SpaceConfig.demoCredentials.map((c) => (
                  <button
                    key={c.role}
                    type="button"
                    onClick={() => handleShortcutClick(c)}
                    className="py-2 px-2 text-xs font-semibold rounded-lg border border-gray-200 hover:border-orange-500 hover:text-orange-500 text-gray-700 bg-gray-50 transition-all duration-200 text-center"
                  >
                    {c.role}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-gray-500 mt-2 italic leading-relaxed">
                {feedbackNote}
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: APLICACIÓN PRINCIPAL (DESBLOQUEADA TRAS LOGIN)
  // =========================================================================
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden font-['Inter',sans-serif] bg-gray-50 text-gray-900 antialiased">
      
      {/* HEADER NAVBAR */}
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

          <div className="flex items-center gap-4 pl-6 border-l border-gray-100">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-gray-900 leading-tight">{currentUser.name}</p>
              <p className="text-[11px] text-gray-500 font-normal">{currentUser.role}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-500 flex items-center justify-center text-orange-500 font-bold text-sm shadow-sm">
              <span>{currentUser.initials}</span>
            </div>

            <button
              onClick={handleLogout}
              className="text-xs text-gray-500 hover:text-orange-500 border border-gray-200 hover:border-orange-500 py-1.5 px-3 rounded-lg transition-all duration-200 bg-white shadow-sm"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* BODY LAYOUT */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR: SIN INICIAR SESIÓN */}
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
              <span>Reservar Espacio</span>
            </button>

            <button
              onClick={() => setActiveView('my-reservations')}
              className={`w-full text-left px-6 py-3.5 text-sm font-semibold text-white flex items-center gap-3 transition-all duration-200 ease-in-out ${
                activeView === 'my-reservations' ? 'bg-orange-600 border-l-4 border-white shadow-sm' : 'hover:bg-orange-600 hover:border-l-4 hover:border-white'
              }`}
            >
              <span>Mis Solicitudes</span>
            </button>

            <button
              onClick={() => setActiveView('audit')}
              className={`w-full text-left px-6 py-3.5 text-sm font-semibold text-white flex items-center gap-3 transition-all duration-200 ease-in-out ${
                activeView === 'audit' ? 'bg-orange-600 border-l-4 border-white shadow-sm' : 'hover:bg-orange-600 hover:border-l-4 hover:border-white'
              }`}
            >
              <span>Arquitectura & UX</span>
            </button>
          </div>

          <div className="px-6 pt-4 border-t border-orange-400 border-opacity-40">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white opacity-80 mb-3">
              Prueba Factory Method
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => addNotification('aprobada', 'Notificación Aprobada', 'Demostración de toast con borde naranja.')}
                className="w-full py-2 px-3 text-xs font-semibold text-orange-500 bg-white rounded-lg shadow-sm hover:bg-orange-50 transition-all duration-200 text-center"
              >
                Toast Aprobada
              </button>
              <button
                onClick={() => addNotification('rechazada', 'Notificación Rechazada', 'Demostración con borde gris carbón (#1F2937).')}
                className="w-full py-2 px-3 text-xs font-semibold text-gray-900 bg-white rounded-lg shadow-sm hover:bg-gray-100 transition-all duration-200 text-center"
              >
                Toast Rechazada
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN AREA */}
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
                <div className="lg:col-span-7 flex flex-col">
                  {/* CARD 1 */}
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

                  {/* CARD 2: CALENDARIO ANTI-INTUITIVO (PRESERVADO) */}
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

                      <div className="grid grid-cols-7 gap-2">
                        {SpaceConfig.calendarDays.map((item) => {
                          const isSelected = selectedDate === item.day;
                          return (
                            <button
                              key={item.day}
                              type="button"
                              onClick={() => handleDateClick(item.day)}
                              className={`py-3 px-2 text-center text-xs font-semibold rounded-lg shadow-sm transition-all duration-200 focus:outline-none ${
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
                  {/* CARD 3: FRANJAS OCULTAS */}
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

          {activeView === 'my-reservations' && (
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-6">Historial de Solicitudes</h2>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <p className="text-xs text-gray-500">Consulta los vouchers y autorizaciones radicadas en el sistema.</p>
              </div>
            </div>
          )}

          {activeView === 'audit' && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-6">Auditoría Arquitectónica</h2>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <p className="text-xs text-gray-500">Patrones Observer, Factory Method y SRP activos.</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* TOASTS CONTAINER */}
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
