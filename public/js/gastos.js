// public/js/gastos.js
import { getToken } from './utils.js';

export const cargarGastos = async () => {
    console.log("cargarGastos function is executing!");
    const token = getToken();
    //All the code is now inside the callback.
    const loadGastos = async () => {
        console.log("loadGastos function is executing!");
        const conceptoGastoSelect = document.getElementById('conceptoGasto');
        //nuevas variables
        const fechaVencimientoGastoInput = document.getElementById('fechaVencimientoGasto');
        const fechaVencimientoDiv = document.getElementById('fechaVencimientoDiv');
        const tipoConceptoTexto = document.getElementById('tipoConceptoTexto');
        const agregarGastoForm = document.getElementById('agregarGastoForm');
        //Editar Gasto
        const editarGastoForm = document.getElementById('editarGastoForm');
        const editarConceptoGastoSelect = document.getElementById('editarConceptoGasto');
        const editarFechaVencimientoGastoInput = document.getElementById('editarFechaVencimientoGasto');
        const editarFechaVencimientoDiv = document.getElementById('editarFechaVencimientoDiv');
        const editarTipoConceptoTexto = document.getElementById('editarTipoConceptoTexto');
        const editarMontoGastoInput = document.getElementById('editarMontoGasto');
        const editarMesGastoInput = document.getElementById('editarMesGasto');
        const editarAnioGastoInput = document.getElementById('editarAnioGasto');
        const editarGastoIdInput = document.getElementById('editarGastoId');
        //Verificar que no haya ningun elemento null
        if (!conceptoGastoSelect || !agregarGastoForm) {
            console.error("Error: element not found");
            return;
        }
        try {

            // Cargar conceptos en el select
            const responseConceptos = await fetch('/api/conceptos', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!responseConceptos.ok) {
                console.error(`Error al cargar conceptos: ${responseConceptos.status}`);
                return;
            }
            const conceptos = await responseConceptos.json();

            conceptoGastoSelect.innerHTML = '<option value="">Seleccione un concepto</option>'; // Vaciar y agregar opcion por defecto
            editarConceptoGastoSelect.innerHTML = '<option value="">Seleccione un concepto</option>'; // Vaciar y agregar opcion por defecto
            conceptos.forEach(concepto => {
                conceptoGastoSelect.innerHTML += `<option value="${concepto.id}">${concepto.nombre}</option>`;
                editarConceptoGastoSelect.innerHTML += `<option value="${concepto.id}">${concepto.nombre}</option>`;
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
            //Al seleccionar el concepto en el formulario de editar, se verifica si debe mostrar el input de fecha de vencimiento
            editarConceptoGastoSelect.addEventListener('change', () => {
                // Convertir el valor a numero
                const selectedConcepto = conceptos.find(concepto => concepto.id === Number(editarConceptoGastoSelect.value));
                // Mostrar el tipo de concepto(ingreso/egreso)
                editarTipoConceptoTexto.textContent = `Tipo: ${selectedConcepto.tipo}`;
                if (selectedConcepto && selectedConcepto.requiere_vencimiento) {
                    editarFechaVencimientoDiv.style.display = 'block'; // Mostrar el div de fecha de vencimiento
                    editarFechaVencimientoGastoInput.required = true;
                } else {
                    editarFechaVencimientoDiv.style.display = 'none';// Ocultar el div de fecha de vencimiento
                    editarFechaVencimientoGastoInput.required = false;
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
                //Se incluye el valor de pagado con false
                body: JSON.stringify({ monto: montoGasto, concepto_id: conceptoGasto, mes: mesGasto, anio: anioGasto, fecha_vencimiento: fechaVencimientoGasto, pagado: false })
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

        //editar gasto
        editarGastoForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const token = getToken();
            const editarMontoGasto = editarMontoGastoInput.value;
            const editarConceptoGasto = editarConceptoGastoSelect.value;
            const editarMesGasto = editarMesGastoInput.value;
            const editarAnioGasto = editarAnioGastoInput.value;
            const editarFechaVencimientoGasto = editarFechaVencimientoGastoInput.value;
            const editarGastoId = editarGastoIdInput.value;

            const response = await fetch(`/api/gastos/${editarGastoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ monto: editarMontoGasto, concepto_id: editarConceptoGasto, mes: editarMesGasto, anio: editarAnioGasto, fecha_vencimiento: editarFechaVencimientoGasto })
            });
            if (response.ok) {
                // Limpiar y ocultar el formulario
                editarGastoForm.reset();
                editarGastoForm.style.display = 'none';
                agregarGastoForm.style.display = 'block';
                // Obtener el elemento que contiene el HTML y recargar los datos.
                const listadoGastosLink = document.getElementById('listadoGastosLink');
                listadoGastosLink.click();
                //Clear localStorage
                localStorage.removeItem("gastoId");
            } else {
                const data = await response.json();
                alert(data.error);
            }
        });
        //Al hacer click en el boton cancelar, se oculta el formulario.
        document.getElementById('cancelarEditarGasto').addEventListener('click', () => {
            editarGastoForm.style.display = 'none';
            agregarGastoForm.style.display = 'block';
        });
        // Get the gastoId from localStorage
        const gastoId = localStorage.getItem("gastoId");
        if (gastoId) {
            try {
                const response = await fetch(`/api/gastos/${gastoId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error al cargar el gasto: ${response.status}`);
                }

                const gasto = await response.json();
                editarGastoForm.style.display = 'block';
                agregarGastoForm.style.display = 'none';
                // Cargar los datos del gasto en el formulario de edición
                editarMontoGastoInput.value = gasto.monto;
                editarConceptoGastoSelect.value = gasto.concepto_id;
                editarMesGastoInput.value = gasto.mes;
                editarAnioGastoInput.value = gasto.anio;
                editarFechaVencimientoGastoInput.value = gasto.fecha_vencimiento ? gasto.fecha_vencimiento.slice(0, 10) : '';
                editarGastoIdInput.value = gasto.id;
                //Clear localStorage
                localStorage.removeItem("gastoId");
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };
    loadGastos();
};
