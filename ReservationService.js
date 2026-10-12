/**
 * =========================================================================
 * RESERVATIONSERVICE: SERVICIO DE NEGOCIO Y SUJETO DE EVENTOS (OBSERVER)
 * =========================================================================
 * Arquitectura:
 * 1. Principio de Responsabilidad Única (SRP):
 *    Encapsula toda la lógica de validación de reservas, verificación de
 *    disponibilidad contra el catálogo y emisión de resultados de trámite.
 *    La vista (UI) queda libre de lógica de negocio.
 * 
 * 2. Patrón Observer (GoF):
 *    Implementa un Subject (publicador de eventos) que permite desacoplar
 *    el calendario, el selector de salones y el módulo de franjas horarias.
 */

// Dependencia de configuración (si se ejecuta en Node/Webpack/Vite o en Browser)
let _SpaceConfig = typeof SpaceConfig !== 'undefined' ? SpaceConfig : null;
if (!_SpaceConfig && typeof require !== 'undefined') {
  try {
    _SpaceConfig = require('./SpaceConfig');
  } catch (e) {
    // Si no está disponible por require, se resolverá en tiempo de ejecución global
  }
}

/**
 * =========================================================================
 * PATRÓN OBSERVER (GoF): SUJETO PUBLICADOR DE EVENTOS
 * =========================================================================
 */
class ReservationSubject {
  constructor() {
    this.observers = new Map();
  }

  /**
   * Suscribe un observador a un evento específico
   * @param {string} event - Nombre del evento (ej. 'DATE_SELECTED')
   * @param {Function} callback - Función que responderá a la notificación
   * @returns {Function} Función para cancelar la suscripción
   */
  subscribe(event, callback) {
    if (typeof callback !== 'function') {
      throw new TypeError(`El observador para '${event}' debe ser una función ejecutable.`);
    }

    if (!this.observers.has(event)) {
      this.observers.set(event, new Set());
    }

    this.observers.get(event).add(callback);

    // Retorno de función de desuscripción limpia
    return () => {
      const callbacks = this.observers.get(event);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  /**
   * Notifica a todos los observadores suscritos a un evento
   * @param {string} event - Nombre del evento
   * @param {*} data - Payload o datos del evento
   */
  notify(event, data) {
    if (this.observers.has(event)) {
      this.observers.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (err) {
          console.error(`[ReservationSubject] Error al notificar al observador para '${event}':`, err);
        }
      });
    }
  }

  /**
   * Limpia todos los observadores registrados
   */
  clear() {
    this.observers.clear();
  }
}

/**
 * Catálogo constante de eventos del dominio de reservas
 */
const ReservationEvents = Object.freeze({
  DATE_SELECTED: 'DATE_SELECTED',
  ROOM_SELECTED: 'ROOM_SELECTED',
  BUILDING_SELECTED: 'BUILDING_SELECTED',
  TIME_SLOT_SELECTED: 'TIME_SLOT_SELECTED',
  FORM_RESET: 'FORM_RESET',
  RESERVATION_SUBMITTED: 'RESERVATION_SUBMITTED'
});

/**
 * =========================================================================
 * SERVICIO DE RESERVAS (SRP - LOGICA DE NEGOCIO Y VALIDACIÓN)
 * =========================================================================
 */
class ReservationService {
  constructor(config = _SpaceConfig, eventBus = new ReservationSubject()) {
    this.config = config || (typeof window !== 'undefined' ? window.SpaceConfig : null);
    this.eventBus = eventBus;
    this.reservationHistory = [];
  }

  /**
   * Obtiene la instancia del bus de eventos (Subject)
   */
  getEventBus() {
    return this.eventBus;
  }

  /**
   * Valida si los parámetros obligatorios de una solicitud de reserva están completos
   * @param {Object} payload { roomId, date, slot }
   * @returns {Object} { isValid: boolean, missingFields: string[] }
   */
  validatePayload(payload) {
    const { roomId, date, slot } = payload || {};
    const missingFields = [];

    if (!roomId || String(roomId).trim() === '') missingFields.push('Salón / Laboratorio');
    if (!date || String(date).trim() === '') missingFields.push('Fecha de ocupación');
    if (!slot || String(slot).trim() === '') missingFields.push('Franja horaria');

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }

