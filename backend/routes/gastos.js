// backend/routes/gastos.js
const express = require('express');
const db = require('../models/db');
const authenticate = require('../authMiddleware');

const router = express.Router();

// Ruta para agregar un gasto
router.post('/', authenticate, async (req, res) => {
    try {
        const { monto, concepto_id, mes, anio, fecha_vencimiento } = req.body;
        // Agrega console.log para verificar los datos
        console.log('Datos recibidos en /api/gastos:', { monto, concepto_id, mes, anio, fecha_vencimiento });

        //obtener la fecha sin la hora.
        const fecha = new Date().toISOString().slice(0, 10);

        //validaciones
        if (!monto || !concepto_id || !mes || !anio) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        await db.conn.query('INSERT INTO gastos (fecha, monto, concepto_id, mes, anio, fecha_vencimiento) VALUES (?, ?, ?, ?, ?, ?)', [fecha, monto, concepto_id, mes, anio, fecha_vencimiento]);
        res.status(201).json({ message: 'Gasto agregado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al agregar el gasto' });
    }
});

// Ruta para obtener todos los gastos
router.get('/', authenticate, async (req, res) => {
    try {
        const [rows] = await db.conn.query('SELECT g.fecha, g.monto, c.nombre AS concepto_nombre FROM gastos g LEFT JOIN conceptos c ON g.concepto_id = c.id');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los gastos' });
    }
});

module.exports = router;
