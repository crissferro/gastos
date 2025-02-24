const API_URL = "http://localhost:3000"; // URL del backend

// Simulación de login (luego lo conectaremos con el backend)
/*
function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    
    if (username === "admin" && password === "1234") {
        localStorage.setItem("usuario", username);
        mostrarDashboard();
    } else {
        document.getElementById("login-error").innerText = "Usuario o contraseña incorrectos.";
    }
}
    */

async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    
    if (response.ok) {
        localStorage.setItem("token", data.token);
        mostrarDashboard();
    } else {
        document.getElementById("login-error").innerText = data.error;
    }
}

// Cerrar sesión
function logout() {
    localStorage.removeItem("usuario");
    location.reload();
}

// Mostrar u ocultar secciones según autenticación
function mostrarDashboard() {
    document.getElementById("login-container").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
}

// Verificar si el usuario ya está autenticado
window.onload = () => {
    if (localStorage.getItem("usuario")) {
        mostrarDashboard();
    }
};

// Agregar gastos (por ahora localmente, luego con backend)
async function agregarGasto() {
    const concepto = document.getElementById("concepto").value;
    const monto = document.getElementById("monto").value;

    const response = await fetch("http://localhost:3000/gastos", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ concepto, monto })
    });

    if (response.ok) {
        obtenerGastos();
    }
}

//obtener gastos

async function obtenerGastos() {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("No hay token almacenado.");
        return;
    }

    const response = await fetch("http://localhost:3000/gastos", {
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


window.onload = () => {
    if (localStorage.getItem("token")) {
        mostrarDashboard();
        obtenerGastos();
    }
};


// Eliminar gasto de la tabla
function eliminarGasto(boton) {
    boton.parentElement.parentElement.remove();
}
