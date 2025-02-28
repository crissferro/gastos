// public/js/gastos.js
import { getToken } from './utils.js';

export const cargarGastos = async () => {
    const token = getToken();
    const conceptoGastoSelect = document.getElementById('conceptoGasto');
    //nuevas variables
    const fechaVencimientoGastoInput = document.getElementById('fechaVencimientoGasto');
    const fechaVencimientoDiv = document.getElementById('fechaVencimientoDiv');
    const tipoConceptoTexto = document.getElementById('tipoConceptoTexto');
    const agregarGastoForm = document.getElementById('agregarGastoForm');
    if (agregarGastoForm) {
        try {

            // Cargar conceptos en el select
            const responseConceptos = await fetch('/api/conceptos', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const conceptos = await responseConceptos.json();

            conceptoGastoSelect.innerHTML = '<option value="">Seleccione un concepto</option>'; // Vaciar y agregar opcion por defecto
            conceptos.forEach(concepto => {
                conceptoGastoSelect.innerHTML += `<option value="${concepto.id}">${concepto.nombre}</option>`;
            });
            //Al seleccionar el concepto, se verifica si debe mostrar el input de fecha de vencimiento
            conceptoGastoSelect.addEventListener('change', () => {
                // Convertir el valor a numero
                const selectedConcepto = conceptos.find(concepto => concepto.id === Number(conceptoGastoSelect.value));
                // Mostrar el tipo de concepto(ingreso/egreso)
                tipoConceptoTexto.textContent = `Tipo: ${selectedConcepto.tipo}`;
                if (selectedConcepto && selectedConcepto.requiere_vencimiento) {
                    fechaVencimientoDiv.style.display = 'block'; // Mostrar el div de fecha de vencimiento
                    fechaVencimientoGastoInput.required = true;
                } else {
                    fechaVencimientoDiv.style.display = 'none';// Ocultar el div de fecha de vencimiento
                    fechaVencimientoGastoInput.required = false;
                }
            });

        } catch (error) {
            console.error('Error:', error);
        }
        const montoGastoInput = document.getElementById('montoGasto');
        const mesGastoInput = document.getElementById('mesGasto');
        const anioGastoInput = document.getElementById('anioGasto');
        agregarGastoForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const token = getToken();
            const montoGasto = montoGastoInput.value;
            const conceptoGasto = conceptoGastoSelect.value;
            const mesGasto = mesGastoInput.value;
            const anioGasto = anioGastoInput.value;
            const fechaVencimientoGasto = fechaVencimientoGastoInput.value;

            const response = await fetch('/api/gastos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ monto: montoGasto, concepto_id: conceptoGasto, mes: mesGasto, anio: anioGasto, fecha_vencimiento: fechaVencimientoGasto })
            });
            //Limpiar todos los inputs
            montoGastoInput.value = '';
            fechaVencimientoGastoInput.value = '';
            mesGastoInput.value = '';
            anioGastoInput.value = '';
            //Para que se deseleccione el concepto.
            conceptoGastoSelect.value = '';

            if (response.ok) {

            } else {
                const data = await response.json();
                alert(data.error);
            }
        });
    }
};

//Agregar gasto (fuera de cargarGastos)
document.addEventListener('DOMContentLoaded', () => {
    //Verificar que se este en dashboard.html
    if (window.location.pathname.includes('dashboard.html')) {
        cargarGastos();
    }
});
