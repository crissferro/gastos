// backend/routes/conceptos.js
const express = require('express');
const db = require('../models/db');
const authenticate = require('../authMiddleware');

const router = express.Router();

/**
 * @description Agrega un nuevo concepto a la base de datos.
 * @route POST /api/conceptos
 * @access Private
 * @param {string} nombre - Nombre del concepto a agregar.
 * @param {number} rubro_id - ID del rubro al que pertenece el concepto.
 * @param {enum} tipo - El tipo de concepto (ingreso/egreso).
 * @param {boolean} requiere_vencimiento - Si requiere o no fecha de vencimiento.
 * @returns {object} - Mensaje de éxito o error.
 */
router.post('/', authenticate, async (req, res) => {
    try {
        const { nombre, rubro_id, tipo, requiere_vencimiento } = req.body;

        //Validar que los datos esten completos.
        if (!nombre || !rubro_id || !tipo || requiere_vencimiento == undefined) {
            return res.status(400).json({ error: 'Debes completar nombre, rubro, tipo y requiere vencimiento' });
        }
        //Verificar si existe un concepto con ese nombre y rubro
        const [existingConcept] = await db.conn.query('SELECT * FROM conceptos WHERE nombre = ? AND rubro_id = ?', [nombre, rubro_id]);
        if (existingConcept.length > 0) {
            return res.status(400).json({ error: 'El concepto ya existe en ese rubro' });
        }

        await db.conn.query('INSERT INTO conceptos (nombre, rubro_id, tipo, requiere_vencimiento) VALUES (?, ?, ?, ?)', [nombre, rubro_id, tipo, requiere_vencimiento]);
        res.status(201).json({ message: 'Concepto agregado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al agregar el concepto' });
    }
});

/**
 * @description Obtiene todos los conceptos de la base de datos.
 * @route GET /api/conceptos
 * @access Private
 * @returns {array} - Lista de conceptos.
 */
router.get('/', authenticate, async (req, res) => {
    try {
        const [rows] = await db.conn.query('SELECT c.id, c.nombre, c.rubro_id, c.tipo, c.requiere_vencimiento , r.nombre AS rubro_nombre FROM conceptos c LEFT JOIN rubros r ON c.rubro_id = r.id');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los conceptos' });
    }
});

/**
 * @description Modifica un concepto existente en la base de datos.
 * @route PUT /api/conceptos/:id
 * @access Private
 * @param {number} id - ID del concepto a modificar.
 * @param {string} nombre - Nuevo nombre del concepto.
 * @param {number} rubro_id - Nuevo ID del rubro.
 * @param {enum} tipo - El tipo de concepto (ingreso/egreso).
 * @param {boolean} requiere_vencimiento - Si requiere o no fecha de vencimiento.
 * @returns {object} - Mensaje de éxito o error.
 */
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, rubro_id, tipo, requiere_vencimiento } = req.body;

        // Verificar si el concepto tiene gastos asociados
        const [gastos] = await db.conn.query('SELECT * FROM gastos WHERE concepto_id = ?', [id]);
        if (gastos.length > 0) {
            // Si tiene gastos asociados, respondemos con un error
            return res.status(400).json({ error: 'No se puede modificar el concepto porque tiene gastos asociados' });
        }

        await db.conn.query('UPDATE conceptos SET nombre = ?, rubro_id = ?, tipo = ?, requiere_vencimiento = ? WHERE id = ?', [nombre, rubro_id, tipo, requiere_vencimiento, id]);
        res.json({ message: 'Concepto actualizado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el concepto' });
    }
});

/**
 * @description Elimina un concepto de la base de datos, siempre y cuando no tenga gastos asociados.
 * @route DELETE /api/conceptos/:id
 * @access Private
 * @param {number} id - ID del concepto a eliminar.
 * @returns {object} - Mensaje de éxito o error.
 */
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const [gastos] = await db.conn.query('SELECT * FROM gastos WHERE concepto_id = ?', [id]);
        if (gastos.length > 0) {
            return res.status(400).json({ error: 'No se puede eliminar el concepto porque tiene gastos asociados' });
        }

        await db.conn.query('DELETE FROM conceptos WHERE id = ?', [id]);
        res.json({ message: 'Concepto eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el concepto' });
    }
});

module.exports = router;
