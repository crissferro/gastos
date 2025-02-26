// backend/routes/gastos.js
const express = require('express');
const db = require('../models/db');
const authenticate = require('../authMiddleware');

const router = express.Router();

// Ruta para agregar un gasto
router.post('/', authenticate, async (req, res) => {
    try {
        const { fecha, monto, concepto_id, rubro_id } = req.body;
        await db.conn.query('INSERT INTO gastos (fecha, monto, concepto_id, rubro_id) VALUES (?, ?, ?, ?)', [fecha, monto, concepto_id, rubro_id]);
        res.status(201).json({ message: 'Gasto agregado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al agregar el gasto' });
    }
});

// Ruta para obtener todos los gastos
router.get('/', authenticate, async (req, res) => {
    try {
        const [rows] = await db.conn.query('SELECT * FROM gastos');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los gastos' });
    }
});

module.exports = router;
