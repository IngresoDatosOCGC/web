/**
 * Eventos de UI y navegación
 */

export function initNavEvents() {
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');

    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }

    // Scroll effect on header (sombra para dar profundidad)
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
            } else {
                header.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
            }
        });
    }

    // Resaltar elemento de menú activo usando ruta completa
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        // Usar la propiedad DOM .href (absoluta) para comparación fiable
        try {
            const linkPath = new URL(link.href).pathname;
            // Coincide si la ruta actual contiene la del enlace (y no es solo la raíz)
            if (linkPath.length > 1 && currentPath.includes(linkPath)) {
                link.style.color = 'var(--primary-color)';
                link.style.fontWeight = '700';
            }
        } catch(e) { /* ignora hrefs no válidas */ }
    });
}

/**
 * Función para alternar visibilidad de formularios modales
 */
export function toggleForm(formId) {
    const formElement = document.getElementById(formId);
    if (formElement) {
        if (formElement.style.display === 'none' || formElement.style.display === '') {
            formElement.style.display = 'flex';
        } else {
            formElement.style.display = 'none';
        }
    }
}

// Hacemos toggleForm global para los eventos onclick antiguos
window.toggleForm = toggleForm;
