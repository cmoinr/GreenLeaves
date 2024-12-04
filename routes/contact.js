const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

// Contacto (formulario)
router.get('/contact', (req, res) => {
    res.render('contact');
});

// ContactsModel
class ContactsModel {
    constructor() {
        // Conexion a la base de datos
        this.db = new sqlite3.Database('db.sqlite');
        this.db.run('CREATE TABLE IF NOT EXISTS contacts (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT, name TEXT, message TEXT, ip TEXT, date TEXT)');
    }
    // Guardar los datos del formulario
    async save(email, name, message, ip, date) {
        return new Promise((resolve, reject) => {
            this.db.run('INSERT INTO contacts (email, name, message, ip, date) VALUES (?, ?, ?, ?, ?)', [email, name, message, ip, date], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
    // Recuperar los datos guardados en la base de datos
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

// Acceso a la clase 'ContactsModel'
const contactosModel = new ContactsModel();

// ContactsController
router.post('/send', async (req, res) => {
    // Datos obtenidos del formulario
    const { email, name, message, userIP } = req.body;
    const date = new Date().toISOString();

    // Validar los datos del formulario antes de guardarlos
    if (!email || !name || !message) {
        return res.status(400).send('Por favor, completa todos los campos');
    }

    try {
        // Llamar a la clase ContactosModel para guardar los datos
        await contactosModel.save(email, name, message, userIP, date);
        // Redireccionar al usuario a una página de confirmación o mostrar un mensaje de éxito
        res.redirect('/thanks');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al guardar los datos');
    }

});

// Muestra la informacion guardada en la base de datos
contactosModel.get_info()
    .then(contacts => {
        console.log("Database:\n");
        console.log(contacts);
    })
    .catch(err => {
        console.error('Error retrieving contacts:', err);
    });


module.exports = router;