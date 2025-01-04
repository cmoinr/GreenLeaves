const express = require('express');
const path = require('path');
// const bodyParser = require('body-parser');
// const request = require('request');

const app = express();

var contactRouter = require('./routes/contact');

// Configuración del motor de plantillas EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Servir archivos estáticos
// Configurar la ruta a los archivos estáticos usando una variable de entorno
const staticPath = process.env.STATIC_PATH || 'public';

app.use(express.static(path.join(__dirname, staticPath)));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// app.use(bodyParser.urlencoded({extended:false}));
// app.use(bodyParser.json());

// *** Rutas/secciones de la pagina web *** //

// Formulario, ContactsController & ContactsModel
app.use('/', contactRouter)

// Home
app.get('/', (req, res) => {
    res.render('index'); // Renderiza la vista index.ejs
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

// Puerto & informacion almacenada en la base de datos...
const port = 3000;
app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}\n`);
});

module.exports = app;