const mysql = require('mysql2');


const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gestor_gastos',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

/*
const pool = mysql.createPool({
    host: '192.168.1.17',
    user: 'root',
    password: 'Luca2014',
    database: 'gestor_gastos',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
*/

module.exports = {
    conn: pool.promise()
};
