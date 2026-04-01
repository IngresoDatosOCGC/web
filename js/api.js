// Configuración base de la API
export const API_URL = 'http://127.0.0.1:8000/api';

/** Manejo del Token en LocalStorage */
export function setToken(token) {
    localStorage.setItem('ocgc_token', token);
}

export function getToken() {
    return localStorage.getItem('ocgc_token');
}

export function removeToken() {
    localStorage.removeItem('ocgc_token');
}

/** 
 * Wrapper para hacer peticiones autenticadas
 */
export async function apiFetch(endpoint, options = {}) {
    const token = getToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    // Si da 401 Unauthorized y no es en el login, borrar token y echar al usuario
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
        removeToken();
        const { basePath } = await import('./utils.js');
        window.location.href = `${basePath}miembros/`;
        throw new Error('Sesión expirada');
    }

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw { status: response.status, data: errData };
    }

    return response.json();
}

/** 
 * Servicio principal de la API
 */
export const API = {
    async login(username, password) {
        const data = await apiFetch('/auth/login/', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        if (data.access) {
            setToken(data.access);
        }
        return data;
    },

    async getCurrentUser() {
        return await apiFetch('/auth/me/');
    },

    async getCategories() {
        return await apiFetch('/categories/');
    },

    async getScores() {
        return await apiFetch('/scores/');
    }
};
