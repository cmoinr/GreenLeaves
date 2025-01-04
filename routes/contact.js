const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const nodemailer = require('nodemailer');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const OAuth2 = require('nodemailer-oauth2');

// testing this
const createAssessment = require('./recaptcha');

// Contacto (formulario)
router.get('/contact', (req, res) => {
    res.render('contact');
});

passport.use(new GoogleStrategy({
    clientID: "48331960941-dcevsjrp1m86ete3at04fiqc24hdl40s.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "http://localhost:2700/send"
  },
  function(accessToken, refreshToken, profile, done) {
    // Aquí puedes guardar la información del usuario en tu base de datos, si es necesario
    return done(null, profile);
  }
));

let oauth2 = new OAuth2({
    user: 'cmoinieves@gmail.com', // Utiliza el correo asociado a tu proyecto de GCP
    clientId: "48331960941-dcevsjrp1m86ete3at04fiqc24hdl40s.apps.googleusercontent.com",
    clientSecret: "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",
    refreshToken: REFRESH_TOKEN, // Obtendrás este token después del primer inicio de sesión
    accessTokenUri: 'https://oauth2.googleapis.com/token'
});

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: 'cmoinieves@gmail.com',
        clientId: "48331960941-dcevsjrp1m86ete3at04fiqc24hdl40s.apps.googleusercontent.com",
        clientSecret: "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",
        refreshToken: REFRESH_TOKEN,
        accessToken: oauth2.accessToken
    }
});

// const transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com',
//     port: 587,
//     secure: false,
//     auth: {
//         user: 'cmoinr@hotmail.com',
//         pass: 'hell0Moises-'
//     }
// });

// Funcion para verificar el token (reCAPTCHA)
const verifyCaptcha = async (token) => {
    const secretKey = '6LfnUq0qAAAAALB3Y3DtLjM8YoLFXuO4beUl0A1L';
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`; // ?secret=${secretKey}&response=${token}

    try {
        const response = await axios.post(verifyUrl, {
            secret: secretKey,
            response: token,
        });

        if (!response.data.success) {
            return true;
        }

    } catch (error) {
        console.error('Error al verificar el reCAPTCHA:', error);
        return false;
    }

    // request(verifyUrl, (err, response, body) => {
    //     if(err) {
    //         console.log(err);
    //     }

    //     body = JSON.parse(body);

    //     if(!body.success && body.success === undefined) {
    //         return res.json({"success":false, "msg":"captcha verification failed"});
    //     }
    //     else if(body.score < 0.5) {
    //         return res.json({"success":false, "msg":"you might be a bot, sorry!", "score": body.score});
    //     }        
    //     // return json message or continue with your function. Example: loading new page, ect
    //     return res.json({"success":true, "msg":"captcha verification passed", "score": body.score});
    // })
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
    const { email, name, message, userIP, 'g-recaptcha-response': token } = req.body;
    const date = new Date().toISOString();

    // Uso de la API [ipstack.com] (geolocalización por IP)
    const response = await axios.get(`http://api.ipstack.com/${userIP}?access_key=f8ff13db27bbc910d87fe504f4c6260e`);
    const country = response.data.country_name;

    // Validar el token de reCAPTCHA
    if(!token) {
        return res.status(400).send('reCAPTCHA error');
    }

    // Validar los datos del formulario antes de guardarlos
    if (!email || !name || !message) {
        return res.status(400).send('Por favor, completa todos los campos');
    }

    // Construccion del correo electronico
    const mailData = {
        from: 'GreenLeaves <cmoinieves@gmail.com>',
        to: ['programacion2ais@dispostable.com'],
        subject: 'GreenLeaves | Formulario de contacto',
        text: `
            Nombre: ${name}
            Correo: ${email}
            Comentario: ${message}
            IP: ${userIP}
            País: ${country}
            Fecha/Hora: ${date}
        `
    };

    try {
        // const verificationResult = await createAssessment({
        //     token,
        //     recaptchaAction: 'submit',
        //     // ... otros parámetros si es necesario
        // });

        if (await verifyCaptcha(token)) { // verificationResult.success || 
            // El token es válido, procesar el formulario

            // Llamar a la clase ContactosModel para guardar los datos
            await contactosModel.save(email, name, message, userIP, date, country);

            // Envio del correo electronico
            transporter.sendMail(mailData, (error, info) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email enviado: ' + info.response);
                }
            });

            // Redireccionar al usuario a una página de confirmación o mostrar un mensaje de éxito
            res.redirect('/thanks');
        } else {
            res.status(400).send('Error al verificar el reCAPTCHA');
        }
    } catch (error) {
        console.error('Error al verificar el reCAPTCHA:', error);
        res.status(500).send('Error del servidor');
    }

    // if (await verifyCaptcha(token)) {
    //     // Procesar los datos del formulario
    //     try {
                 
    //     } catch (error) {
    //         console.error(error);
    //         res.status(500).send('Error al guardar los datos');
    //     }   
    // } else {
    //     res.status(400).send('Por favor, completa el reCAPTCHA');
    // }
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