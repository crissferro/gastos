// public/js/app.js
import { handleLogin, handleLogout } from './auth.js';
import { cargarRubros } from './rubros.js';
import { cargarConceptos } from './conceptos.js';
import { cargarGastos } from './gastos.js';
import { cargarContenido, checkTokenAndRedirect, getToken } from './utils.js';
import { cargarListadoGastos } from './listado-gastos.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- Lógica de Autenticación ---
    handleLogin();
    handleLogout();

    // --- Lógica del Dashboard ---
    checkTokenAndRedirect();

    const mainContent = document.getElementById('mainContent');

    // Cargar contenido de rubros por defecto
    if (window.location.pathname.includes('/rubros.html')) {
        cargarContenido('/rubros.html', () => {
            cargarRubros();
        });
    }

    // Cargar contenido al hacer clic en los enlaces de la barra de navegación
    const rubrosLink = document.getElementById('rubrosLink');
    const conceptosLink = document.getElementById('conceptosLink');
    const gastosLink = document.getElementById('gastosLink');
    const listadoGastosLink = document.getElementById('listadoGastosLink');

    if (rubrosLink) {
        rubrosLink.addEventListener('click', (event) => {
            event.preventDefault();
            cargarContenido('/rubros.html', () => {
                cargarRubros();
            });
        });
    }
    if (conceptosLink) {
        conceptosLink.addEventListener('click', (event) => {
            event.preventDefault();
            cargarContenido('/conceptos.html', () => {
                cargarConceptos();
            });
        });
    }
    if (gastosLink) {
        gastosLink.addEventListener('click', (event) => {
            event.preventDefault();
            cargarContenido('/gastos.html', () => {
                cargarGastos();
            });
        });
    }
    if (listadoGastosLink) {
        listadoGastosLink.addEventListener('click', (event) => {
            event.preventDefault();
            cargarContenido('/listado-gastos.html', () => {
                cargarListadoGastos();
            });
        });
    }
});
