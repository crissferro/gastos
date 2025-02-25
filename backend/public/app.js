const API_URL = "http://localhost:3000"; // URL del backend

async function login(event) {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);
            //mostrarDashboard();
            // Redirigir al dashboard
            window.location.href = "dashboard.html";
        } else {
            document.getElementById("login-error").innerText = data.error;
        }
    } catch (error) {
        console.error("Error en login:", error);
        alert("Error en el login");
    }
}

function logout() {
    localStorage.removeItem("token");
    location.reload();
}

function mostrarDashboard() {
    document.getElementById("login-container").style.display = "none";
    document.getElementById("dashboard").style.display = "block";

    cargarRubros();
    obtenerGastos();
}

async function agregarGasto() {
    const rubroId = document.getElementById("rubro").value;
    const conceptoId = document.getElementById("concepto").value;
    const monto = document.getElementById("monto").value;

    if (!rubroId || !conceptoId || !monto) {
        alert("Por favor, complete todos los campos.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/gastos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ rubro_id: rubroId, concepto_id: conceptoId, monto: monto })
        });

        if (response.ok) {
            obtenerGastos();
        } else {
            const errorData = await response.json();
            console.error("Error al agregar el gasto:", errorData);
            alert("Hubo un error al agregar el gasto.");
        }
    } catch (error) {
        console.error("Error en agregar gasto:", error);
    }
}

async function obtenerGastos() {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("No hay token almacenado.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/gastos`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            console.error("Error al obtener los gastos:", await response.json());
            return;
        }

        const gastos = await response.json();
        const lista = document.getElementById("lista-gastos");
        lista.innerHTML = gastos.map(g => `<tr><td>${g.concepto}</td><td>$${g.monto}</td><td>
            <button onclick="eliminarGasto(${g.id})" class="btn btn-danger">Eliminar</button>
        </td></tr>`).join("");
    } catch (error) {
        console.error("Error en obtener gastos:", error);
    }
}

async function eliminarGasto(id) {
    const token = localStorage.getItem("token");

    if (!confirm("¿Seguro que deseas eliminar este gasto?")) return;

    try {
        const response = await fetch(`${API_URL}/gastos/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            obtenerGastos();
        } else {
            console.error("Error al eliminar el gasto.");
        }
    } catch (error) {
        console.error("Error en eliminar gasto:", error);
    }
}

async function cargarRubros() {
    try {
        const response = await fetch(`${API_URL}/rubros`);
        const rubros = await response.json();
        const rubroSelect = document.getElementById("rubro");

        rubroSelect.innerHTML = '<option value="">Seleccione un rubro</option>';
        rubros.forEach(rubro => {
            const option = document.createElement("option");
            option.value = rubro.id;
            option.textContent = rubro.nombre;
            rubroSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error en cargar rubros:", error);
    }
}

async function cargarConceptos(rubroId) {
    try {
        const response = await fetch(`${API_URL}/conceptos/${rubroId}`);
        const conceptos = await response.json();
        const conceptoSelect = document.getElementById("concepto");

        conceptoSelect.innerHTML = '<option value="">Seleccione un concepto</option>';
        conceptos.forEach(concepto => {
            const option = document.createElement("option");
            option.value = concepto.id;
            option.textContent = concepto.nombre;
            conceptoSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error en cargar conceptos:", error);
    }
}

document.getElementById("rubro").addEventListener("change", (e) => {
    cargarConceptos(e.target.value);
});

window.onload = () => {
    if (localStorage.getItem("token")) {
        mostrarDashboard();
    }
};
