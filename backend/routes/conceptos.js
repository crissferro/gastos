const express = require("express");
const router = express.Router();
const pool = require("../models/db");

// Agregar un concepto
router.post("/", async (req, res) => {
    const { rubro_id, nombre } = req.body;
    try {
        const [result] = await pool.query("INSERT INTO conceptos (rubro_id, nombre) VALUES (?, ?)", [rubro_id, nombre]);
        res.status(201).json({ id: result.insertId, rubro_id, nombre });
    } catch (err) {
        res.status(500).json({ error: "Error al agregar concepto" });
    }
});

// Listar conceptos por rubro
router.get("/:rubroId", async (req, res) => {
    const { rubroId } = req.params;
    try {
        const [rows] = await pool.query("SELECT * FROM conceptos WHERE rubro_id = ?", [rubroId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener conceptos" });
    }
});

module.exports = router;
