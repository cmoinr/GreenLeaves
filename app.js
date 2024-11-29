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
    // Recuperar los datos guardados de la base de datos
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

const contactosModel = new ContactsModel();

// Rutas/secciones de la pagina web
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

// Contacto (formulario)
app.get('/contact', (req, res) => {
  res.render('contact');
});

// Pagina de agradecimiento (formulario)
app.get('/thanks', (req, res) => {
  res.render('thanks');
});

// ContactsController
app.post('/send', async (req, res) => {
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

// Puerto & informacion almacenada en la base de datos...
const port = 3000;
app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}\n`);

    console.log("Database:\n");
    contactosModel.get_info()
      .then(contacts => {
        console.log(contacts);
      })
      .catch(err => {
        console.error('Error retrieving contacts:', err);
      });

});