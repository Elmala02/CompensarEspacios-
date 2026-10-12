/**
 * =========================================================================
 * PATRÓN FACTORY METHOD (GoF) - NOTIFICACIONES UCOMPENSAR ESPACIOS
 * =========================================================================
 * Estructura Base:
 * bg-white w-80 p-4 rounded-xl shadow-xl border-l-8 flex items-start gap-3 transform transition-all duration-300 relative
 * 
 * Regla de Paleta Estricta:
 * - Creada / Aprobada: border-orange-500, texto naranja
 * - Rechazada / Cancelada: border-gray-800, texto oscuro (reemplazando el uso de rojo)
 */

// Producto Abstracto
export class BaseNotificationToast {
  constructor(id, title, message, options = {}) {
    if (new.target === BaseNotificationToast) {
      throw new TypeError("No se puede instanciar BaseNotificationToast de manera directa.");
    }
    this.id = id || `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    this.title = title;
    this.message = message;
    this.options = options;
  }

  getStyles() {
    throw new Error("getStyles() debe ser implementado por la variante concreta.");
  }

  getIcon() {
    throw new Error("getIcon() debe ser implementado por la variante concreta.");
  }
}

// Producto Concreto 1: Variante Aprobada / Creada
export class ApprovedNotificationToast extends BaseNotificationToast {
  getStyles() {
    return {
      borderClass: "border-orange-500",
      titleClass: "text-orange-500",
      iconClass: "text-orange-500"
    };
  }

  getIcon() {
    return "check-circle";
  }
}

// Producto Concreto 2: Variante Rechazada / Cancelada (Gris Oscuro en lugar de Rojo)
export class RejectedNotificationToast extends BaseNotificationToast {
  getStyles() {
    return {
      borderClass: "border-gray-800",
      titleClass: "text-gray-800",
      iconClass: "text-gray-800"
    };
  }

  getIcon() {
    return "alert-triangle";
  }
}

// Creador / Factory Method
export class NotificationFactory {
  static create(type, title, message, options = {}) {
    const normalizedType = String(type).trim().toLowerCase();
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    switch (normalizedType) {
      case 'approved':
      case 'creada':
      case 'aprobada':
        return new ApprovedNotificationToast(id, title, message, options);

      case 'rejected':
      case 'rechazada':
      case 'cancelada':
        return new RejectedNotificationToast(id, title, message, options);

      default:
        console.warn(`Tipo de notificación '${type}' no reconocido en Factory. Retornando Aprobada.`);
        return new ApprovedNotificationToast(id, title, message, options);
    }
  }
}
