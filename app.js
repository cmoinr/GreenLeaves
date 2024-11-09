const express = require('express');
const path = require('path');

const app = express();

// Configuración del motor de plantillas EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Servir archivos estáticos
// Configurar la ruta a los archivos estáticos usando una variable de entorno
const staticPath = process.env.STATIC_PATH || 'public';

app.use(express.static(path.join(__dirname, staticPath)));

// Rutas
app.get('/', (req, res) => {
    res.render('index'); // Renderiza la vista index.ejs
});

app.get('/music', (req, res) => {
    res.render('music');
});

app.get('/programming', (req, res) => {
  res.render('programming');
});

app.get('/sports', (req, res) => {
  res.render('sports');
});

app.get('/aboutme', (req, res) => {
  res.render('aboutme');
});

// Puerto de escucha
const port = 3000;
app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});