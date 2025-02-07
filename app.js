const express = require('express');
const session = require('express-session');
const path = require('path');
const passport = require('./routes/passport');
var layouts = require('express-ejs-layouts');
const flash = require('connect-flash');

const app = express();

var contactRouter = require('./routes/contact');
var adminActions = require('./routes/admin_actions');
const { libraryagent } = require('googleapis/build/src/apis/libraryagent');

// Configuración del motor de plantillas EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(layouts);
app.set('layout');
app.use(flash());

// Configuración de sesiones
app.use(session({
    secret: '4JQZ/0U77b6cLPstac63Ocj309AXNRT2n522KUHFbUg=',
    resave: false,
    saveUninitialized: false,
    // Configurar de cookies seguras
    cookie: {
        httpOnly: true,
        sameSite: 'Lax', // o 'Strict' en producción
        secure: false, // process.env.NODE_ENV === 'production', // Solo en producción
        maxAge: 15 * 60 * 1000 // 15 minutos de inactividad
    }
}));

// Middleware para verificar la inactividad
app.use((req, res, next) => {
    if (req.session.lastActivity && Date.now() - req.session.lastActivity > 15 * 60 * 1000) {
        req.session.destroy(() => {
            res.redirect('/login');
        });
    } else {
        req.session.lastActivity = Date.now();
        next();
    }
});

// Servir archivos estáticos
// Configurar la ruta a los archivos estáticos usando una variable de entorno
const staticPath = process.env.STATIC_PATH || 'public';

app.use(express.static(path.join(__dirname, staticPath)));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(passport.initialize());
app.use(passport.session());

// *** Rutas/secciones de la pagina web *** //

// Formulario, ContactsController & ContactsModel
app.use('/', contactRouter);

// Ver el contenido de la base de datos | Iniciar sesion y Registrarse (admins)
app.use('/', adminActions);

// Home
app.get('/', (req, res) => {
    // Metadatos personalizados | Protocolo Open Graph
    const title = 'Home';
    const header_01 = 'Expertos en el cuidado de tu jardín';
    const header_02 = 'Sabemos lo importante que son estos espacios. Las áreas verdes dan vida a los ambientes.';
    const header_03 = 'Más de 30 años de trayectoria!';
    
    const carousel_title01 = 'Un acabado extraordinario';
    const carousel_caption01 = 'Buscamos que cada servicio sea impresionante.';
    const carousel_img01 = 'https://images.pexels.com/photos/147640/pexels-photo-147640.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

    const carousel_title02 = 'Decoraciones de película';
    const carousel_caption02 = 'Tu imaginación es el límite. Somos capaces de materializarla.';
    const carousel_img02 = 'https://images.pexels.com/photos/259463/pexels-photo-259463.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

    const carousel_title03 = 'Flores, cactus y plantas únicas';
    const carousel_caption03 = 'Amplio catálogo disponible para decorar tu jardín.';
    const carousel_img03 = 'https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

    const bio_img01 = 'https://images.pexels.com/photos/14688972/pexels-photo-14688972.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
    const bio_img02 = 'https://images.pexels.com/photos/208321/pexels-photo-208321.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
    const bio_img03 = 'https://images.pexels.com/photos/15975968/pexels-photo-15975968/free-photo-of-ciudad-paisaje-naturaleza-rojo.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

    const bio_txt01 = 'Desde 1990,';
    const bio_txt02 = 'nos hemos dedicado a la creacion de espacios naturales encantadores,';
    const bio_txt03 = 'a reinventar la "jardinería" con su infinidad de técnicas y';
    const bio_txt04 = 'a cautivar cada mirada que detalla y se sumerge en nuestros ambientes.';
    const bio_txt05 = '"Tu jardín, nuestra naturaleza"';
    const bio_txt06 = 'porque así lo hemos demostrado y así lo sentimos.';
    const bio_txt07 = 'Carlos, el fundador de este proyecto, a menudo cuenta esta inspiradora anécdota:';

    res.render('index', {
        title, 
        header_01, 
        header_02, 
        header_03,
        carousel_caption01,
        carousel_caption02,
        carousel_caption03,
        carousel_img01,
        carousel_img02,
        carousel_img03,
        carousel_title01,
        carousel_title02,
        carousel_title03,
        bio_img01,
        bio_img02,
        bio_img03,
        bio_txt01,
        bio_txt02,
        bio_txt03,
        bio_txt04,
        bio_txt05,
        bio_txt06,
        bio_txt07,
        viewPath: 'index'
    });
});

// Ubicación
app.get('/location', (req, res) => {
    const title = 'Ubicación';

    res.render('location', {title, viewPath: 'location'});
});

// Servicios
app.get('/services', (req, res) => {
    const title = 'Servicios';

    res.render('services', {title, viewPath: 'services'});
});

// Beneficios
app.get('/benefits', (req, res) => {
    const title = 'Beneficios'

    res.render('benefits', {title, viewPath: 'benefits'});
});

// Clientes
app.get('/customers', (req, res) => {
    const title = 'Clientes';

    res.render('customers', {title, viewPath: 'customers'});
});

// Pagina de agradecimiento (formulario)
app.get('/thanks', (req, res) => {
    const title = 'Gracias';

    res.render('thanks', {title, viewPath: 'thanks'});
});

// Mensaje personalizado de error
app.get('/error', (req, res) => {
    const title = 'Error';
    res.render('error', {title, viewPath: 'error'});
});

// Rutas de autenticación con Google
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
        // Autenticación exitosa, redirige al usuario a la página deseada
        req.session.user = req.user;
        console.log(req.user);
        res.redirect('/contactos'); // Redirige a /contactos
    }
);

// Puerto del servidor
const port = 2700;
app.listen(port, () => {
    console.log(`Servidor activo en el puerto ${port}\n`);
});

module.exports = app;