// backend/routes/conceptos.js
const express = require('express');
const db = require('../models/db');
const authenticate = require('../authMiddleware');

const router = express.Router();

// Ruta para agregar un concepto
router.post('/', authenticate, async (req, res) => {
    try {
        const { nombre } = req.body;
        await db.conn.query('INSERT INTO conceptos (nombre) VALUES (?)', [nombre]);
        res.status(201).json({ message: 'Concepto agregado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al agregar el concepto' });
    }
});

// Ruta para obtener todos los conceptos
router.get('/', authenticate, async (req, res) => {
    try {
        const [rows] = await db.conn.query('SELECT * FROM conceptos');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los conceptos' });
    }
});

module.exports = router;
