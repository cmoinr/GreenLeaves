const express = require('express');
const session = require('express-session');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const bcrypt = require('bcrypt');
const { google } = require("googleapis");
require('dotenv').config();

// Middleware para verificar si el usuario está autenticado antes de acceder a la ruta '/contactos'
function requireAuth(req, res, next) {
    if (req.session.user) {
        // El usuario está autenticado, permite el acceso
        next();
    } else {
        console.log(req.session.user);
        // El usuario no está autenticado, redirige a la página de inicio de sesión
        res.redirect('/login');
    }
}

// Obtener la informacion de los formularios enviados, guardados en la base de datos
class DataBase {
    constructor() {
        // Conexion a la base de datos
        this.db = new sqlite3.Database('db.sqlite');
    }
    // Obtener los datos almacenados, a traves de consulta SQL
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
    // Obtener los datos del usuario desde la base de datos
    async get_user(username) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }
    // Almacenar la info de un nuevo usuario
    async create_user(username, password_hash) {
        return new Promise((resolve, reject) => {
            this.db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, password_hash], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID); // Puedes resolver el ID del nuevo usuario si lo necesitas
                }
            });
        });
    }
};

// Acceso a la clase 'GetData'
const getData = new DataBase();

// Ruta autenticada con la informacion de los formularios enviados
router.get('/contactos', requireAuth, async (req, res) => {
    console.log(req.session.user);
    try {
        const title = 'Contactos';
        const contactos = await getData.get_info(); // Obtén todos los contactos desde la base de datos        
        res.render('contactos', { contactos, user:req.session.user, title, viewPath: 'admin_views/contactos' });
    } catch (error) {
        console.error(error);
        error.messageForUser = 'Error al obtener los contactos';     
        return res.render('error', { error, title: 'Error', viewPath: 'admin_views/error' });
    }
});

// Ruta para iniciar sesion
router.get('/login', (req, res) => {
    const title = 'Iniciar Sesión';

    res.render('login', {title, viewPath: 'admin_views/login'});
});

// Ruta para registrarse
router.get('/register', (req, res) => {
    const title = 'Registro';

    res.render('register', {title, viewPath: 'admin_views/register'});
});

// Ruta para cerrar y destruir la sesion 
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            res.redirect('/contactos');
        } else {
            res.redirect('/login');
        }
    });
});

// Funcion para verificar el token (reCAPTCHA)
const verifyCaptcha = async (token, ip) => {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
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

// Cifrado de contraseña antes de guardarse en la base de datos
async function hashPassword(password) {
    const saltRounds = 10; // Número de rondas de sal para bcrypt
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

// Verificacion de contraseña: compara la contraseña ingresada por el usuario con el hash almacenado
async function comparePassword(password, hash) {
    try {
        const match = await bcrypt.compare(password, hash);
        return match;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

// Solicitud para inicio de sesion
router.post('/login', async (req, res) => {
    // Datos obtenidos del formulario
    const { username, password, userIP, "g-recaptcha-response": token } = req.body;
    const error = new Error();

    // Validar los datos del formulario antes de verificar en la base de datos
    if (!username || !password || !token) {
        error.messageForUser = 'Por favor, completa todos los campos (incluyendo el reCAPTCHA)';
        return res.render('error', { error, title: 'Error', viewPath: 'admin_views/error' });
    }

    // Verificar la validez del token (reCAPTCHA)
    if (verifyCaptcha(token, userIP)) {
        try {
            // Obtener el usuario de la base de datos
            const user = await getData.get_user(username);      
            if (user) {
                const passwordMatch = await comparePassword(password, user.password_hash);
        
                if (passwordMatch) {
                    // Inicio de sesión exitoso
                    req.session.user = {
                        id: user.id,
                        username: user.username
                    };
                    return res.redirect('/contactos');
                } else {
                    error.messageForUser = 'Credenciales incorrectas';
                    return res.render('error', { error, title: 'Error', viewPath: 'admin_views/error' });
                }
            } else {
                error.messageForUser = 'Usuario no encontrado';
                return res.render('error', { error, title: 'Error', viewPath: 'admin_views/error' });
            }
        } catch (error) {
            console.error(error);
            error.messageForUser = 'Error al iniciar sesión';
            return res.render('error', { error, title: 'Error', viewPath: 'admin_views/error' });
        }
    } else {
        error.messageForUser = 'reCAPTCHA: error de validacion';     
        return res.render('error', { error, title: 'Error', viewPath: 'admin_views/error' });
    }
});

// Solicitud para registrarse
router.post('/register', async (req, res) => {
    // Datos obtenidos del formulario
    const { username, password, validate, userIP, "g-recaptcha-response": token } = req.body;
    const error = new Error();

    // Validar los datos del formulario antes de verificar en la base de datos
    if (!username || !password || !validate || !token) {
        error.messageForUser = 'Por favor, completa todos los campos (incluyendo el reCAPTCHA)';
        return res.render('error', { error, title: 'Error', viewPath: 'admin_views/error' });
    }

    // Verificar que las contrasenas coinciden
    if (password !== validate) {
        error.messageForUser = 'Las contraseñas no coinciden';
        return res.render('error', { error, title: 'Error', viewPath: 'admin_views/error' });
    }

    // Verificar la validez del token (reCAPTCHA)
    if (verifyCaptcha(token, userIP)) {
        try {
            // Verificar si el nombre de usuario ya existe
            const existingUser = await getData.get_user(username);
            if (existingUser) {
                error.messageForUser = 'El nombre de usuario ya existe';
                return res.render('error', { error, title: 'Error', viewPath: 'admin_views/error' });
            }

            // Cifrar la contraseña
            const hashedPassword = await hashPassword(password);

            // Insertar el nuevo usuario en la base de datos
            await getData.create_user(username, hashedPassword);

            // Redirigir al usuario a la página de inicio de sesión
            return res.redirect('/login');
        } catch (error) {
            console.error(error);
            error.messageForUser = 'Error al registrar el usuario';
            return res.render('error', { error, title: 'Error', viewPath: 'admin_views/error' });
        }
    } else {
        error.messageForUser = 'reCAPTCHA: error de validacion';     
        return res.render('error', { error, title: 'Error', viewPath: 'admin_views/error' });
    }
});


module.exports = router;