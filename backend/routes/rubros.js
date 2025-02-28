// backend/routes/rubros.js
const express = require('express');
const db = require('../models/db'); // Importamos la conexión a la base de datos
const authenticate = require('../authMiddleware'); // Importamos el middleware de autenticación

const router = express.Router();

/**
 * @description Agrega un nuevo rubro a la base de datos.
 * @route POST /api/rubros
 * @access Private
 * @param {string} nombre - Nombre del rubro a agregar.
 * @returns {object} - Mensaje de éxito o error.
 */
router.post('/', authenticate, async (req, res) => {
    try {
        const { nombre } = req.body; // Obtenemos el nombre del rubro del cuerpo de la petición
        console.log("backend nombre: ", nombre);
        // Verificar si el nombre está vacío
        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({ error: 'El nombre del rubro no puede estar vacío' });
        }

        //Verificar si existe un rubro con ese nombre
        const [existingRubro] = await db.conn.query('SELECT * FROM rubros WHERE nombre = ?', [nombre]);
        if (existingRubro.length > 0) {
            //Si existe, retornamos un error y NO seguimos con el codigo.
            return res.status(400).json({ error: 'El rubro ya existe' });
        }

        // Insertamos el nuevo rubro en la base de datos
        await db.conn.query('INSERT INTO rubros (nombre) VALUES (?)', [nombre]);
        // Respondemos con un mensaje de éxito
        res.status(201).json({ message: 'Rubro agregado exitosamente' });
    } catch (error) {
        console.error(error); // Mostramos el error en la consola
        res.status(500).json({ error: 'Error al agregar el rubro' }); // Respondemos con un error 500
    }
});

/**
 * @description Obtiene todos los rubros de la base de datos.
 * @route GET /api/rubros
 * @access Private
 * @returns {array} - Lista de rubros.
 */
router.get('/', authenticate, async (req, res) => {
    try {
        // Obtenemos todos los rubros de la base de datos
        const [rows] = await db.conn.query('SELECT * FROM rubros');

        // Respondemos con la lista de rubros
        res.json(rows);
    } catch (error) {
        console.error(error); // Mostramos el error en la consola
        res.status(500).json({ error: 'Error al obtener los rubros' }); // Respondemos con un error 500
    }
});

/**
 * @description Modifica un rubro existente en la base de datos.
 * @route PUT /api/rubros/:id
 * @access Private
 * @param {number} id - ID del rubro a modificar.
 * @param {string} nombre - Nuevo nombre del rubro.
 * @returns {object} - Mensaje de éxito o error.
 */
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params; // Obtenemos el ID del rubro de los parámetros de la URL
        const { nombre } = req.body; // Obtenemos el nuevo nombre del cuerpo de la petición

        // Verificamos si el rubro tiene conceptos asociados
        const [conceptos] = await db.conn.query('SELECT * FROM conceptos WHERE rubro_id = ?', [id]);
        if (conceptos.length > 0) {
            // Si tiene conceptos asociados, respondemos con un error
            return res.status(400).json({ error: 'No se puede modificar el rubro porque tiene conceptos asociados' });
        }

        // Modificamos el rubro en la base de datos
        await db.conn.query('UPDATE rubros SET nombre = ? WHERE id = ?', [nombre, id]);

        // Respondemos con un mensaje de éxito
        res.json({ message: 'Rubro actualizado exitosamente' });
    } catch (error) {
        console.error(error); // Mostramos el error en la consola
        res.status(500).json({ error: 'Error al actualizar el rubro' }); // Respondemos con un error 500
    }
});

/**
 * @description Elimina un rubro de la base de datos, siempre y cuando no tenga gastos asociados.
 * @route DELETE /api/rubros/:id
 * @access Private
 * @param {number} id - ID del rubro a eliminar.
 * @returns {object} - Mensaje de éxito o error.
 */
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params; // Obtenemos el ID del rubro de los parámetros de la URL

        // Verificamos si el rubro tiene conceptos asociados
        const [conceptos] = await db.conn.query('SELECT * FROM conceptos WHERE rubro_id = ?', [id]);
        if (conceptos.length > 0) {
            // Si tiene conceptos asociados, respondemos con un error
            return res.status(400).json({ error: 'No se puede eliminar el rubro porque tiene conceptos asociados' });
        }

        // Verificamos si el rubro tiene gastos asociados
        const [gastos] = await db.conn.query('SELECT * FROM gastos g LEFT JOIN conceptos c ON g.concepto_id = c.id WHERE c.rubro_id = ?', [id]);

        if (gastos.length > 0) {
            // Si tiene gastos asociados, respondemos con un error
            return res.status(400).json({ error: 'No se puede eliminar el rubro porque tiene gastos asociados' });
        }

        // Eliminamos el rubro de la base de datos
        await db.conn.query('DELETE FROM rubros WHERE id = ?', [id]);

        // Respondemos con un mensaje de éxito
        res.json({ message: 'Rubro eliminado exitosamente' });
    } catch (error) {
        console.error(error); // Mostramos el error en la consola
        res.status(500).json({ error: 'Error al eliminar el rubro' }); // Respondemos con un error 500
    }
});

module.exports = router;
