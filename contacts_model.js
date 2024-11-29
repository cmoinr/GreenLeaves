const sqlite3 = require('sqlite3').verbose();

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

module.exports = ContactsModel;