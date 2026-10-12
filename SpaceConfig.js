/**
 * =========================================================================
 * SPACECONFIG: CONFIGURACIÓN CENTRALIZADA DE ESPACIOS ACADÉMICOS
 * =========================================================================
 * Arquitectura: Eliminación del antipatrón "Hard Coding".
 * Centraliza la definición de edificios, salas, franjas horarias y días de calendario.
 * Provee datos inmutables para el renderizado dinámico en la interfaz de usuario.
 */

const SpaceConfig = Object.freeze({
  // Edificios institucionales
  buildings: Object.freeze([
    { id: 'A', name: 'Edificio A - Ingenierías y TI', code: 'ED-A' },
    { id: 'B', name: 'Edificio B - Ciencias Administrativas', code: 'ED-B' },
    { id: 'C', name: 'Edificio C - Innovación y Talleres', code: 'ED-C' }
  ]),

  // Salones y Laboratorios disponibles
  rooms: Object.freeze([
    {
      id: 'LAB-301',
      name: 'Lab 301 - Redes y Ciberseguridad (Cap. 35)',
      buildingId: 'A',
      capacity: 35,
      type: 'Laboratorio'
    },
    {
      id: 'LAB-302',
      name: 'Lab 302 - Desarrollo de Software (Cap. 40)',
      buildingId: 'A',
      capacity: 40,
      type: 'Laboratorio'
    },
    {
      id: 'AUD-101',
      name: 'Auditorio Central (Cap. 120)',
      buildingId: 'B',
      capacity: 120,
      type: 'Auditorio'
    },
    {
      id: 'AULA-204',
      name: 'Aula 204 - Magistral (Cap. 45)',
      buildingId: 'B',
      capacity: 45,
      type: 'Aula Magistral'
    }
  ]),

  // Franjas Horarias Académicas
  timeSlots: Object.freeze([
    { id: '07:00 - 09:00', label: '07:00 AM - 09:00 AM (Bloque Mañana 1)' },
    { id: '09:00 - 11:00', label: '09:00 AM - 11:00 AM (Bloque Mañana 2)' },
    { id: '11:00 - 13:00', label: '11:00 AM - 01:00 PM (Bloque Mediodía)' },
    { id: '14:00 - 16:00', label: '02:00 PM - 04:00 PM (Bloque Tarde 1)' },
    { id: '16:00 - 18:00', label: '04:00 PM - 06:00 PM (Bloque Tarde 2)' },
    { id: '18:30 - 21:30', label: '06:30 PM - 09:30 PM (Bloque Nocturno)' }
  ]),

  // Días de ocupación (Disponibilidad interna para el mes activo)
  // NOTA ARQUITECTÓNICA: Aunque este dataset define la disponibilidad real,
  // la capa de presentación mantendrá intencionalmente el antipatrón de usabilidad (calendario ciego).
  calendarDays: Object.freeze([
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
  ]),

  // Roles institucionales para autenticación
  roles: Object.freeze([
    { id: 'Estudiante', label: 'Estudiante de Pregrado / Posgrado' },
    { id: 'Docente', label: 'Docente Titular / Catedrático' },
    { id: 'Administrador', label: 'Coordinación de Infraestructura' }
  ]),

  // Metadatos de periodo institucional
  metadata: Object.freeze({
    academicPeriod: '2026-I',
    campusName: 'Calle 42',
    monthName: 'Noviembre 2026',
    year: 2026,
    monthIndex: 11
  })
});

// Compatibilidad con CommonJS, ES Modules y entorno de Browser Global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SpaceConfig;
}
if (typeof window !== 'undefined') {
  window.SpaceConfig = SpaceConfig;
}
