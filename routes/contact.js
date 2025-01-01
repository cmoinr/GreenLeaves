const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

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
    async save(email, name, message, ip, date, country) {
        return new Promise((resolve, reject) => {
            this.db.run('INSERT INTO contacts (email, name, message, ip, date, country) VALUES (?, ?, ?, ?, ?, ?)', [email, name, message, ip, date, country], (err) => {
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
    const { email, name, message, userIP, token } = req.body;
    const date = new Date().toISOString();

    // Uso de la API [ipstack.com] (geolocalización por IP)
    const response = await axios.get(`http://api.ipstack.com/${userIP}?access_key=f8ff13db27bbc910d87fe504f4c6260e`);
    const country = response.data.country_name;

    // Validar los datos del formulario antes de guardarlos
    if (!email || !name || !message) {
        return res.status(400).send('Por favor, completa todos los campos');
    }

    // Verificar el token de reCAPTCHA
    const captcha = await axios.post('https://www.google.com/recaptcha/api/siteverify', {
        secret: '6LcshKsqAAAAAEXYicq12i1lIEz_3ohMNFxxfshx',
        response: token
    });

    if (captcha.data.success) {
        // Si el token es válido, procesar los datos del formulario
        try {
            // Llamar a la clase ContactosModel para guardar los datos
            await contactosModel.save(email, name, message, userIP, date, country);
            // Redireccionar al usuario a una página de confirmación o mostrar un mensaje de éxito
            res.redirect('/thanks');
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al guardar los datos');
        }
    } else {
        console.error('Formulario inválido');
        res.status(500).send('Error al enviar el formulario');
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