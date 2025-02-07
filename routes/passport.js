const passport = require('passport');
const express = require('express');
const session = require('express-session');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

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

// Inicio de sesion con Google
// async function loginGoogle(user) {
//   // Verificar si el nombre de usuario ya existe
//   const existingUser = await getData.get_user(user.email);
//   if (existingUser) {
//       const passwordMatch = await comparePassword(user.username, existingUser.password_hash);

//       if (passwordMatch) {
//           // Inicio de sesión exitoso
//           req.session.user = {
//               id: existingUser.id,
//               username: existingUser.username
//           };
//           return res.redirect('/contactos');
//       }
//   } else {
//       // Cifrar la contraseña
//       const hashedPassword = await hashPassword(user.username);

//       // Insertar el nuevo usuario en la base de datos
//       await getData.create_user(user.email, hashedPassword);

//       loginGoogle(user);
//   }
// };

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID_OAUTH,
    clientSecret: process.env.CLIENT_SECRET_OAUTH,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true
},
async function(accessToken, refreshToken, profile, done) {
    try {
      const user = {
        id: profile.id,
        username: profile.displayName,
        email: profile.emails[0].value
      };

      const existingUser = await getData.get_user(user.email); // Busca por email

      if (existingUser) {
        // Usuario existente, inicia sesión
        return done(null, existingUser);
      } else {
        // Hashea el username (o un valor único)
        const hashedPassword = await hashPassword(user.username);
        // Guarda con email y hash
        const newUser = await getData.create_user(user.email, hashedPassword);
        // Nuevo usuario, inicia sesión
        return done(null, newUser);
      }
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});


module.exports = passport;