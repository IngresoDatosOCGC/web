"use client";

import { useState } from 'react';

const HELPS = {
  dashboard: {
    title: "📊 Dashboard Estadístico",
    desc: "Métricas en tiempo real de la orquesta y el archivo.",
    steps: [
      "Visualiza el total de músicos registrados y obras disponibles.",
      "Observa la distribución por familias (Cuerda, Viento, etc.) en los gráficos.",
      "Control de Participación: Monitoriza cuántos músicos están 'Activos' (tienen al menos una agrupación vinculada) frente a los inactivos.",
      "Archivística: Consulta los programas con más material cargado para prever la carga de trabajo."
    ]
  },
  scores: {
    title: "🎼 Gestión de Partituras",
    desc: "Central para subir y organizar todo el material musical.",
    steps: [
      "Agrupación y Etiqueta: Para que un músico vea una partitura, el archivo debe coincidir con su Agrupación (ej: Orquesta) Y su Etiqueta (ej: Oboe).",
      "Documentos Generales: Usa 'Documento' para reglamentos o partituras que TODOS los músicos del proyecto deban ver.",
      "Categorización: Asigna las partituras a un Programas / Conciertos para que aparezcan agrupadas en el área privada.",
      "Importación Masiva: Carga un CSV con metadatos y luego sube los PDFs. El sistema los vinculará automáticamente por el nombre del archivo."
    ]
  },
  categories: {
    title: "📅 Programas y Conciertos",
    desc: "Agrupadores lógicos de partituras y eventos.",
    steps: [
      "Crea programas para agrupar partituras de un mismo concierto.",
      "Cronología: Las fechas determinan el orden en que los músicos ven los programas en su tablón.",
      "Vínculo con Agenda: Al crear un programa, puedes asociarle eventos del calendario para que el músico tenga todo en un solo lugar."
    ]
  },
  sections: {
    title: "🏛️ Estructuras y Catálogos",
    desc: "Configura la base jerárquica de la plataforma.",
    steps: [
      "Secciones y Agrupaciones: Aquí defines qué instrumentos/secciones existen en cada agrupación (ej: 'Soprano' en 'Coro').",
      "Papeles: Define roles como 'Músico', 'Director' o 'Solista'.",
      "Diccionario de Etiquetas (Roles): Gestiona las etiquetas que se usan para filtrar las partituras. Recuerda que un músico ve lo que coincida con su etiqueta asignada."
    ]
  },
  personal: {
    title: "👥 Gestión de Miembros",
    desc: "Control total de los miembros y sus permisos.",
    steps: [
      "Gestión de Email y Acceso: Ahora puedes editar el email de cualquier usuario. Si el usuario era 'Externo', al añadirle un email se le creará automáticamente una cuenta en la plataforma.",
      "Credenciales por Defecto: Para nuevos usuarios o conversiones, el Usuario y la Contraseña inicial son su DNI en mayúsculas.",
      "Estructuras Artísticas: Un músico puede estar en varias agrupaciones a la vez. Edítalas desde el icono (✎) para activar/desactivar sus perfiles artísticos.",
      "Permisos Especiales: Activa o desactiva los roles de 'Master', 'Archivero', 'Jefe de Sección' o 'Vendedor' directamente desde la tabla con los iconos de estado.",
      "Importación CSV: Usa la herramienta de carga masiva para dar de alta a toda una sección rápidamente usando el DNI como identificador único."
    ]
  },
  calendar: {
    title: "🗓️ Agenda OCGC",
    desc: "Controlador de los próximos hitos de la OCGC.",
    steps: [
      "Importación Inteligente: Sube calendarios desde .CSV o .ICS. El sistema detecta duplicados y actualiza eventos existentes.",
      "Vínculo con Programas: Los eventos vinculados a un programa de partituras permiten al músico descargar el material directamente desde el calendario.",
      "Colocación en el Tablón: Los eventos próximos aparecen destacados en la página principal del músico."
    ]
  },
  requests: {
    title: "📩 Solicitudes y Captación",
    desc: "Gestión de músicos interesados en unirse.",
    steps: [
      "Evaluación: Revisa los datos de los aspirantes y su experiencia previa.",
      "Alta Directa: Al 'Aceptar' una solicitud, puedes invitarlos al sistema precargando su información para evitar errores de escritura.",
      "Historial: Mantén un registro de quiénes han solicitado entrar para futuras vacantes."
    ]
  },
  logs: {
    title: "📝 Registro de Actividad",
    desc: "Trazabilidad completa de acciones administrativas.",
    steps: [
      "Transparencia: Consulta quién ha realizado cambios en el archivo, en los permisos de usuario o en la configuración del sistema.",
      "Resolución de Dudas: Usa el filtro por fechas para entender cuándo y por qué se modificó un dato específico.",
      "Seguridad: Cada acceso y cambio crítico queda registrado con nombre y hora exacta."
    ]
  }
};

export default function AdminGuideModal({ activeTab, onClose }: { activeTab: string, onClose: () => void }) {
  const help = HELPS[activeTab as keyof typeof HELPS];
  if (!help) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '1rem' }} onClick={onClose}>
      <div 
        style={{ 
          background: 'white', 
          maxWidth: '550px', 
          width: '100%', 
          borderRadius: '24px', 
          padding: '2.5rem', 
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', 
          position: 'relative',
          border: '1px solid #eef2f6',
          fontFamily: "'Inter', sans-serif"
        }} 
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#f8fafc', border: 'none', width: '36px', height: '36px', borderRadius: '50%', fontSize: '1.1rem', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>✕</button>

        <section>
          <ul style={{ padding: 0, listStyle: 'none', margin: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {help.steps.map((step, idx) => (
              <li key={idx} style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start' }}>
                <span style={{ 
                  minWidth: '28px', 
                  height: '28px', 
                  background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', 
                  color: 'white', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '0.8rem', 
                  fontWeight: 800, 
                  marginTop: '2px',
                  boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
                }}>{idx + 1}</span>
                <span style={{ color: '#334155', lineHeight: '1.6', fontSize: '0.95rem' }}>{step}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
