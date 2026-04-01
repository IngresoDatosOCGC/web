/**
 * Entry point modular para la web OCGC
 */
import { loadComponents } from './components.js';
import { initScrollAnimations, initSmoothScroll } from './animations.js';
import { API } from './api.js';
import { basePath } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    // Iniciar carga de componentes (Header/Footer)
    loadComponents();
    
    // Iniciar animaciones de scroll
    initScrollAnimations();

    // Iniciar scroll suave para anclas #
    initSmoothScroll();

    // Login Form logic si existe en la página
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('login-btn-submit');
            const errorDiv = document.getElementById('login-error');
            const username = loginForm.username.value;
            const password = loginForm.password.value;

            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
            errorDiv.style.display = 'none';

            try {
                await API.login(username, password);
                // Redirect on success
                window.location.href = `${basePath}miembros/tablon/`;
            } catch (err) {
                console.error(err);
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
                errorDiv.style.display = 'block';
                if (err.data && err.data.detail) {
                    errorDiv.innerText = err.data.detail;
                } else {
                    errorDiv.innerText = "Error. Comprueba tu usuario y contraseña.";
                }
            }
        });
    }
});
