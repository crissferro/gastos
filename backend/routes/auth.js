// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/db');

const router = express.Router();
const secretKey = 'prueba_clave'; // Cambia esto por una clave secreta segura

// Ruta para registrar un usuario
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Verificar si el usuario ya existe
        const [existingUser] = await db.conn.query('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar el nuevo usuario en la base de datos
        await db.conn.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);

        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar el usuario' });
    }
});

// Ruta para el login de un usuario
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Buscar al usuario en la base de datos
        const [user] = await db.conn.query('SELECT * FROM users WHERE username = ?', [username]);

        if (user.length === 0) {
            return res.status(400).json({ error: 'Usuario o contraseña incorrectos' });
        }

        // Verificar la contraseña
        const isPasswordValid = await bcrypt.compare(password, user[0].password);

        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Usuario o contraseña incorrectos' });
        }

        // Generar un token JWT
        const token = jwt.sign({ id: user[0].id, username: user[0].username }, secretKey, { expiresIn: '1h' });

        res.json({ message: 'Login exitoso', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

module.exports = router;
