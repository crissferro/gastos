// public/js/rubros.js
import { getToken } from './utils.js';

export const cargarRubros = async () => {
    const token = getToken();
    const listaRubrosDiv = document.getElementById('listaRubros');
    const nombreRubroInput = document.getElementById('nombreRubro');
    const agregarRubroButton = document.getElementById('agregarRubro');
    //variables para el form de edicion
    const editarRubroForm = document.getElementById('editarRubroForm');
    const editarNombreRubroInput = document.getElementById('editarNombreRubro');
    const guardarRubroButton = document.getElementById('guardarRubro');
    const cancelarEditarRubroButton = document.getElementById('cancelarEditarRubro');
    let rubroAEditar = null;

    try {
        // Cargar rubros
        const responseRubros = await fetch('/api/rubros', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const rubros = await responseRubros.json();

        listaRubrosDiv.innerHTML = '';
        rubros.forEach(rubro => {
            const rubroElement = document.createElement('div');
            rubroElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <p id="rubro-${rubro.id}" class="mb-0">${rubro.nombre}</p>
                <div>
                    <button class="btn btn-sm btn-warning editarRubro" data-id="${rubro.id}">Editar</button>
                    <button class="btn btn-sm btn-danger eliminarRubro" data-id="${rubro.id}">Eliminar</button>
                </div>
             </div>
            `;
            listaRubrosDiv.appendChild(rubroElement);
        });

        // Agregar rubro
        if (agregarRubroButton) {
            agregarRubroButton.addEventListener('click', async () => {
                const nombreRubro = nombreRubroInput.value.trim();
                // Validar que el nombre no esté vacío
                if (nombreRubro === '') {
                    alert('El nombre del rubro no puede estar vacío');
                    return;
                }

                const response = await fetch('/api/rubros', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ nombre: nombreRubro })
                });

                //Limpiar el input.
                nombreRubroInput.value = '';
                if (response.ok) {
                    cargarRubros();
                } else {
                    const data = await response.json();
                    alert(`Error: ${data.error}`);
                }
            });
        }

        // Delegación de eventos para Editar y Eliminar rubros
        listaRubrosDiv.addEventListener('click', async (event) => {
            const target = event.target;
            const rubroId = target.dataset.id;

            if (target.classList.contains('editarRubro')) {
                // Obtener los datos del concepto seleccionado
                rubroAEditar = rubros.find(rubro => rubro.id == rubroId);
                // Mostrar el formulario y ocultar el parrafo
                editarRubroForm.style.display = 'block';
                document.getElementById(`rubro-${rubroId}`).style.display = 'none';
                // Completar el formulario con los datos del concepto
                editarNombreRubroInput.value = rubroAEditar.nombre;
                // Logica para guardar
                guardarRubroButton.addEventListener('click', async () => {
                    const nuevoNombre = editarNombreRubroInput.value;

                    try {
                        const response = await fetch(`/api/rubros/${rubroId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ nombre: nuevoNombre })
                        });

                        if (response.ok) {
                            // Ocultar el formulario
                            editarRubroForm.style.display = 'none';
                            // Mostrar el parrafo
                            document.getElementById(`rubro-${rubroId}`).style.display = 'block';
                            cargarRubros();
                        } else {
                            const data = await response.json();
                            alert(data.error);
                        }
                    } catch (error) {
                        console.error('Error:', error);
                    }
                });
                // Logica para cancelar
                cancelarEditarRubroButton.addEventListener('click', () => {
                    editarRubroForm.style.display = 'none';
                    document.getElementById(`rubro-${rubroId}`).style.display = 'block';
                });
            } else if (target.classList.contains('eliminarRubro')) {
                // Lógica para eliminar rubro
                try {
                    const response = await fetch(`/api/rubros/${rubroId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        cargarRubros();
                    } else {
                        const data = await response.json();
                        alert(data.error);
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            }
        });
    } catch (error) {
        console.error('Error:', error);
    }
};
