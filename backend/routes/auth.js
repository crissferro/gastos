const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models/db");

const router = express.Router();

// Registro de usuario
router.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query("INSERT INTO usuarios (username, password) VALUES (?, ?)",
        [username, hashedPassword],
        (err, result) => {
            if (err) return res.status(500).json({ error: "Error al registrar usuario" });
            res.json({ message: "Usuario registrado exitosamente" });
        }
    );
});

// Login (usando bcrypt para comparar)
router.post("/login", (req, res) => {
    const { username, password } = req.body;

    db.query("SELECT * FROM usuarios WHERE username = ?", [username], async (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ error: "Usuario no encontrado" });

        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) return res.status(401).json({ error: "Contraseña incorrecta" });

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    });
});

module.exports = router;
