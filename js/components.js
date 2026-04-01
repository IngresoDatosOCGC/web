/**
 * Carga de componentes dinámicos
 */
import { basePath, normalizePaths } from './utils.js';
import { initNavEvents } from './ui.js';

/** Carga el header y footer públicos de la web */
export async function loadComponents() {
    try {
        const headerPlaceholder = document.getElementById('header-placeholder');
        const footerPlaceholder = document.getElementById('footer-placeholder');

        if (headerPlaceholder) {
            const headerRes = await fetch(basePath + 'components/header.html');
            if (headerRes.ok) {
                let headerHtml = await headerRes.text();
                headerPlaceholder.innerHTML = normalizePaths(headerHtml);
                initNavEvents();
            }
        }

        if (footerPlaceholder) {
            const footerRes = await fetch(basePath + 'components/footer.html');
            if (footerRes.ok) {
                let footerHtml = await footerRes.text();
                footerPlaceholder.innerHTML = normalizePaths(footerHtml);
            }
        }
    } catch (e) {
        console.error('Error al cargar los componentes:', e);
    }
}

/** Carga el header y footer de la zona de miembros */
export async function loadMembersComponents({ onReady } = {}) {
    try {
        const headerPlaceholder = document.getElementById('header-placeholder');
        const footerPlaceholder = document.getElementById('footer-placeholder');

        if (headerPlaceholder) {
            const headerRes = await fetch(basePath + 'components/header_miembros.html');
            if (headerRes.ok) {
                let headerHtml = await headerRes.text();
                headerPlaceholder.innerHTML = normalizePaths(headerHtml);
                initNavEvents();
            }
        }

        if (footerPlaceholder) {
            const footerRes = await fetch(basePath + 'components/footer_miembros.html');
            if (footerRes.ok) {
                let footerHtml = await footerRes.text();
                footerPlaceholder.innerHTML = normalizePaths(footerHtml);
            }
        }

        // Callback once BOTH header and footer are in the DOM
        if (typeof onReady === 'function') onReady();

    } catch (e) {
        console.error('Error al cargar los componentes de miembros:', e);
    }
}
