const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

// Middleware para proteger la ruta
// function requireAuth(req, res, next) {
//     if (req.isAuthenticated()) { // Verifica si el usuario está autenticado
//       next();
//     } else {
//       res.redirect('/login'); // Redirige al login si no está autenticado
//     }
// }

class GetData {
    constructor() {
        // Conexion a la base de datos
        this.db = new sqlite3.Database('db.sqlite');
        this.db.run('CREATE TABLE IF NOT EXISTS contacts (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT, name TEXT, message TEXT, ip TEXT, date TEXT)');
    }
    // Obtener los datos guardados en la base de datos
    async get_info() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM contacts', (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
            });
        });
    }
}

// Acceso a la clase 'GetData'
const getData = new GetData();
  
router.get('/contactos', async (req, res) => {
    try {
        const contactos = await getData.get_info(); // Obtén todos los contactos desde la base de datos
        res.render('contactos', { contactos }); // Renderiza la vista 'contactos.ejs' pasando los datos
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los contactos');
    }
});
  
module.exports = router;