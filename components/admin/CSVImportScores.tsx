"use client";

import { useState } from 'react';
import Papa from 'papaparse';
import { useNotifications } from '../ui/NotificationContext';

export default function CSVImportScores({ categories, onImportSuccess }: { categories: any[], onImportSuccess: () => void }) {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  const [isGuideExpanded, setIsGuideExpanded] = useState(false);

  const handleCSVSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
        setErrorInfo(null);
      },
      error: (err) => setErrorInfo("Error al leer CSV: " + err.message)
    });
  };

  const findInRow = (row: any, keys: string[]) => {
    const rowKeys = Object.keys(row);
    for (const key of keys) {
      // Búsqueda exacta
      if (row[key] !== undefined) return row[key];
      // Búsqueda insensible a mayúsculas
      const lowerKey = key.toLowerCase();
      const match = rowKeys.find(rk => rk.toLowerCase() === lowerKey);
      if (match) return row[match];
      // Búsqueda sin acentos (muy común: título vs titulo)
      const cleanKey = key.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const matchClean = rowKeys.find(rk => rk.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === cleanKey);
      if (matchClean) return row[matchClean];
    }
    return undefined;
  };

  const startImport = async () => {
    if (!csvData.length || !selectedFiles) {
      showToast("Debes cargar el CSV y seleccionar las partituras físicas (.pdf)", "error");
      return;
    }

    setLoading(true);
    let successCount = 0;
    const fileMap = new Map<string, File>();
    for (let i = 0; i < selectedFiles.length; i++) {
      fileMap.set(selectedFiles[i].name, selectedFiles[i]);
    }

    for (const row of csvData) {
      try {
        const title = findInRow(row, ['titulo', 'título', 'nombre', 'title']);
        const fileNameRaw = findInRow(row, ['archivo_pdf', 'archivo', 'pdf', 'filename']);
        const progNameRaw = findInRow(row, ['nombre_programa', 'programa', 'categoria', 'category']);
        const agrupacionesRaw = findInRow(row, ['agrupaciones', 'agrupación', 'agrupacion']);
        const instrumentosRaw = findInRow(row, ['instrumentos', 'roles', 'instrumento']);
        const esDocumentoRaw = findInRow(row, ['es_documento', 'documento', 'is_document']);

        if (!title) {
          console.error("Fila ignorada: Falta el título.");
          continue;
        }

        if (!fileNameRaw) {
          console.error(`Fila ignorada (${title}): Falta el nombre del archivo PDF.`);
          continue;
        }
        
        const fileName = fileNameRaw.split('/').pop()?.split('\\').pop() || '';
        const actualFile = fileMap.get(fileName);

        if (!actualFile) {
          console.error(`Fila ignorada (${title}): Archivo '${fileName}' no encontrado en la selección.`);
          continue;
        }

        let matchedCategoryId = "";
        const progName = String(progNameRaw || '').trim().toLowerCase();
        if (progName) {
           const found = categories.find(c => c.name.toLowerCase() === progName);
           if (found) {
             matchedCategoryId = String(found.id);
           } else {
             console.warn(`Aviso (${title}): El programa '${progNameRaw}' no existe. Se marcará como 'Sin Programa' o fallará si no es un documento.`);
           }
        }

        const fd = new FormData();
        fd.append('title', title);
        fd.append('categoryId', matchedCategoryId);
        fd.append('file', actualFile);
        fd.append('isDocument', (String(esDocumentoRaw).toLowerCase() === 'true' || esDocumentoRaw === 'on') ? 'on' : '');
        
        if (agrupacionesRaw) {
          String(agrupacionesRaw).split(',').forEach((a: string) => fd.append('agrupaciones', a.trim()));
        }

        if (instrumentosRaw) {
          String(instrumentosRaw).split(',').forEach((i: string) => fd.append('roles', i.trim()));
        }

        const res = await fetch('/api/scores/create', { method: 'POST', body: fd });
        if (res.ok) {
          successCount++;
        } else {
          const errText = await res.text();
          console.error(`Error de API en fila "${title}":`, errText);
        }
      } catch (e) {
        console.error("Error crítico en procesamiento de fila:", row, e);
      }
    }

    const failed = csvData.length - successCount;
    if (successCount === csvData.length) {
      showToast(`¡Éxito! Se han importado las ${successCount} partituras correctamente.`, "success");
    } else {
      showToast(`Carga parcial: ${successCount} éxitos, ${failed} errores. Revisa la consola para más detalles.`, "warning");
    }
    setLoading(false);
    onImportSuccess();
    setCsvData([]);
    setSelectedFiles(null);
  };

  return (
    <div style={{ background: '#f0f7ff', padding: '2.5rem', borderRadius: '16px', border: '2px solid #b3d7ff', marginTop: '2.5rem', boxShadow: '0 4px 15px rgba(0,112,243,0.05)' }}>
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', marginBottom: isGuideExpanded ? '1.5rem' : '0' }} 
        onClick={() => setIsGuideExpanded(!isGuideExpanded)}
      >
        <h3 style={{ margin: 0, color: '#0070f3', fontSize: '1.4rem', fontWeight: 800 }}>📂 Guía de Importación Masiva</h3>
        <span style={{ color: '#0070f3', fontSize: '1.2rem', transition: 'transform 0.3s', transform: isGuideExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▼</span>
      </div>
      
      {isGuideExpanded && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem', background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e1f0ff' }}>
          <div>
            <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#333', fontWeight: 800 }}>Paso 1: Tu Carpeta de PDFs</h4>
            <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.5' }}>Pon todos tus archivos `.pdf` en una carpeta. Los nombres deben ser simples (ej: `Sinfonia9_Viola.pdf`).</p>
          </div>
          <div>
            <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#333', fontWeight: 800 }}>Paso 2: Tu archivo CSV</h4>
            <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.5' }}>Crea un Excel con estas columnas y gúardalo como CSV. <strong>Para varios instrumentos, sepáralos por comas:</strong></p>
            <code style={{ display: 'block', background: '#f8f9fa', padding: '0.5rem', borderRadius: '4px', fontSize: '0.75rem', marginTop: '0.5rem', border: '1px solid #eee' }}>
              titulo, nombre_programa, archivo_pdf, agrupaciones, instrumentos, es_documento<br/>
              Sinfonía 9, Temporada 2024, S9_Viento.pdf, "Orquesta Sinfónica", "Flauta, Oboe, Fagot", false
            </code>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem', marginTop: isGuideExpanded ? '0' : '1.5rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.5)', padding: '1.2rem', borderRadius: '10px', border: '1px dashed #0070f3' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.8rem', color: '#1a2a4b' }}>1️⃣ Seleccionar el CSV de Datos</label>
          <input type="file" accept=".csv" onChange={handleCSVSelect} disabled={loading} style={{ fontSize: '0.85rem', width: '100%' }} />
        </div>
        
        <div style={{ background: 'rgba(255,255,255,0.5)', padding: '1.2rem', borderRadius: '10px', border: '1px dashed #0070f3' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.8rem', color: '#1a2a4b' }}>2️⃣ Seleccionar TODOS los PDFs</label>
          <input type="file" accept=".pdf" multiple onChange={(e) => setSelectedFiles(e.target.files)} disabled={loading} style={{ fontSize: '0.85rem', width: '100%' }} />
        </div>
      </div>

      {csvData.length > 0 && selectedFiles && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#e1f5fe', borderRadius: '10px', fontSize: '0.9rem', display: 'flex', justifyContent: 'center', gap: '2rem', border: '1px solid #b3e5fc', color: '#01579b' }}>
          <span>📊 Filas CSV: <strong>{csvData.length}</strong></span>
          <span>📄 Archivos PDF: <strong>{selectedFiles.length}</strong></span>
        </div>
      )}

      <button 
        onClick={startImport} 
        disabled={loading || csvData.length === 0}
        style={{ 
          width: '100%', 
          padding: '1.2rem', 
          background: loading ? '#ccc' : '#478AC9', 
          color: 'white', 
          border: 'none', 
          borderRadius: '30px', 
          cursor: loading ? 'not-allowed' : 'pointer', 
          fontWeight: '800', 
          fontSize: '1rem',
          boxShadow: '0 4px 15px rgba(71, 138, 201, 0.3)',
          transition: 'all 0.3s'
        }}
      >
        {loading ? "⚙️ PROCESANDO CARGA MASIVA..." : "🚀 INICIAR SUBIDA DE ARCHIVOS"}
      </button>

      {errorInfo && <p style={{ color: '#e74c3c', background: '#fff0f0', padding: '1rem', borderRadius: '8px', border: '1px solid #ffcdd2', fontSize: '0.85rem', marginTop: '1.5rem' }}>{errorInfo}</p>}
    </div>
  );
}
