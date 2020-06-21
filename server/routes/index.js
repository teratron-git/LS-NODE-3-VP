const express = require('express');
const userCtrl = require('../controllers/userCtrl');
const newsCtrl = require('../controllers/newsCtrl');
// const authMdwr = require('../middleware/auth');
const router = express.Router();
var multer = require('multer');
var upload = multer({ dest: 'build/uploads/' });

router.post('/registration', userCtrl.registration);
router.post('/login', userCtrl.logIn);
router.post('/refresh-token', userCtrl.refreshTokens);

router.get('/profile', userCtrl.getProfile);
router.patch('/profile', upload.single('avatar'), userCtrl.changeProfile);

router.get('/users', userCtrl.getAllUsers);
router.patch('/users/:id/permission', userCtrl.changeUserPermission);
router.delete('/users/:id', userCtrl.deleteUser);

router.get('/news', newsCtrl.getAllNews);
router.post('/news', newsCtrl.createNews);

//TODO

router.patch('/news/:id', (req, res) => {
  console.log('PATCH /api/news/:id');
  res.send('PATCH /api/news/:id');
});

router.delete('/news/:id', (req, res) => {
  console.log('DELETE /api/news/:id');
  res.send('DELETE /api/news/:id');
});

module.exports = router;
