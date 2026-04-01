/**
 * Utilidades globales
 */

// Detectamos la ruta base buscando cualquier punto de entrada de la app
const scriptTag = document.querySelector('script[src*="js/main"]');
const src = scriptTag ? scriptTag.getAttribute('src') : '';

// Extrae la ruta hasta la carpeta raíz (elimina "js/main*.js")
export const basePath = src ? src.replace(/js\/main[^/]*\.js$/, '') : '';

/**
 * Función inteligente para insertar el basePath en todos los enlaces y recursos
 */
export function normalizePaths(htmlContent) {
    return htmlContent
        .replace(/(src|href)="(?!\.\.\/|http|https|#|\/)([^"]+)"/g, `$1="${basePath}$2"`)
        .replace(/(src|href)="\.\.\/([^"]+)"/g, `$1="${basePath}$2"`);
}
