const express = require('express');
const contactController = require('../../controllers/userControllers/contactController');

const router = express.Router();

router.post('/contact', contactController.sendContactForm);

module.exports = router;
