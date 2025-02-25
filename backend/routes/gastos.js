const express = require("express");
const db = require("../models/db"); // Ahora sin pool.promise()
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
router.get("/", authenticate, (req, res) => {
    db.query("SELECT * FROM gastos WHERE usuario_id = ?", [req.userId], (err, results) => {
        if (err) return res.status(500).json({ error: "Error obteniendo gastos" });
        res.json(results);
    });
});

// Agregar gasto
router.post("/", authenticate, (req, res) => {
    const { rubro_id, concepto_id, monto } = req.body;

    if (!rubro_id || !concepto_id || !monto) {
        return res.status(400).json({ error: "Faltan campos necesarios" });
    }

    db.query(
        "INSERT INTO gastos (usuario_id, rubro_id, concepto_id, monto) VALUES (?, ?, ?, ?)",
        [req.userId, rubro_id, concepto_id, monto],
        (err, result) => {
            if (err) return res.status(500).json({ error: "Error al agregar gasto" });
            res.status(201).json({ id: result.insertId, rubro_id, concepto_id, monto });
        }
    );
});

// Eliminar gasto
router.delete("/:id", authenticate, (req, res) => {
    db.query("DELETE FROM gastos WHERE id = ? AND usuario_id = ?", [req.params.id, req.userId], (err) => {
        if (err) return res.status(500).json({ error: "Error al eliminar gasto" });
        res.json({ message: "Gasto eliminado" });
    });
});

module.exports = router;

