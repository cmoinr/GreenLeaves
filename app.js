const express = require('express');
const path = require('path');
const contactosController = require('./contacts_controller');

const app = express();

// Configuración del motor de plantillas EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Servir archivos estáticos
// Configurar la ruta a los archivos estáticos usando una variable de entorno
const staticPath = process.env.STATIC_PATH || 'public';

app.use(express.static(path.join(__dirname, staticPath)));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rutas
app.get('/', (req, res) => {
    res.render('index'); // Renderiza la vista index.ejs
});

app.get('/benefits', (req, res) => {
  res.render('benefits');
});

app.get('/customers', (req, res) => {
  res.render('customers');
});

app.get('/services', (req, res) => {
  res.render('services');
});

app.get('/contact', (req, res) => {
  res.render('contact');
});

app.use('/contact', contactosController);

app.get('/thanks', (req, res) => {
  res.send('¡Gracias por tu mensaje!');
});

// Puerto de escucha
const port = 3000;
app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});