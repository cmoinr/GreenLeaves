const express = require('express');
const ContactsModel = require('./contacts_model');

const router = express.Router();
const contactosModel = new ContactsModel();

router.post('/contact', async (req, res) => {
    const { email, name, message } = req.body;
    const ip = req.ip;
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
});

module.exports = router;