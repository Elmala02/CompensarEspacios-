# UCompensar Espacios - Sistema de Gestión y Reserva

> **Entregable Frontend & Arquitectura UI/UX**  
> **Estilo Visual:** Clean Corporate Minimalist  
> **Paleta Estricta:** Naranja Principal (`#FF6600` / `bg-orange-500`), Blanco Puro (`#FFFFFF` / `bg-white`), Gris de Fondo (`#F9FAFB` / `bg-gray-50`), y Gris Carbón (`#1F2937` / `border-gray-800` para estados negativos en sustitución del rojo).  
> **Patrón de Diseño:** Factory Method (GoF) para Notificaciones Toast.

---

## 1. Archivos Disponibles en el Proyecto

- **[`index.html`](file:///c:/Users/malav/Documents/VISUALPROYECTOS/compensar/index.html):** Aplicación interactiva autónoma (Single-Page Application lista para navegador) con Tailwind CSS vía CDN, tipografía Inter, iconos vectoriales integrados y ejecución en vivo de los antipatrones y el Factory Method.
- **[`NotificationFactory.js`](file:///c:/Users/malav/Documents/VISUALPROYECTOS/compensar/NotificationFactory.js):** Módulo desacoplado en JavaScript/ES6 con la implementación estricta del patrón **Factory Method (GoF)** para toasts.
- **[`App.jsx`](file:///c:/Users/malav/Documents/VISUALPROYECTOS/compensar/App.jsx):** Componente funcional equivalente en React con soporte completo de Hooks (`useState`, `useEffect`) y clases exactas de Tailwind CSS.

---

## 2. Cumplimiento de la Directriz Visual

| Requisito | Clase Tailwind / Valor | Justificación Técnica |
|---|---|---|
| **Flat Design con Profundidad Sutil** | `shadow-sm`, `shadow-md`, `shadow-xl` | Sin degradados. La jerarquía en el eje Z se genera mediante sombras suaves y difusas. |
| **Respiro Visual (White Space)** | `p-6`, `p-8`, `gap-8`, `max-w-6xl` | Márgenes internos generosos que evitan saturación perceptiva. |
| **Geometría Suave** | `rounded-lg`, `rounded-xl` | Redondeo sobrio y corporativo. |
| **Jerarquía Tipográfica** | `font-extrabold tracking-tight text-gray-900` vs `font-normal text-gray-500` | Legibilidad académica impecable mediante tipografía *Inter*. |
| **Micro-interacciones** | `transition-all duration-200 ease-in-out` | Transiciones de estado consistentes en cada botón o enlace. |
| **Paleta Estricta** | `bg-orange-500`, `bg-orange-600`, `text-orange-500`, `border-orange-500`, `bg-white`, `bg-gray-50` | **Prohibido el uso de azules, verdes o rojos**. Los estados de rechazo usan `border-gray-800` y `text-gray-800`. |

---

## 3. Estructura y División Visual Milimétrica

- **Barra Superior (Navbar):** `h-16 w-full bg-white border-b-4 border-orange-500 flex items-center justify-between px-8 z-30`
- **Menú Lateral (Sidebar):** `w-64 bg-orange-500 flex flex-col justify-between py-6 flex-shrink-0`, ítems en `text-white`, efecto hover con `hover:bg-orange-600 hover:border-l-4 hover:border-white`.
- **Área de Contenido:** `flex-1 bg-gray-50 p-8 overflow-y-auto`.
- **Tarjetas de Contenido (Cards):** `bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6` con franja superior naranja de 3px (`border-t-[3px] border-orange-500`).
- **Botón Primario:** `bg-orange-500 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ease-in-out hover:bg-orange-600`.
- **Botón Secundario:** `bg-white border-2 border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition-all duration-200 ease-in-out`.

---

## 4. Antipatrones de Usabilidad Programados Intencionalmente

Estos problemas de UX han sido programados de forma deliberada para sustentar una futura auditoría y refactorización heurística:

1. **Login Fallido Silencioso (Estudiantes):**
   - *Comportamiento:* Al seleccionar el rol "Estudiante" y pulsar "Ingresar al Sistema", se activa un spinner durante 1.8 segundos y luego regresa a su estado inicial.
   - *Diagnóstico Heurístico:* Infracción grave de la Heurística #1 (*Visibilidad del estado del sistema*) y Heurística #9 (*Ayudar a los usuarios a reconocer, diagnosticar y recuperarse de errores*). No se provee retroalimentación, causando confusión en el estudiante.
2. **Calendario Matricial Anti-Intuitivo:**
   - *Comportamiento:* Los días disponibles y los días ocupados comparten de forma idéntica las clases `text-gray-700 bg-white border border-gray-200`.
   - *Diagnóstico Heurístico:* Infracción de la Heurística #6 (*Reconocimiento antes que recuerdo*). El usuario no puede saber qué días están libres sin hacer clic y someter la reserva a prueba y error.
3. **Franjas Horarias Ocultas:**
   - *Comportamiento:* El bloque de turnos permanece oculto (`hidden`) hasta que se hayan seleccionado tanto el salón como la fecha. No existe pista previa (affordance) que anticipe su existencia.
   - *Diagnóstico Heurístico:* Infracción de la Heurística #2 (*Correspondencia entre el sistema y el mundo real*) y el principio de predictibilidad.

---

## 5. Implementación del Factory Method (Notificaciones Toasts)

- **Contenedor:** `fixed top-20 right-6 flex flex-col gap-3 z-50`
- **Estructura Base:** `bg-white w-80 p-4 rounded-xl shadow-xl border-l-8 flex items-start gap-3 transform transition-all duration-300 relative`
- **Variante Creada / Aprobada:** `border-orange-500`, texto y acento `text-orange-500`.
- **Variante Rechazada / Cancelada:** `border-gray-800`, texto y acento `text-gray-800` (cumpliendo la prohibición de usar rojo).
