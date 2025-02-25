const express = require("express");
const router = express.Router();
const pool = require("../models/db"); // Asumimos que tienes configurado un pool de conexión

// Agregar un rubro
router.post("/", async (req, res) => {
    const { nombre } = req.body;
    try {
        const [result] = await pool.query("INSERT INTO rubros (nombre) VALUES (?)", [nombre]);
        res.status(201).json({ id: result.insertId, nombre });
    } catch (err) {
        res.status(500).json({ error: "Error al agregar rubro" });
    }
});

// Listar rubros
router.get("/", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM rubros");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener rubros" });
    }
});

module.exports = router;