  /**
   * Verifica la disponibilidad de la fecha en el catálogo de ocupación
   * @param {string} dateString - Formato 'YYYY-MM-DD'
   * @returns {boolean} true si está disponible, false si está saturado
   */
  isDateAvailable(dateString) {
    if (!this.config || !this.config.calendarDays) {
      return true; // Fallback tolerante
    }

    const parts = String(dateString).split('-');
    const dayNumber = parseInt(parts[2], 10);
    const dayRecord = this.config.calendarDays.find(d => d.day === dayNumber);

    return dayRecord ? dayRecord.available : true;
  }

  /**
   * Obtiene la entidad de salón por su identificador
   * @param {string} roomId
   */
  getRoomById(roomId) {
    if (!this.config || !this.config.rooms) return null;
    return this.config.rooms.find(r => r.id === roomId) || null;
  }

  /**
   * Procesa y radica una solicitud de reserva
   * SRP: Centraliza la validación, decisión de negocio y generación de identificadores.
   * 
   * @param {Object} reservationData { roomId, date, slot, reason, requesterName }
   * @returns {Object} Result DTO:
   *   {
   *     success: boolean,
   *     type: 'APROBADA' | 'RECHAZADA_INCOMPLETO' | 'RECHAZADA_OCUPADO',
   *     title: string,
   *     message: string,
   *     reservation: Object | null
   *   }
   */
  processReservation(reservationData) {
    // 1. Validación de integridad de campos requeridos
    const validation = this.validatePayload(reservationData);
    if (!validation.isValid) {
      return {
        success: false,
        type: 'RECHAZADA_INCOMPLETO',
        title: 'Campos Incompletos',
        message: `Debe diligenciar los campos obligatorios: ${validation.missingFields.join(', ')}.`,
        reservation: null
      };
    }

    const { roomId, date, slot, reason, requesterName } = reservationData;
    const roomEntity = this.getRoomById(roomId);
    const roomDisplayName = roomEntity ? roomEntity.name : roomId;

    // 2. Verificación de reglas de negocio (Disponibilidad en fecha)
    // NOTA: Consecuencia del antipatrón de calendario anti-intuitivo:
    // el usuario solo conoce la saturación aquí, al momento de radicación.
    const available = this.isDateAvailable(date);
    if (!available) {
      return {
        success: false,
        type: 'RECHAZADA_OCUPADO',
        title: 'Espacio No Disponible',
        message: `El espacio ${roomDisplayName} ya se encuentra reservado para la fecha ${date} en esa franja. Seleccione otra fecha.`,
        reservation: null
      };
    }

    // 3. Creación y persistencia de la reserva
    const reservationCode = `#RES-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newReservation = {
      code: reservationCode,
      roomId,
      roomName: roomDisplayName,
      date,
      slot,
      reason: reason || 'Actividad Académica Regular',
      requester: requesterName || 'Prof. Carlos Mendoza',
      status: 'Aprobada',
      createdAt: new Date().toISOString()
    };

    this.reservationHistory.unshift(newReservation);

    // 4. Emisión de evento Observer
    this.eventBus.notify(ReservationEvents.RESERVATION_SUBMITTED, newReservation);

    return {
      success: true,
      type: 'APROBADA',
      title: 'Reserva Registrada',
      message: `Solicitud radicada con éxito para ${roomDisplayName} el ${date} (${slot}). Código: ${reservationCode}`,
      reservation: newReservation
    };
  }

  /**
   * Emite eventos directos a través del Subject cuando el usuario interactúa
   */
  selectDate(date) {
    this.eventBus.notify(ReservationEvents.DATE_SELECTED, date);
  }

  selectRoom(roomId) {
    this.eventBus.notify(ReservationEvents.ROOM_SELECTED, roomId);
  }

  selectBuilding(buildingId) {
    this.eventBus.notify(ReservationEvents.BUILDING_SELECTED, buildingId);
  }

  resetForm() {
    this.eventBus.notify(ReservationEvents.FORM_RESET, null);
  }

  getHistory() {
    return [...this.reservationHistory];
  }
}

// Instancia singleton por defecto
const defaultReservationService = new ReservationService();

// Compatibilidad con CommonJS, ES Modules y Browser Global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ReservationSubject,
    ReservationEvents,
    ReservationService,
    reservationService: defaultReservationService
  };
}
if (typeof window !== 'undefined') {
  window.ReservationSubject = ReservationSubject;
  window.ReservationEvents = ReservationEvents;
  window.ReservationService = ReservationService;
  window.reservationService = defaultReservationService;
}
