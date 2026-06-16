const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

//POST - Cadastro
router.post('/register', authController.register);

//POST - Login
router.post('/login', authController.login);

module.exports = router;