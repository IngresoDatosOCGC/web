"use client";

import { useState } from 'react';
import Papa from 'papaparse';

export default function CSVImportScores({ categories, onImportSuccess }: { categories: any[], onImportSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  const processCSV = (file: File) => {
    setLoading(true);
    setErrorInfo(null);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[];
        let successCount = 0;
        
        for (const row of rows) {
          // Asumimos formato CSV: titulo, programa_id, url_archivo, instrumentos (separados por coma), es_documento (true/false)
          try {
            const fd = new FormData();
            fd.append('title', row.titulo || '');
            fd.append('categoryId', row.programa_id || '');
            fd.append('fileUrl', row.url_archivo || ''); // Asumiendo que la API acepta un fileUrl si no se sube un blob nuevo
            fd.append('isDocument', row.es_documento === 'true' ? 'on' : '');
            
            if (row.instrumentos) {
               const instr = row.instrumentos.split(',').map((s:string) => s.trim());
               instr.forEach((i:string) => fd.append('roles', i));
            }

            const res = await fetch('/api/scores/create-batch', {
              method: 'POST',
              body: fd
            });
            
            if (res.ok) successCount++;
          } catch(e) {
            console.error("Fallo al importar fila:", row);
          }
        }
        
        alert(`Importación completada. Partituras subidas: ${successCount} de ${rows.length}`);
        setLoading(false);
        onImportSuccess();
      },
      error: (err) => {
        setErrorInfo("Error al leer CSV: " + err.message);
        setLoading(false);
      }
    });
  };

  return (
    <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px dashed #ccc', marginTop: '2rem' }}>
      <h3 style={{ margin: '0 0 1rem' }}>📥 Importar Partituras (Batch CSV)</h3>
      <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>Sube un CSV. Columnas requeridas: <code>titulo, programa_id, url_archivo, instrumentos, es_documento</code></p>
      <input 
        type="file" 
        accept=".csv"
        disabled={loading}
        onChange={(e) => {
          if (e.target.files?.[0]) processCSV(e.target.files[0]);
        }}
      />
      {loading && <span style={{ marginLeft: '1rem', color: '#478AC9', fontWeight: 'bold' }}>Procesando importación...</span>}
      {errorInfo && <p style={{ color: 'red', fontSize: '0.9rem', marginTop: '1rem' }}>{errorInfo}</p>}
    </div>
  );
}
