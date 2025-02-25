const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Usar las rutas definidas en la carpeta routes
const authRoutes = require("./routes/auth");
const gastosRoutes = require("./routes/gastos");
const rubrosRoutes = require("./routes/rubros");
const conceptosRoutes = require("./routes/conceptos");

app.use("/auth", authRoutes);
app.use("/gastos", gastosRoutes);
app.use("/rubros", rubrosRoutes);
app.use("/conceptos", conceptosRoutes);

const path = require("path");

// Servir archivos estáticos de la carpeta "public"
app.use(express.static(path.join(__dirname, "public")));

// Si no se encuentra una ruta en las APIs, servir index.html
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Ruta base de prueba
app.get("/", (req, res) => {
    res.send("Servidor funcionando correctamente");
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
