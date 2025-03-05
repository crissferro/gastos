// backend/routes/gastos.js
const express = require('express');
const db = require('../models/db');
const authenticate = require('../authMiddleware');

const router = express.Router();

// Ruta para agregar un gasto
router.post('/', authenticate, async (req, res) => {
    try {
        const { monto, concepto_id, mes, anio, fecha_vencimiento, pagado } = req.body;
        // Agrega console.log para verificar los datos
        console.log('Datos recibidos en /api/gastos:', { monto, concepto_id, mes, anio, fecha_vencimiento, pagado });

        //obtener la fecha sin la hora.
        const fecha = new Date().toLocaleDateString('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });

        //validaciones
        if (!monto || !concepto_id || !mes || !anio) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }
        //validar si la fecha es vacia.
        let fechaVencimiento = fecha_vencimiento;
        if (!fechaVencimiento) {
            fechaVencimiento = null;
        }
        let query = 'INSERT INTO gastos (fecha, monto, concepto_id, mes, anio, fecha_vencimiento';
        const params = [fecha, monto, concepto_id, mes, anio, fechaVencimiento];
        //Si viene el dato pagado, agregarlo a la query.
        if (pagado != undefined) {
            query += ', pagado)';
            query += ' VALUES (?, ?, ?, ?, ?, ?, ?)';
            params.push(pagado);
        } else {
            query += ')';
            query += ' VALUES (?, ?, ?, ?, ?, ?)';
        }

        await db.conn.query(query, params);
        res.status(201).json({ message: 'Gasto agregado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al agregar el gasto' });
    }
});

// Ruta para obtener todos los gastos
router.get('/', authenticate, async (req, res) => {
    try {
        const { mes, rubro, concepto, pagado, fechaVencimientoDesde, fechaVencimientoHasta } = req.query;
        let query = `
            SELECT 
                g.id,
                g.fecha, 
                g.monto, 
                g.fecha_vencimiento,
                g.mes,
                g.anio,
                c.nombre AS concepto_nombre, 
                r.nombre AS rubro_nombre,
                g.pagado,
                g.concepto_id
            FROM gastos g 
            LEFT JOIN conceptos c ON g.concepto_id = c.id
            LEFT JOIN rubros r ON c.rubro_id = r.id
        `;
        const params = [];

        if (mes) {
            query += (params.length > 0 ? ' AND' : ' WHERE') + ' g.mes = ?';
            params.push(mes);
        }
        if (rubro) {
            query += (params.length > 0 ? ' AND' : ' WHERE') + ' r.id = ?';
            params.push(rubro);
        }
        if (concepto) {
            query += (params.length > 0 ? ' AND' : ' WHERE') + ' c.id = ?';
            params.push(concepto);
        }
        if (pagado) {
            query += (params.length > 0 ? ' AND' : ' WHERE') + ' g.pagado = ?';
            //Convertir el valor a boolean
            params.push(pagado === 'true' ? true : false);
        }

        if (fechaVencimientoDesde && fechaVencimientoHasta) {
            query += (params.length > 0 ? ' AND' : ' WHERE') + ' g.fecha_vencimiento BETWEEN ? AND ?';
            //Agregar la hora a los parametros
            params.push(`${fechaVencimientoDesde} 00:00:00`, `${fechaVencimientoHasta} 23:59:59`);
        } else if (fechaVencimientoDesde) {
            query += (params.length > 0 ? ' AND' : ' WHERE') + ' g.fecha_vencimiento >= ?';
            params.push(`${fechaVencimientoDesde} 00:00:00`);
        } else if (fechaVencimientoHasta) {
            query += (params.length > 0 ? ' AND' : ' WHERE') + ' g.fecha_vencimiento <= ?';
            params.push(`${fechaVencimientoHasta} 23:59:59`);
        }
        const [rows] = await db.conn.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los gastos' });
    }
});
// Ruta para modificar un gasto
router.put('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { pagado } = req.body;
    try {
        // Se modifica la query, para que solo actualice el campo pagado
        await db.conn.query('UPDATE gastos SET pagado = ? WHERE id = ?', [pagado, id]);
        res.json({ message: 'Gasto actualizado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el gasto' });
    }
});

// Ruta para obtener un gasto por su id
router.get('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    try {
        // Se agrego el campo concepto_id a la query
        const [rows] = await db.conn.query('SELECT * FROM gastos WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Gasto no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el gasto' });
    }
});

module.exports = router;
