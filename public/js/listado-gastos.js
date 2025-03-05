// public/js/listado-gastos.js
import { getToken } from './utils.js';

export const cargarListadoGastos = async () => {
    const token = getToken();
    const listaGastosDiv = document.getElementById('listaGastos');
    const mesFiltro = document.getElementById('mesFiltro');
    const rubroFiltro = document.getElementById('rubroFiltro');
    const conceptoFiltro = document.getElementById('conceptoFiltro');
    const pagadoFiltro = document.getElementById('pagadoFiltro');
    const fechaVencimientoDesdeInput = document.getElementById('fechaVencimientoDesde');
    const fechaVencimientoHastaInput = document.getElementById('fechaVencimientoHasta');

    //Cargar datos y tambien la logica de los filtros
    const cargarDatos = async (mes = null, rubro = null, concepto = null, pagado = null, fechaVencimientoDesde = null, fechaVencimientoHasta = null) => {
        // Construir la URL con los parámetros
        let url = '/api/gastos?';
        const params = [];
        if (mes) params.push(`mes=${mes}`);
        if (rubro) params.push(`rubro=${rubro}`);
        if (concepto) params.push(`concepto=${concepto}`);
        if (pagado) params.push(`pagado=${pagado}`);
        if (fechaVencimientoDesde) params.push(`fechaVencimientoDesde=${fechaVencimientoDesde}`);
        if (fechaVencimientoHasta) params.push(`fechaVencimientoHasta=${fechaVencimientoHasta}`);

        if (params.length > 0) {
            url += params.join('&');
        }

        try {
            // Cargar gastos
            const responseGastos = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!responseGastos.ok) {
                //Si hay un error con la carga de gastos, se termina la ejecucion del metodo.
                throw new Error(`Error al cargar gastos: ${responseGastos.status}`);
            }
            const gastos = await responseGastos.json();

            listaGastosDiv.innerHTML = '';
            gastos.forEach(gasto => {
                // Formatear fecha de vencimiento
                let fechaVencimiento = '';
                if (gasto.fecha_vencimiento) {
                    fechaVencimiento = new Date(gasto.fecha_vencimiento).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                }
                // Formatear mes y anio
                const fechaMovimiento = `${gasto.mes.toString().padStart(2, '0')}-${gasto.anio}`;
                // Formatear columna pagado
                const pagadoTexto = gasto.pagado ? "Pagado" : "Pendiente";
                //Se modifica la linea, se reemplaza table-cremita por table-success
                listaGastosDiv.innerHTML += `
                    <tr class="${gasto.pagado ? 'table-success' : ''}">
                        <td>${fechaMovimiento}</td>
                        <td>${fechaVencimiento ? fechaVencimiento : '&nbsp;'}</td>
                        <td>${gasto.rubro_nombre}</td>
                        <td>${gasto.concepto_nombre}</td>
                        <td class="text-end">${gasto.monto}</td>
                        <td><input type="checkbox" data-id="${gasto.id}" class="pagadoCheck" ${gasto.pagado ? 'checked' : ''}></td>
                        <td><button data-id="${gasto.id}" class="btn btn-sm btn-primary editarGasto" ${gasto.pagado ? 'disabled' : ''}>Editar</button></td>
                    </tr>
                `;
            });
            // Agregar Event Listener a los Checkboxes
            const pagadoChecks = document.querySelectorAll('.pagadoCheck');
            pagadoChecks.forEach(checkbox => {
                checkbox.addEventListener('change', async (event) => {
                    const id = event.target.dataset.id;
                    const pagado = event.target.checked;
                    try {
                        const response = await fetch(`/api/gastos/${id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            //Only send the field 'pagado'
                            body: JSON.stringify({ pagado: pagado })
                        });

                        if (response.ok) {
                            cargarDatos();//Se llama al metodo para que se actualice la tabla.
                        } else {
                            //Manejar el error 404.
                            if (response.status === 404) {
                                console.error("Error: no se encontro el recurso");
                            } else {
                                const data = await response.json();
                                alert(data.error);
                            }
                        }
                    } catch (error) {
                        console.error('Error:', error);
                    }
                });
            });
            // Agregar Event Listener a los Botones editar
            const editarGastos = document.querySelectorAll('.editarGasto');
            editarGastos.forEach(editar => {
                editar.addEventListener('click', async (event) => {
                    const gastoId = event.target.dataset.id;
                    // Obtener el elemento que contiene el HTML y ejecutar el evento.
                    const gastosLink = document.getElementById('gastosLink');
                    // Set data in localstorage
                    localStorage.setItem("gastoId", gastoId);
                    gastosLink.click();

                });
            });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    try {
        // Cargar rubros en el select
        const responseRubros = await fetch('/api/rubros', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!responseRubros.ok) {
            throw new Error(`Error al cargar rubros: ${responseRubros.status}`);
        }
        const rubros = await responseRubros.json();
        // Cargar conceptos en el select
        const responseConceptos = await fetch('/api/conceptos', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!responseConceptos.ok) {
            throw new Error(`Error al cargar conceptos: ${responseConceptos.status}`);
        }
        const conceptos = await responseConceptos.json();

        rubroFiltro.innerHTML = '<option value="">Todos los Rubros</option>';
        conceptoFiltro.innerHTML = '<option value="">Todos los Conceptos</option>';
        if (Array.isArray(conceptos)) {
            conceptos.forEach(concepto => {
                conceptoFiltro.innerHTML += `<option value="${concepto.id}">${concepto.nombre}</option>`;
            });
        } else {
            console.error("conceptos no es un array:", conceptos)
        }
        if (Array.isArray(rubros)) {
            rubros.forEach(rubro => {
                rubroFiltro.innerHTML += `<option value="${rubro.id}">${rubro.nombre}</option>`;
            });
        } else {
            console.error("rubros no es un array:", rubros)
        }

        // Función para manejar el evento de cambio en los filtros
        const handleFilterChange = () => {
            const mesSeleccionado = mesFiltro.value;
            const rubroSeleccionado = rubroFiltro.value;
            const conceptoSeleccionado = conceptoFiltro.value;
            const pagadoSeleccionado = pagadoFiltro.value;
            const fechaVencimientoDesde = fechaVencimientoDesdeInput.value;
            const fechaVencimientoHasta = fechaVencimientoHastaInput.value;
            cargarDatos(mesSeleccionado, rubroSeleccionado, conceptoSeleccionado, pagadoSeleccionado, fechaVencimientoDesde, fechaVencimientoHasta);
        };
        // Aplicar el filtro
        mesFiltro.addEventListener('change', handleFilterChange);
        rubroFiltro.addEventListener('change', handleFilterChange);
        conceptoFiltro.addEventListener('change', handleFilterChange);
        pagadoFiltro.addEventListener('change', handleFilterChange);
        fechaVencimientoDesdeInput.addEventListener('change', handleFilterChange);
        fechaVencimientoHastaInput.addEventListener('change', handleFilterChange);
        // Cargar datos iniciales
        cargarDatos();
    } catch (error) {
        console.error('Error general:', error);
    }
};
