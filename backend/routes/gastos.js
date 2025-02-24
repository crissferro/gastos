const express = require("express");
const db = require("../models/db");
const jwt = require("jsonwebtoken");

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
    const { concepto, monto } = req.body;
    db.query("INSERT INTO gastos (usuario_id, concepto, monto) VALUES (?, ?, ?)", 
        [req.userId, concepto, monto], 
        (err, result) => {
            if (err) return res.status(500).json({ error: "Error al agregar gasto" });
            res.json({ id: result.insertId, concepto, monto });
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
