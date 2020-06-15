const mongoose = require('mongoose');
const express = require('express');
const userCtrl = require('../controllers/userCtrl');
const router = express.Router();

router.post('/registration', userCtrl.registration);

router.post('/login', userCtrl.logIn);

module.exports = router;
