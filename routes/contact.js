const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const nodemailer = require('nodemailer');

// Contacto (formulario)
router.get('/contact', (req, res) => {
    res.render('contact');
});

// Funcion para verificar el token (reCAPTCHA)
const verifyCaptcha = async (token, ip) => {
    const secretKey = '6Let8K8qAAAAANUHKjjIg1SgDjrQGpY-Xrx0kKj8';
    const verify = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}&remoteip=${ip}`;

    try {
        const recaptcha = await axios.post(verify);
        if (recaptcha.data.success) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
};

// Funcion para el envio del correo electronico
const sendEmail = async (name, email, message, userIP, country, date) => {    
    // Configurar el transporte del correo electronico
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: "cmoinieves@gmail.com",
          pass: "hell0Moises-"
        }
      });

    // Construccion del correo electronico
    const mailData = {
        from: 'cmoinieves@gmail.com',
        to: ['programacion2ais@dispostable.com', 'cmoinr@hotmail.com'],
        subject: 'GreenLeaves | Formulario de contacto',
        text: `
            Nombre:     ${name}
            Correo:     ${email}
            Comentario: ${message}
            IP:         ${userIP}
            País:       ${country}
            Fecha/Hora: ${date}
        `
    };

    // Envio del correo electronico   
    transporter.sendMail(mailData, (error, info) => {
        if (error) {
            console.error('Error al enviar el correo electrónico:', error);
            return false;
        } else {
            console.log('Correo electrónico enviado:', info.response);
            return true;
        }         
    })
};

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
    const { email, name, message, userIP, "g-recaptcha-response": token } = req.body;
    const date = new Date().toISOString();

    // Uso de la API [ipstack.com] (geolocalización por IP)
    const response = await axios.get(`http://api.ipstack.com/${userIP}?access_key=f8ff13db27bbc910d87fe504f4c6260e`);
    const country = response.data.country_name;

    // Validar los datos del formulario antes de guardarlos
    if (!email || !name || !message || !token) {
        return res.status(400).send('Por favor, completa todos los campos (incluyendo el reCAPTCHA)');
    }

    // Verificar la validez del token (reCAPTCHA)
    if (verifyCaptcha(token, userIP)) {

        // Verificar el envio del correo electronico
        if (sendEmail(name, email, message, userIP, country, date)) {

            // Llamar a la clase ContactosModel para guardar los datos
            await contactosModel.save(email, name, message, userIP, date, country);

            // Redireccionar al usuario a una página de confirmación o mostrar un mensaje de éxito
            res.redirect('/thanks');

        } else {
            res.status(400).send('Error Email: no se pudo enviar');
        }
    } else {
        res.status(400).send('reCAPTCHA: error de validacion');
    }
});


// Muestra la informacion guardada en la base de datos
contactosModel.get_info()
    .then(contacts => {
        console.log("Database:\n");
        console.log(contacts);
    })
    .catch(err => {
        console.error('Error:', err);
    });


module.exports = router;