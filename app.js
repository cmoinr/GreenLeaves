const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();

// Configuración del motor de plantillas EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Servir archivos estáticos
// Configurar la ruta a los archivos estáticos usando una variable de entorno
const staticPath = process.env.STATIC_PATH || 'public';

app.use(express.static(path.join(__dirname, staticPath)));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

class ContactsModel {
  constructor() {
      this.db = new sqlite3.Database('db.sqlite');
      this.db.run('CREATE TABLE IF NOT EXISTS contacts (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT, name TEXT, message TEXT, ip TEXT, date TEXT)');
  }

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
}

const contactosModel = new ContactsModel();

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

app.get('/thanks', (req, res) => {
  res.send('¡Gracias por tu mensaje!');
});

app.get('/contact', (req, res) => {
  res.render('contact');
});

app.post('/send', async (req, res) => {

  try {
      // Obtener direccion IPv4
      const publicIp = await import('public-ip');
      const ip = await publicIp.v4();
      
      const { email, name, message } = req.body;
      const date = new Date().toISOString();

        // Validación básica (puedes agregar más validaciones)
      if (!email || !name || !message) {
          return res.status(400).send('Por favor, completa todos los campos');
      }

      try {
          await contactosModel.save(email, name, message, ip, date);
          res.redirect('/thanks');
      } catch (error) {
          console.error(error);
          res.status(500).send('Error al guardar los datos');
      }
  } catch (err) {
      console.error(err);
      res.status(500).send('Error al obtener la dirección IP');
  }
});

// Puerto
const port = 3000;
app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});