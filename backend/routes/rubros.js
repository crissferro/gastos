const express = require("express");
const router = express.Router();
const db = require("../models/db"); // Asumimos que tienes configurado un pool de conexión

// Agregar un rubro
router.post("/", async (req, res) => {
    const { nombre } = req.body;
    db.query("INSERT INTO rubros (nombre) VALUES (?)", [nombre], (err, result) => {
        if (err) return res.status(500).json({ error: "Error al agregar rubro" });
        res.status(201).json({ id: result.insertId, nombre });
    });
});

// Listar rubros
router.get("/", (req, res) => {
    db.query("SELECT * FROM rubros", (err, rows) => {
        if (err) return res.status(500).json({ error: "Error al obtener rubros" });
        res.json(rows);
    });
});

module.exports = router;
