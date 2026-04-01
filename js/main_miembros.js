/**
 * Entry point para la zona de miembros de la OCGC
 * Conectado con la API de Django para gestionar sesiones y partituras
 */
import { loadMembersComponents } from './components.js';
import { initScrollAnimations } from './animations.js';
import { API, getToken, removeToken } from './api.js';

let currentUser = null;
let allCategories = [];
let allScores = [];

// ── 1. Control de acceso y obtención de usuario ──
async function initUserSession() {
    if (!getToken()) {
        const { basePath } = await import('./utils.js');
        window.location.href = `${basePath}miembros/`;
        return false;
    }

    try {
        currentUser = await API.getCurrentUser();
        // Mostrar nombre en el header
        const displayName = document.getElementById('user-display-name');
        if (displayName) displayName.textContent = currentUser.first_name || currentUser.username;
        
        // Mostrar nombre en el badge del repositorio (si estamos en esa página)
        const badge = document.getElementById('repo-user-badge');
        if (badge) badge.textContent = currentUser.first_name || currentUser.username;

        return true;
    } catch(err) {
        console.error("Error al obtener usuario. Cerrando sesión...", err);
        return false; // Error ya tratado en api.js borrando token y redirigiendo
    }
}

// ── 2. Carga y gestión dinámica del repositorio ──
async function initDynamicRepo() {
    const sidebar = document.querySelector('.repositorio-sidebar');
    if (!sidebar) return; // Solo ejecutar en la pestaña del repositorio

    try {
        // Obtenemos los datos en paralelo
        const [catData, scoresData] = await Promise.all([
            API.getCategories(),
            API.getScores()
        ]);
        
        allCategories = catData;
        allScores = scoresData;

        // Construir sidebar
        sidebar.innerHTML = '';
        if (allCategories.length === 0) {
            sidebar.innerHTML = '<div style="padding:1rem; color:#666">No hay conjuntos disponibles</div>';
            return;
        }

        allCategories.forEach((cat, index) => {
            const div = document.createElement('div');
            div.className = `repo-tab ${index === 0 ? 'active' : ''}`;
            div.dataset.repoId = cat.id;
            div.textContent = cat.name;
            
            div.addEventListener('click', () => {
                document.querySelectorAll('.repo-tab').forEach(t => t.classList.remove('active'));
                div.classList.add('active');
                
                const titleEl = document.querySelector('.repo-header h2');
                if (titleEl) titleEl.textContent = cat.name;
                
                renderScores(cat.id);
            });

            sidebar.appendChild(div);
        });

        // Configurar título inicial y renderizar primer contenido
        const titleEl = document.querySelector('.repo-header h2');
        if (titleEl) titleEl.textContent = allCategories[0].name;
        renderScores(allCategories[0].id);

    } catch(err) {
        console.error("No se pudieron cargar las partituras", err);
    }
}

function renderScores(categoryId) {
    const list = document.getElementById('repo-file-list');
    if (!list) return;

    const filteredScores = allScores.filter(s => s.category && s.category.id === categoryId);

    if (filteredScores.length === 0) {
        list.innerHTML = '<p class="repo-empty">No hay archivos visibles para ti en este apartado.</p>';
        return;
    }

    list.innerHTML = filteredScores.map(score => `
        <a class="file-item" href="${score.file}" target="_blank" style="text-decoration:none; color:inherit;">
            <i class="far fa-file-pdf file-icon" style="color: #da291c;"></i>
            <div class="file-info">
                <h4>${score.title}</h4>
                <div class="category">Categoría: <span>${score.category.name}</span></div>
            </div>
            <i class="fas fa-download" style="color:#aaa; font-size:1.2rem; margin-left:1rem;"></i>
        </a>
    `).join('');
}


// ── 3. Init de la página ──
document.addEventListener('DOMContentLoaded', async () => {
    // 0. Comprobar seguridad antes de enseñar nada crítico
    const isLogged = await initUserSession();
    if (!isLogged) return;

    // 1. Cargar header y footer
    await loadMembersComponents({
        onReady: async () => {
            // Activar botón de salir
            const logoutLinks = document.querySelectorAll('a[href*="index.html"]'); // Selector flexible
            logoutLinks.forEach(l => {
                if(l.textContent.includes('Salir') || l.innerHTML.includes('sign-out')) {
                    l.addEventListener('click', (e) => {
                        e.preventDefault();
                        removeToken();
                        window.location.href = l.href;
                    });
                }
            });

            // 2. Cargar repositorio real si estamos en esa vista
            await initDynamicRepo();
        }
    });

    initScrollAnimations();
});
