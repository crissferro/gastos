const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const connection = require("./models/db");

const app = express();
const PORT = 3000;
const SECRET_KEY = "tu_clave_secreta"; // Puedes cambiar esto

app.use(cors());
app.use(bodyParser.json());

// RUTA BASE
app.get("/", (req, res) => {
    res.send("Servidor funcionando correctamente");
});

// RUTA LOGIN
app.post("/auth/login", (req, res) => {
    const { username, password } = req.body;

    connection.query(
        "SELECT * FROM usuarios WHERE username = ?",
        [username],
        (err, results) => {
            if (err) return res.status(500).json({ error: "Error en el servidor" });

            if (results.length === 0 || results[0].password !== password) {
                return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
            }

            // Generar token JWT
            const token = jwt.sign({ id: results[0].id, username }, SECRET_KEY, { expiresIn: "1h" });
            res.json({ token });
        }
    );
});

// MIDDLEWARE PARA VERIFICAR TOKEN
function verificarToken(req, res, next) {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) return res.status(403).json({ error: "Token requerido" });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Token inválido" });

        req.user = decoded;
        next();
    });
}

// RUTA PARA LISTAR GASTOS (PROTEGIDA)
app.get("/gastos", verificarToken, (req, res) => {
    connection.query("SELECT * FROM gastos WHERE usuario_id = ?", [req.user.id], (err, results) => {
        if (err) return res.status(500).json({ error: "Error en la base de datos" });

        res.json(results);
    });
});

// RUTA PARA AGREGAR GASTO (PROTEGIDA)
app.post("/gastos", verificarToken, (req, res) => {
    const { concepto, monto } = req.body;

    connection.query(
        "INSERT INTO gastos (usuario_id, concepto, monto) VALUES (?, ?, ?)",
        [req.user.id, concepto, monto],
        (err, results) => {
            if (err) return res.status(500).json({ error: "Error al agregar el gasto" });

            res.json({ message: "Gasto agregado correctamente" });
        }
    );
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
