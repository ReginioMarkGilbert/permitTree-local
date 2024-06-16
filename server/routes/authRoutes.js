const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const router = express.Router();
const { signup, login, logout } = require('../controllers/authControllers');

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);

module.exports = router;
