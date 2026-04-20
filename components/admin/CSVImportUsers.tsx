"use client";

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { useNotifications } from '../ui/NotificationContext';

export default function CSVImportUsers({ onImportSuccess }: { onImportSuccess: () => void }) {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, skipped: 0, errors: 0 });
  const shouldStop = useRef(false);

  const [detailedErrors, setDetailedErrors] = useState<string[]>([]);

  const processCSV = (file: File) => {
    setLoading(true);
    setErrorInfo(null);
    setDetailedErrors([]);
    shouldStop.current = false;
    setProgress({ current: 0, total: 0, success: 0, skipped: 0, errors: 0 });
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[];
        const total = rows.length;
        setProgress(p => ({ ...p, total }));

        let successCount = 0;
        let skippedCount = 0;
        let errorList: string[] = [];
        
        for (let i = 0; i < rows.length; i++) {
          if (shouldStop.current) {
            showToast("Importación detenida por el usuario", "warning");
            break;
          }

          const row = rows[i];
          setProgress(p => ({ ...p, current: i + 1 }));

          // Normalización de claves para soportar tildes (agrupación, sección, matrícula)
          const findVal = (keys: string[]) => {
            const foundKey = Object.keys(row).find(k => 
              keys.includes(k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
            );
            return foundKey ? row[foundKey] : undefined;
          };

          const nombre = findVal(['name', 'nombre']);
          const apellidos = findVal(['surname', 'apellidos']);
          const dni = findVal(['dni']);
          const identifier = `${nombre || ''} ${apellidos || ''}`.trim() || dni || `Fila ${i + 1}`;

          const email = findVal(['email', 'correo']);
          const phone = findVal(['phone', 'telefono']);
          const birthDate = findVal(['birth_date', 'fecha_nacimiento']);
          const papel = findVal(['papel']);
          const agrupacion = findVal(['agrupacion']);
          const seccion = findVal(['seccion']);
          const matricula = findVal(['matricula_number', 'matricula', 'matricula_coche']);
          
          const esMaster = String(findVal(['es_master', 'ismaster'])).toLowerCase() === 'true';
          const esArchivero = String(findVal(['es_archivero', 'isarchiver'])).toLowerCase() === 'true';
          const esVendedor = String(findVal(['es_vendedor', 'es_seller', 'isseller'])).toLowerCase() === 'true';
          const esExternal = String(findVal(['es_external', 'isexternal'])).toLowerCase() === 'true';
          
          const activoRaw = findVal(['activo', 'is_active', 'isactive']);
          const activo = activoRaw ? String(activoRaw).toLowerCase() === 'true' : true;
          const atrilRaw = findVal(['atril']);
          const atril = atrilRaw ? parseInt(String(atrilRaw)) : null;

          const isla = findVal(['isla']);
          const municipio = findVal(['municipio']);
          const empadronamiento = findVal(['empadronamiento']);
          const trabajo = findVal(['trabajo']);
          const estudios = findVal(['estudios']);

          try {
            const res = await fetch('/api/admin/users/import', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email, firstName: nombre, lastName: apellidos, dni, phone, birthDate,
                roles: seccion ? [seccion] : [],
                isMaster: esMaster, isArchiver: esArchivero, isSeller: esVendedor, isExternal: esExternal,
                agrupacion, seccion, papel, matricula, activo,
                atril: isNaN(atril as number) ? null : atril,
                isla, municipio, empadronamiento, trabajo, estudios
              })
            });
            
            const resData = await res.json();

            if (res.ok) {
              if (resData.skipped) {
                skippedCount++;
                setProgress(p => ({ ...p, skipped: skippedCount }));
              } else {
                successCount++;
                setProgress(p => ({ ...p, success: successCount }));
              }
            } else {
              errorList.push(`Error en [${identifier}]: ${resData.error || 'Error desconocido'}`);
              setProgress(p => ({ ...p, errors: errorList.length }));
            }
          } catch(e) {
            errorList.push(`Fallo de conexión en [${identifier}]: No se pudo contactar con el servidor`);
            setProgress(p => ({ ...p, errors: errorList.length }));
          }
        }
        
        if (errorList.length > 0) {
          setDetailedErrors(errorList);
          setErrorInfo(`Proceso finalizado con ${errorList.length} errores.`);
        } else if (!shouldStop.current) {
          showToast(`✓ Importación completada. Procesados: ${successCount + skippedCount} (${skippedCount} ya existían)`);
        }
        
        setLoading(false);
        onImportSuccess();
      },
      error: (err) => {
        setErrorInfo("Error crítico al leer CSV: " + err.message);
        setLoading(false);
      }
    });
  };

  return (
    <div style={{ background: '#fff9f9', padding: '1.5rem', borderRadius: '12px', border: '1px dashed #e74c3c' }}>
      <h3 style={{ margin: '0 0 1rem', color: '#c0392b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.4rem' }}>👥</span> Importar Miembros por CSV
      </h3>
      
      <div style={{ background: '#fff', padding: '1.2rem', borderRadius: '10px', border: '1px solid #ffcdd2', marginBottom: '1.5rem', fontSize: '0.82rem' }}>
        <details>
          <summary style={{ fontWeight: 700, color: '#c0392b', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
            📋 Guía de columnas del CSV (haz clic para expandir)
          </summary>
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>

            <div>
              <p style={{ margin: '0 0 0.4rem', fontWeight: 700, color: '#333' }}>✅ Obligatorias</p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead><tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', border: '1px solid #eee' }}>Encabezado</th>
                  <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', border: '1px solid #eee' }}>Descripción</th>
                </tr></thead>
                <tbody>
                  {[
                    ['nombre / name', 'Nombre de pila del músico'],
                    ['apellidos / surname', 'Apellidos completos'],
                    ['dni', 'DNI o NIE — actúa como identificador único']
                  ].map(([col, desc]) => (
                    <tr key={col}><td style={{ padding: '0.3rem 0.6rem', border: '1px solid #eee', fontFamily: 'monospace', color: '#c0392b' }}>{col}</td><td style={{ padding: '0.3rem 0.6rem', border: '1px solid #eee', color: '#555' }}>{desc}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <p style={{ margin: '0 0 0.4rem', fontWeight: 700, color: '#333' }}>📌 Acceso a plataforma</p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead><tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', border: '1px solid #eee' }}>Encabezado</th>
                  <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', border: '1px solid #eee' }}>Descripción</th>
                </tr></thead>
                <tbody>
                  {[
                    ['email / correo', 'Correo electrónico. Sin email → usuario Externo (sin acceso)'],
                    ['telefono / phone', 'Teléfono de contacto'],
                    ['fecha_nacimiento / birth_date', 'Fecha en formato YYYY-MM-DD (ej: 1990-05-20)']
                  ].map(([col, desc]) => (
                    <tr key={col}><td style={{ padding: '0.3rem 0.6rem', border: '1px solid #eee', fontFamily: 'monospace', color: '#1a6b3c' }}>{col}</td><td style={{ padding: '0.3rem 0.6rem', border: '1px solid #eee', color: '#555' }}>{desc}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <p style={{ margin: '0 0 0.4rem', fontWeight: 700, color: '#333' }}>🎵 Perfil artístico</p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead><tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', border: '1px solid #eee' }}>Encabezado</th>
                  <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', border: '1px solid #eee' }}>Descripción</th>
                </tr></thead>
                <tbody>
                  {[
                    ['agrupacion', 'Nombre exacto de la agrupación (ej: Orquesta, Coro)'],
                    ['seccion', 'Sección o instrumento (ej: Violín primero, Soprano)'],
                    ['papel', 'Papel musical (ej: Músico, Director, Solista)'],
                    ['atril', 'Número de atril (entero, opcional)'],
                    ['activo', 'true / false — si el perfil está activo (defecto: true)']
                  ].map(([col, desc]) => (
                    <tr key={col}><td style={{ padding: '0.3rem 0.6rem', border: '1px solid #eee', fontFamily: 'monospace', color: '#1a4bb5' }}>{col}</td><td style={{ padding: '0.3rem 0.6rem', border: '1px solid #eee', color: '#555' }}>{desc}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <p style={{ margin: '0 0 0.4rem', fontWeight: 700, color: '#333' }}>🛡️ Permisos (defecto: false)</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {['es_master', 'es_archivero', 'es_vendedor', 'es_external'].map(col => (
                  <span key={col} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.2rem 0.5rem', fontFamily: 'monospace', fontSize: '0.75rem', color: '#475569' }}>{col}</span>
                ))}
              </div>
              <p style={{ margin: '0.4rem 0 0', color: '#888', fontSize: '0.75rem' }}>Poner <code>true</code> solo si el músico debe tener ese rol desde el inicio.</p>
            </div>

            <div>
              <p style={{ margin: '0 0 0.4rem', fontWeight: 700, color: '#333' }}>🏠 Residencia (opcional)</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {['isla', 'municipio', 'empadronamiento'].map(col => (
                  <span key={col} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.2rem 0.5rem', fontFamily: 'monospace', fontSize: '0.75rem', color: '#475569' }}>{col}</span>
                ))}
              </div>
            </div>

            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.6rem 0.8rem' }}>
              <p style={{ margin: 0, color: '#92400e', fontSize: '0.78rem' }}>
                <strong>💡 Clave de idempotencia:</strong> El sistema usa el <strong>DNI</strong> como clave única. Si ya existe, actualiza los datos y añade estructuras nuevas sin duplicar. Si agrupación+sección+papel ya están asignadas, la fila se omite.
              </p>
            </div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.6rem 0.8rem' }}>
              <p style={{ margin: 0, color: '#166534', fontSize: '0.78rem' }}>
                <strong>🔐 Contraseña inicial:</strong> Para usuarios con email, la contraseña inicial es su <strong>DNI en mayúsculas</strong>. Su nombre de usuario (para login) también es el DNI en mayúsculas si no se especifica otro.
              </p>
            </div>
          </div>
        </details>
      </div>


      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {!loading ? (
            <label style={{ 
              background: '#e74c3c', 
              color: 'white', 
              padding: '0.6rem 1.2rem', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.9rem',
            }}>
              📁 Seleccionar Archivo CSV
              <input 
                type="file" 
                accept=".csv"
                onChange={(e) => {
                  if (e.target.files?.[0]) processCSV(e.target.files[0]);
                }}
                style={{ display: 'none' }}
              />
            </label>
          ) : (
            <button 
              onClick={() => { shouldStop.current = true; }}
              style={{
                background: '#475569',
                color: 'white',
                border: 'none',
                padding: '0.6rem 1.2rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              🛑 Detener Importación
            </button>
          )}

          {loading && (
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.85rem', color: '#e74c3c', fontWeight: 'bold', marginBottom: '0.3rem' }}>
                Procesando fila {progress.current} de {progress.total}...
              </div>
              <div style={{ width: '100%', height: '8px', background: '#fee2e2', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${(progress.current/progress.total)*100}%`, height: '100%', background: '#e74c3c', transition: 'width 0.3s' }} />
              </div>
            </div>
          )}
        </div>

        {(loading || progress.current > 0) && (
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#64748b', background: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
            <span>✅ Nuevos: <strong style={{ color: '#10b981' }}>{progress.success}</strong></span>
            <span>⏭️ Omitidos: <strong style={{ color: '#3b82f6' }}>{progress.skipped}</strong></span>
            <span>❌ Errores: <strong style={{ color: '#ef4444' }}>{progress.errors}</strong></span>
          </div>
        )}
      </div>

      {detailedErrors.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', fontWeight: 'bold', color: '#e74c3c' }}>❌ Informe detallado de errores:</p>
          <div style={{ 
            maxHeight: '200px', 
            overflowY: 'auto', 
            background: '#fff', 
            border: '1px solid #ffcdd2', 
            borderRadius: '8px', 
            padding: '1rem',
            fontSize: '0.8rem',
            fontFamily: 'monospace',
            color: '#c0392b',
            lineHeight: '1.6'
          }}>
            {detailedErrors.map((err, idx) => (
              <div key={idx} style={{ paddingBottom: '0.4rem', borderBottom: idx < detailedErrors.length - 1 ? '1px solid #fff1f0' : 'none', marginBottom: '0.4rem' }}>
                • {err}
              </div>
            ))}
          </div>
        </div>
      )}

      {errorInfo && !detailedErrors.length && (
        <div style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '1rem', background: '#fff', padding: '0.8rem', borderRadius: '6px', border: '1px solid #ffcdd2' }}>
          <strong>Aviso:</strong> {errorInfo}
        </div>
      )}
    </div>
  );
}



