const express = require('express');
const userCtrl = require('../controllers/userCtrl');
const authMdwr = require('../middleware/auth');
const router = express.Router();

router.post('/registration', userCtrl.registration);
router.post('/login', userCtrl.logIn);
// router.get('/profile', userCtrl.getProfile);
router.post('/refresh-token', userCtrl.refreshTokens);

//TODO

router.patch('/profile', (req, res) => {
  console.log('PATCH /api/profile');
  res.send('PATCH /api/profile');
});

router.delete('/users/:id', (req, res) => {
  console.log('DELETE /api/users/:id');
  res.send('DELETE /api/users/:id');
});

router.get('/news', (req, res) => {
  console.log('GET /api/news');
  res.send('GET /api/news');
});

router.post('/news', (req, res) => {
  console.log('POST /api/news');
  res.send('POST /api/news');
});

router.patch('/news/:id', (req, res) => {
  console.log('PATCH /api/news/:id');
  res.send('PATCH /api/news/:id');
});

router.delete('/news/:id', (req, res) => {
  console.log('DELETE /api/news/:id');
  res.send('DELETE /api/news/:id');
});

router.get('/users', (req, res) => {
  console.log('GET /api/users');
  res.send('GET /api/users');
});

router.patch('/users/:id/permission', (req, res) => {
  console.log('PATCH /api/users/:id/permission');
  res.send('PATCH /api/users/:id/permission');
});

module.exports = router;
