const express = require('express');
const session = require('express-session');
const path = require('path');
// const passport = require('./routes/passport');

const app = express();

var contactRouter = require('./routes/contact');
var listRouter = require('./routes/contactos');
var adminActions = require('./routes/admin_actions');

// Configuración del motor de plantillas EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Configuración de sesiones
app.use(session({
    secret: 'secret_rdm', // Cambia esto por un secreto aleatorio
    resave: false,
    saveUninitialized: false
  }));
  
// Inicializa Passport.js
// app.use(passport.initialize());
// app.use(passport.session());

// Servir archivos estáticos
// Configurar la ruta a los archivos estáticos usando una variable de entorno
const staticPath = process.env.STATIC_PATH || 'public';

app.use(express.static(path.join(__dirname, staticPath)));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// *** Rutas/secciones de la pagina web *** //

// Formulario, ContactsController & ContactsModel
app.use('/', contactRouter);

// Ver el contenido de la base de datos
app.use('/', listRouter);

// Iniciar sesion y Registrarse (admin)
app.use('/', adminActions);

// Home
app.get('/', (req, res) => {
    res.render('index');
});

// Ubicación
app.get('/location', (req, res) => {
    res.render('location');
});

// Beneficios
app.get('/benefits', (req, res) => {
    res.render('benefits');
});

// Clientes
app.get('/customers', (req, res) => {
    res.render('customers');
});

// Servicios
app.get('/services', (req, res) => {
    res.render('services');
});

// Pagina de agradecimiento (formulario)
app.get('/thanks', (req, res) => {
    res.render('thanks');
});

// Mensaje personalizado de error
app.get('/error', (req, res) => {
    res.render('error');
});

// TESTING ADDS
// const authRoutes = require('./routes/auth');
// app.use('/', authRoutes);

// const contactosRoutes = require('./routes/contactos');
// app.use('/', contactosRoutes);

// Puerto del servidor
const port = 2700;
app.listen(port, () => {
    console.log(`Servidor activo en el puerto ${port}\n`);
});

module.exports = app;