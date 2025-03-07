const jwt = require('jsonwebtoken');

const secretKey = 'prueba_clave'; //deberia ser una variable de entorno

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' });
        }
        req.user = decoded; // Agregar información del usuario al request
        next(); // Continuar con la ejecución
    });
};

module.exports = authenticate;
