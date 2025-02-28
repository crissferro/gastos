// public/js/listado-gastos.js
import { getToken } from './utils.js';

export const cargarListadoGastos = async () => {
    const token = getToken();
    const listaGastosDiv = document.getElementById('listaGastos');

    try {
        // Cargar gastos
        const responseGastos = await fetch('/api/gastos', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const gastos = await responseGastos.json();

        listaGastosDiv.innerHTML = '';
        gastos.forEach(gasto => {
            listaGastosDiv.innerHTML += `<p>Fecha: ${gasto.fecha}, Monto: ${gasto.monto}, Concepto: ${gasto.concepto_nombre}</p>`;
        });
    } catch (error) {
        console.error('Error:', error);
    }
};
