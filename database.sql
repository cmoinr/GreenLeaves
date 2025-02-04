-- Almacenar el país del usuario en la base de datos
ALTER TABLE contacts
ADD COLUMN country TEXT;

-- Modelo 'User' para sistema de autenticacion
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password_hash TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);