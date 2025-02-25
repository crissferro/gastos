const express = require("express");
const router = express.Router();
const db = require("../models/db");

// Agregar un concepto
router.post("/", (req, res) => {
    const { rubro_id, nombre } = req.body;
    db.query("INSERT INTO conceptos (rubro_id, nombre) VALUES (?, ?)", [rubro_id, nombre], (err, result) => {
        if (err) return res.status(500).json({ error: "Error al agregar concepto" });
        res.status(201).json({ id: result.insertId, rubro_id, nombre });
    });
});

// Listar conceptos por rubro
router.get("/:rubroId", (req, res) => {
    const { rubroId } = req.params;
    db.query("SELECT * FROM conceptos WHERE rubro_id = ?", [rubroId], (err, rows) => {
        if (err) return res.status(500).json({ error: "Error al obtener conceptos" });
        res.json(rows);
    });
});

module.exports = router;
