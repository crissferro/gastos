const API_URL = "http://localhost:3000"; // URL del backend

async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
        localStorage.setItem("token", data.token);
        mostrarDashboard();
        obtenerGastos();
    } else {
        document.getElementById("login-error").innerText = data.error;
    }
}

// Cerrar sesión (ahora elimina la key "token")
function logout() {
    localStorage.removeItem("token");
    location.reload();
}

// Mostrar u ocultar secciones según autenticación
function mostrarDashboard() {
    document.getElementById("login-container").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
}

// Agregar gastos
async function agregarGasto() {
    const rubroId = document.getElementById("rubro").value;
    const conceptoId = document.getElementById("concepto").value;
    const monto = document.getElementById("monto").value;

    // Verificar que los campos no estén vacíos
    if (!rubroId || !conceptoId || !monto) {
        alert("Por favor, complete todos los campos.");
        return;
    }

    // Enviar la solicitud al backend
    const response = await fetch(`${API_URL}/gastos`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ rubro_id: rubroId, concepto_id: conceptoId, monto: monto })
    });

    // Verificar si la solicitud fue exitosa
    if (response.ok) {
        // Actualizar la lista de gastos
        obtenerGastos();
    } else {
        const errorData = await response.json();
        console.error("Error al agregar el gasto:", errorData);
        alert("Hubo un error al agregar el gasto.");
    }
}

// Obtener gastos
async function obtenerGastos() {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("No hay token almacenado.");
        return;
    }

    const response = await fetch(`${API_URL}/gastos`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) {
        console.error("Error al obtener los gastos:", await response.json());
    } else {
        const gastos = await response.json();
        const lista = document.getElementById("lista-gastos");
        lista.innerHTML = gastos.map(g => `<tr><td>${g.concepto}</td><td>$${g.monto}</td></tr>`).join("");
    }
}


// Usar una única asignación a window.onload
window.onload = () => {
    if (localStorage.getItem("token")) {
        mostrarDashboard();
        obtenerGastos();
    }
};

// Eliminar gasto de la tabla (este código es local; en el futuro se conectará con el backend)
function eliminarGasto(boton) {
    boton.parentElement.parentElement.remove();
}
// Cargar rubros
async function cargarRubros() {
    const response = await fetch(`${API_URL}/rubros`);
    const rubros = await response.json();
    const rubroSelect = document.getElementById("rubro");
    rubros.forEach(rubro => {
        const option = document.createElement("option");
        option.value = rubro.id;
        option.textContent = rubro.nombre;
        rubroSelect.appendChild(option);
    });
}

// Cargar conceptos según el rubro seleccionado
async function cargarConceptos(rubroId) {
    const response = await fetch(`${API_URL}/conceptos/${rubroId}`);
    const conceptos = await response.json();
    const conceptoSelect = document.getElementById("concepto");
    conceptoSelect.innerHTML = ''; // Limpiar antes de cargar
    conceptos.forEach(concepto => {
        const option = document.createElement("option");
        option.value = concepto.id;
        option.textContent = concepto.nombre;
        conceptoSelect.appendChild(option);
    });
}

// Agregar evento para cargar los conceptos cuando se seleccione un rubro
document.getElementById("rubro").addEventListener("change", (e) => {
    cargarConceptos(e.target.value);
});

// Llamar cargarRubros cuando la página se cargue
window.onload = () => {
    cargarRubros();
    // ... el resto de tus funciones
};
