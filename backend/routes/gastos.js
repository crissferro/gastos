const express = require("express");
const pool = require("../models/db"); // Ahora estamos usando pool
const jwt = require("jsonwebtoken");
require("dotenv").config();

const router = express.Router();

// Middleware para verificar el token
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(403).json({ error: "Acceso denegado" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Token inválido" });
        req.userId = decoded.userId;
        next();
    });
};

// Obtener gastos del usuario
router.get("/", authenticate, async (req, res) => {
    try {
        const [results] = await pool.query("SELECT * FROM gastos WHERE usuario_id = ?", [req.userId]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Error obteniendo gastos" });
    }
});

// Agregar gasto
router.post("/", authenticate, async (req, res) => {
    const { rubro_id, concepto_id, monto } = req.body;

    // Verificar que los campos necesarios estén presentes
    if (!rubro_id || !concepto_id || !monto) {
        return res.status(400).json({ error: "Faltan campos necesarios" });
    }

    try {
        const [result] = await pool.query(
            "INSERT INTO gastos (usuario_id, rubro_id, concepto_id, monto) VALUES (?, ?, ?, ?)",
            [req.userId, rubro_id, concepto_id, monto]
        );
        res.status(201).json({ id: result.insertId, rubro_id, concepto_id, monto });
    } catch (err) {
        res.status(500).json({ error: "Error al agregar gasto" });
    }
});

// Eliminar gasto
router.delete("/:id", authenticate, async (req, res) => {
    try {
        await pool.query("DELETE FROM gastos WHERE id = ? AND usuario_id = ?", [req.params.id, req.userId]);
        res.json({ message: "Gasto eliminado" });
    } catch (err) {
        res.status(500).json({ error: "Error al eliminar gasto" });
    }
});

module.exports = router;
