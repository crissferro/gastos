// backend/index.js
const express = require('express');
const cors = require('cors');
const path = require('path'); // Importamos el módulo 'path'
const authRoutes = require('./routes/auth');
const rubrosRoutes = require('./routes/rubros');
const gastosRoutes = require('./routes/gastos');
const conceptosRoutes = require('./routes/conceptos');
const db = require('./models/db'); // Importar la conexión

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Ruta de prueba de conexión a la base de datos
app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await db.conn.query('SELECT 1'); // Ejecutar una consulta simple
        res.json({ message: 'Conexión a la base de datos exitosa', rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al conectar a la base de datos' });
    }
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/rubros', rubrosRoutes);
app.use('/api/gastos', gastosRoutes);
app.use('/api/conceptos', conceptosRoutes);

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, '../public')));
//app.use(express.static(path.resolve('public')));

// Ruta por defecto para servir index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
