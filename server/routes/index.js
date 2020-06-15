const express = require('express');
const router = express.Router();

router.post('/registration', (req, res) => {
  res.send('api/registration');
});

router.post('/login', (req, res) => {
  res.send('api/login');
});

module.exports = router;
