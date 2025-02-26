// public/js/app.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');

    if (loginForm) {
        // ... (código de login) ...
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const username = loginForm.username.value;
            const password = loginForm.password.value;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    window.location.href = 'dashboard.html';
                } else {
                    messageDiv.textContent = data.error;
                    messageDiv.classList.add('alert', 'alert-danger')
                }
            } catch (error) {
                messageDiv.textContent = 'Error al iniciar sesión';
                messageDiv.classList.add('alert', 'alert-danger')
            }
        });
    }

    // Código para el dashboard
    const token = localStorage.getItem('token');
    const mainContent = document.getElementById('mainContent');

    if (!token && window.location.pathname.includes('dashboard.html')) {
        window.location.href = 'index.html';
    }

    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        });
    }
    // Función para cargar contenido
    const cargarContenido = (url, callback) => {
        fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar el contenido');
                }
                return response.text();
            })
            .then(html => {
                mainContent.innerHTML = html;
                if (callback) {
                    callback();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                mainContent.innerHTML = '<p>Error al cargar el contenido.</p>';
            });
    };

    // Cargar contenido de rubros por defecto
    if (window.location.pathname.includes('dashboard.html')) {
        cargarContenido('/rubros.html', () => {
            cargarRubros();
        });
    }

    // Cargar contenido al hacer clic en los enlaces de la barra de navegación
    const rubrosLink = document.getElementById('rubrosLink');
    const conceptosLink = document.getElementById('conceptosLink');
    const gastosLink = document.getElementById('gastosLink');

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

    // Funciones para cargar y agregar datos
    const cargarRubros = async () => {
        const listaRubrosDiv = document.getElementById('listaRubros');
        const nombreRubroInput = document.getElementById('nombreRubro');
        const agregarRubroButton = document.getElementById('agregarRubro');

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
                listaRubrosDiv.innerHTML += `<p>${rubro.nombre}</p>`;
            });

            // Agregar rubro
            agregarRubroButton.addEventListener('click', async () => {
                const nombreRubro = nombreRubroInput.value;

                const response = await fetch('/api/rubros', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ nombre: nombreRubro })
                });

                if (response.ok) {
                    nombreRubroInput.value = '';
                    cargarRubros();
                } else {
                    const data = await response.json();
                    alert(data.error);
                }
            });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const cargarConceptos = async () => {
        const listaConceptosDiv = document.getElementById('listaConceptos');
        const nombreConceptoInput = document.getElementById('nombreConcepto');
        const agregarConceptoButton = document.getElementById('agregarConcepto');

        try {
            // Cargar conceptos
            const responseConceptos = await fetch('/api/conceptos', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const conceptos = await responseConceptos.json();

            listaConceptosDiv.innerHTML = '';
            conceptos.forEach(concepto => {
                listaConceptosDiv.innerHTML += `<p>${concepto.nombre}</p>`;
            });

            // Agregar concepto
            agregarConceptoButton.addEventListener('click', async () => {
                const nombreConcepto = nombreConceptoInput.value;

                const response = await fetch('/api/conceptos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ nombre: nombreConcepto })
                });

                if (response.ok) {
                    nombreConceptoInput.value = '';
                    cargarConceptos();
                } else {
                    const data = await response.json();
                    alert(data.error);
                }
            });
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const cargarGastos = async () => {
        const listaGastosDiv = document.getElementById('listaGastos');
        const fechaGastoInput = document.getElementById('fechaGasto');
        const montoGastoInput = document.getElementById('montoGasto');
        const conceptoGastoSelect = document.getElementById('conceptoGasto');
        const rubroGastoSelect = document.getElementById('rubroGasto');
        const agregarGastoForm = document.getElementById('agregarGastoForm');

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
                listaGastosDiv.innerHTML += `<p>Fecha: ${gasto.fecha}, Monto: ${gasto.monto}, Concepto: ${gasto.concepto_id}, Rubro: ${gasto.rubro_id}</p>`;
            });

            // Cargar conceptos en el select
            const responseConceptos = await fetch('/api/conceptos', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const conceptos = await responseConceptos.json();

            conceptoGastoSelect.innerHTML = '';
            conceptos.forEach(concepto => {
                conceptoGastoSelect.innerHTML += `<option value="${concepto.id}">${concepto.nombre}</option>`;
            });

            // Cargar rubros en el select
            const responseRubros = await fetch('/api/rubros', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const rubros = await responseRubros.json();

            rubroGastoSelect.innerHTML = '';
            rubros.forEach(rubro => {
                rubroGastoSelect.innerHTML += `<option value="${rubro.id}">${rubro.nombre}</option>`;
            });

            // Agregar gasto
            agregarGastoForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const fechaGasto = fechaGastoInput.value;
                const montoGasto = montoGastoInput.value;
                const conceptoGasto = conceptoGastoSelect.value;
                const rubroGasto = rubroGastoSelect.value;

                const response = await fetch('/api/gastos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ fecha: fechaGasto, monto: montoGasto, concepto_id: conceptoGasto, rubro_id: rubroGasto })
                });

                if (response.ok) {
                    fechaGastoInput.value = '';
                    montoGastoInput.value = '';
                    cargarGastos();
                } else {
                    const data = await response.json();
                    alert(data.error);
                }
            });

        } catch (error) {
            console.error('Error:', error);
        }
    };
});
