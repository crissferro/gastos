// backend/routes/rubros.js
const express = require('express');
const db = require('../models/db');
const authenticate = require('../authMiddleware');

const router = express.Router();

// Ruta para agregar un rubro
router.post('/', authenticate, async (req, res) => {
    try {
        const { nombre } = req.body;
        await db.conn.query('INSERT INTO rubros (nombre) VALUES (?)', [nombre]);
        res.status(201).json({ message: 'Rubro agregado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al agregar el rubro' });
    }
});

// Ruta para obtener todos los rubros
router.get('/', authenticate, async (req, res) => {
    try {
        const [rows] = await db.conn.query('SELECT * FROM rubros');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los rubros' });
    }
});

module.exports = router;
